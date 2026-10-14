from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.models.campus import Campus

db = SessionLocal()

print("=" * 60)
print("USUARIOS EN LA BASE DE DATOS")
print("=" * 60)

usuarios = db.query(Usuario).all()
for u in usuarios:
    print(f"ID: {u.id}")
    print(f"  Nombre: {u.nombres} {u.apellidos}")
    print(f"  Email: {u.email}")
    print(f"  Rol: {u.rol}")
    print(f"  Activo: {u.activo}")
    print(f"  Campus asignado ID: {u.campus_asignado_id}")
    print()

print("=" * 60)
print("CAMPUS EN LA BASE DE DATOS")
print("=" * 60)

campus = db.query(Campus).all()
for c in campus:
    print(f"ID: {c.id}")
    print(f"  Nombre: {c.nombre}")
    print(f"  Usuario dueño: {c.usuario_id}")
    print()

db.close()