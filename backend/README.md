# GreenMetric Predictor - Backend

API REST para el modelado predictivo de indicadores sostenibles UI GreenMetric
en la mejora de espacios verdes universitarios.

Sistema multi-campus con autenticación JWT y roles diferenciados.

## 🚀 Tecnologías

- **FastAPI** - Framework web
- **PostgreSQL + PostGIS** - Base de datos geoespacial
- **SQLAlchemy** - ORM
- **Alembic** - Migraciones
- **scikit-learn** - Machine Learning
- **JWT (python-jose)** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Docker** - Contenedor de base de datos

## 📋 Requisitos previos

- Python 3.11+
- Docker Desktop
- Git

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd backend
```

### 2. Crear y activar el entorno virtual

```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz con:

```
DATABASE_URL=postgresql://greenmetric:greenmetric123@localhost:5432/greenmetric_db
SECRET_KEY=tu-clave-secreta-super-segura-cambiar-en-produccion
APP_NAME=GreenMetric Predictor
APP_VERSION=0.1.0
```

### 5. Levantar la base de datos

```bash
docker-compose up -d
```

### 6. Ejecutar migraciones

```bash
alembic upgrade head
```

### 7. Crear el Admin inicial

```bash
python -m scripts.seed_admin
```

### 8. Iniciar el servidor

```bash
python -m uvicorn app.main:app --reload
```

La API estará disponible en:
- **API**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs

## 🔐 Credenciales por defecto

Después de ejecutar el seed:

| Campo | Valor |
|:---|:---|
| Email | admin@greenmetric.com |
| Password | admin123456 |
| Cédula | 12345678 |

⚠️ **Cambiar la contraseña en producción**

## 🎭 Roles del sistema

| Rol | Descripción |
|:---|:---|
| **admin** | Gestiona usuarios, ve todos los campus |
| **gestor** | Administra sus campus y zonas verdes |
| **consultor** | Solo lectura de sus campus |
| **pendiente** | Registrado pero sin aprobar |

### Flujo de registro

1. Usuario se registra en `/auth/register` → queda como `pendiente`
2. Admin ve pendientes en `/usuarios/pendientes`
3. Admin aprueba con `/usuarios/{id}/aprobar` → usuario activo
4. Usuario hace login → obtiene token JWT
5. Usuario usa el token en todas las peticiones

## 🏛️ Multi-Campus

El sistema soporta múltiples universidades. Cada usuario (excepto Admin) gestiona sus propios campus.

- **Admin**: ve todos los campus del sistema
- **Gestor**: ve y gestiona solo sus campus
- **Consultor**: solo lectura de sus campus

Los campus se crean con `POST /campus/` después del login.

## 📁 Estructura del proyecto

```
backend/
├── app/
│   ├── api/v1/endpoints/    # Endpoints de la API
│   ├── core/                # Configuración y seguridad
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Schemas Pydantic
│   ├── services/            # Lógica de negocio (motor de reglas, ML)
│   └── ml/                  # Scripts de ML y modelo entrenado
├── alembic/                 # Migraciones
├── scripts/                 # Scripts de utilidad (seed)
├── docs/                    # Documentación
├── docker-compose.yml
└── requirements.txt
```

## 🧠 Machine Learning

El modelo de predicción de ranking se entrena con datos históricos de
UI GreenMetric (2020-2025).

Para reentrenar:

```bash
# 1. Extraer datos actualizados
python app/ml/scrapear_overall.py

# 2. Entrenar el modelo
python app/ml/train_ranking.py
```

## 📚 Documentación adicional

- [Documentación de la API](./docs/API.md)
- [Contrato para el Frontend](./docs/CONTRATO_FRONTEND.md)