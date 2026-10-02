from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT PostGIS_Version();"))
        print("✅ Conexión exitosa a PostgreSQL+PostGIS")
        print(f"Versión de PostGIS: {result.scalar()}")
except Exception as e:
    print(f"❌ Error de conexión: {e}")