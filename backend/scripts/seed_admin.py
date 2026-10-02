"""
Script para crear el usuario Admin inicial.
Ejecutar una sola vez después de aplicar las migraciones.

Uso:
    python -m scripts.seed_admin
"""

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario


def crear_admin_inicial():
    db = SessionLocal()
    try:
        # Verificar si ya existe un admin
        admin_existente = db.query(Usuario).filter(Usuario.rol == "admin").first()
        if admin_existente:
            print(f"✅ Ya existe un admin: {admin_existente.email}")
            return
        
        admin = Usuario(
            cedula="12345678",
            nombres="Admin",
            apellidos="Sistema",
            email="admin@greenmetric.com",
            password_hash=hash_password("admin123456"),
            rol="admin",
            activo=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("=" * 60)
        print("✅ Admin creado exitosamente")
        print("=" * 60)
        print(f"   Email: admin@greenmetric.com")
        print(f"   Password: admin123456")
        print(f"   Cédula: 12345678")
        print("=" * 60)
        print("⚠️  CAMBIA LA CONTRASEÑA EN PRODUCCIÓN")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    crear_admin_inicial()