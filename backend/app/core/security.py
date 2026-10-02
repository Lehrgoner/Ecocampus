"""
Servicios de seguridad: hash de contraseñas y generación/validación de JWT.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# Configuración JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 horas


def hash_password(password: str) -> str:
    """Hashea una contraseña usando bcrypt."""
    # bcrypt solo acepta hasta 72 bytes
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verificar_password(password_plano: str, password_hash: str) -> bool:
    """Verifica si una contraseña coincide con su hash."""
    password_bytes = password_plano.encode("utf-8")[:72]
    hash_bytes = password_hash.encode("utf-8")
    try:
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un JWT con los datos proporcionados."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def decodificar_token(token: str) -> Optional[dict]:
    """Decodifica un JWT. Devuelve None si el token es inválido o expiró."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None