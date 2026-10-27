from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import hash_password, verificar_password, crear_access_token
from app.models.usuario import Usuario
from app.schemas.auth import (
    RegistroRequest,
    LoginRequest,
    TokenResponse,
    UsuarioActualResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: RegistroRequest, db: Session = Depends(get_db)):
    """
    Registro público de usuario.
    El usuario queda en estado "pendiente" hasta que un Admin lo apruebe.
    """
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese email",
        )

    if db.query(Usuario).filter(Usuario.cedula == datos.cedula).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con esa cédula",
        )

    nuevo_usuario = Usuario(
        cedula=datos.cedula,
        nombres=datos.nombres,
        apellidos=datos.apellidos,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol="pendiente",
        activo=False,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "mensaje": "Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.",
        "usuario_id": nuevo_usuario.id,
    }


@router.post("/login", response_model=TokenResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    """
    Login con email y contraseña. Devuelve un token JWT.
    """
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta aún no ha sido aprobada por un administrador",
        )

    token = crear_access_token(data={"sub": usuario.email, "rol": usuario.rol})

    return TokenResponse(
        access_token=token,
        usuario={
            "id": usuario.id,
            "cedula": usuario.cedula,
            "nombres": usuario.nombres,
            "apellidos": usuario.apellidos,
            "email": usuario.email,
            "rol": usuario.rol,
            "campus_asignado_id": usuario.campus_asignado_id,
        },
    )


@router.get("/me", response_model=UsuarioActualResponse)
def obtener_usuario_actual(usuario: Usuario = Depends(get_current_user)):
    """
    Devuelve los datos del usuario autenticado.
    """
    return usuario


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(datos: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicita un código de recuperación de contraseña.
    Envía el código por email.
    """
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    # Por seguridad, siempre devolver el mismo mensaje
    mensaje_generico = (
        "Si el email está registrado, recibirás un código de recuperación. "
        "Revisa tu bandeja de entrada (y spam)."
    )

    if not usuario:
        return ForgotPasswordResponse(mensaje=mensaje_generico)

    # Generar código de 6 dígitos
    codigo = str(random.randint(100000, 999999))
    expiracion = datetime.now(timezone.utc) + timedelta(minutes=15)

    usuario.reset_code = codigo
    usuario.reset_code_expires = expiracion
    db.commit()

    # Enviar email
    from app.services.email_service import enviar_codigo_recuperacion

    email_enviado = await enviar_codigo_recuperacion(
        email_destino=datos.email,
        codigo=codigo,
        nombre_usuario=f"{usuario.nombres} {usuario.apellidos}",
    )

    if not email_enviado:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo enviar el código. Intenta de nuevo más tarde.",
        )

    print(f"📧 Código de recuperación enviado a {datos.email}")

    return ForgotPasswordResponse(mensaje=mensaje_generico)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Restablece la contraseña usando el código de recuperación.
    """
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado",
        )

    # Validar código
    if not usuario.reset_code or usuario.reset_code != datos.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado",
        )

    # Validar expiración
    if usuario.reset_code_expires:
        expiracion = usuario.reset_code_expires
        if expiracion.tzinfo is None:
            expiracion = expiracion.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expiracion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código ha expirado. Solicita uno nuevo.",
            )

    # Actualizar contraseña
    usuario.password_hash = hash_password(datos.new_password)

    # Limpiar código
    usuario.reset_code = None
    usuario.reset_code_expires = None

    db.commit()

    return ResetPasswordResponse(
        mensaje="✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión."
    )