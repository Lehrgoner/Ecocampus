from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class RegistroRequest(BaseModel):
    """Schema para el registro público de usuarios."""
    cedula: str = Field(..., min_length=6, max_length=15, description="Solo números, sin puntos ni guiones")
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Mínimo 8 caracteres")

    @field_validator("cedula")
    @classmethod
    def validar_cedula(cls, v):
        if not v.isdigit():
            raise ValueError("La cédula debe contener solo números")
        if len(v) < 6 or len(v) > 15:
            raise ValueError("La cédula debe tener entre 6 y 15 dígitos")
        return v

    @field_validator("password")
    @classmethod
    def validar_password(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v


class LoginRequest(BaseModel):
    """Schema para el login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Respuesta con el token JWT."""
    access_token: str
    token_type: str = "bearer"
    usuario: dict


class UsuarioActualResponse(BaseModel):
    """Datos del usuario autenticado."""
    id: int
    cedula: str
    nombres: str
    apellidos: str
    email: str
    rol: str
    activo: bool

    class Config:
        from_attributes = True