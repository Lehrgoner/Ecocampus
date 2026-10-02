from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verificar_password, crear_access_token
from app.models.usuario import Usuario
from app.schemas.auth import (
    RegistroRequest,
    LoginRequest,
    TokenResponse,
    UsuarioActualResponse,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: RegistroRequest, db: Session = Depends(get_db)):
    """
    Registro público de usuario.
    El usuario queda en estado "pendiente" hasta que un Admin lo apruebe.
    """
    # Verificar email duplicado
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese email",
        )
    
    # Verificar cédula duplicada
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
    
    # Crear token
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
        },
    )


@router.get("/me", response_model=UsuarioActualResponse)
def obtener_usuario_actual(usuario: Usuario = Depends(get_current_user)):
    """
    Devuelve los datos del usuario autenticado.
    """
    return usuario