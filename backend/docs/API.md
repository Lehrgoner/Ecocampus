# Documentación de la API

Base URL: `http://localhost:8000/api/v1`

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren autenticación con JWT.

### Obtener token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@greenmetric.com", "password": "admin123456"}'
```

### Usar token

```bash
curl http://localhost:8000/api/v1/campus/ \
  -H "Authorization: Bearer <tu-token-aqui>"
```

## 🎭 Roles

| Rol | Descripción |
|:---|:---|
| admin | Gestiona usuarios y ve todos los campus |
| gestor | Administra sus campus |
| consultor | Solo lectura de sus campus |
| pendiente | Sin aprobar (no puede login) |

## 🔗 Parámetros comunes

Muchos endpoints requieren `campus_id` como query parameter:

```
GET /zonas-verdes/?campus_id=1
GET /indicadores/actuales?campus_id=1
POST /simulaciones/?campus_id=1
```

---

## Índice de endpoints

### Autenticación
| Método | Endpoint | Descripción |
|:---|:---|:---|
| POST | `/auth/register` | Registro público |
| POST | `/auth/login` | Login (devuelve JWT) |
| GET | `/auth/me` | Usuario actual |

### Usuarios (solo Admin)
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/usuarios/` | Listar todos |
| GET | `/usuarios/pendientes` | Pendientes de aprobación |
| POST | `/usuarios/{id}/aprobar` | Aprobar usuario |
| POST | `/usuarios/{id}/rechazar` | Rechazar usuario |
| POST | `/usuarios/` | Crear usuario directo |
| PUT | `/usuarios/{id}` | Actualizar rol |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

### Campus
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/campus/` | Listar campus del usuario |
| GET | `/campus/actual` | Primer campus |
| POST | `/campus/` | Crear campus |
| PUT | `/campus/{id}` | Actualizar |
| DELETE | `/campus/{id}` | Eliminar |

### Zonas Verdes
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/zonas-verdes/?campus_id=X` | Listar |
| POST | `/zonas-verdes/?campus_id=X` | Crear |
| PUT | `/zonas-verdes/{id}` | Actualizar |
| DELETE | `/zonas-verdes/{id}` | Eliminar |

### Indicadores
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/indicadores/actuales?campus_id=X` | Puntajes SI 1-8 |

### Checklist
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/checklist/?campus_id=X` | Obtener checklist |
| PUT | `/checklist/?campus_id=X` | Actualizar |

### Perfil de Sostenibilidad
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/perfil/?campus_id=X` | Obtener perfil |
| PUT | `/perfil/?campus_id=X` | Actualizar |

### Simulaciones
| Método | Endpoint | Descripción |
|:---|:---|:---|
| POST | `/simulaciones/?campus_id=X` | Crear simulación |
| GET | `/simulaciones/?campus_id=X` | Listar |
| GET | `/simulaciones/{id}` | Obtener |

### Ranking
| Método | Endpoint | Descripción |
|:---|:---|:---|
| POST | `/ranking/predecir` | Predecir ranking global |

### Recomendaciones
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/recomendaciones/?campus_id=X` | Recomendaciones |

### Reportes
| Método | Endpoint | Descripción |
|:---|:---|:---|
| GET | `/reportes/datos-graficos?campus_id=X` | Datos para gráficos del frontend |
| GET | `/reportes/pdf?campus_id=X` | Descargar reporte PDF completo |

---

## 🔐 Autenticación detallada

### POST `/auth/register`

Registro público. El usuario queda pendiente de aprobación.

**Body:**
```json
{
  "cedula": "12345678",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@uni.edu",
  "password": "password123"
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.",
  "usuario_id": 2
}
```

### POST `/auth/login`

Login con email y contraseña.

**Body:**
```json
{
  "email": "admin@greenmetric.com",
  "password": "admin123456"
}
```

**Respuesta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "usuario": {
    "id": 1,
    "cedula": "12345678",
    "nombres": "Admin",
    "apellidos": "Sistema",
    "email": "admin@greenmetric.com",
    "rol": "admin"
  }
}
```

### GET `/auth/me`

Requiere header `Authorization: Bearer <token>`.

**Respuesta:**
```json
{
  "id": 1,
  "cedula": "12345678",
  "nombres": "Admin",
  "apellidos": "Sistema",
  "email": "admin@greenmetric.com",
  "rol": "admin",
  "activo": true
}
```

---

## 👥 Usuarios

### GET `/usuarios/`

Solo Admin. Lista todos los usuarios.

### GET `/usuarios/pendientes`

Solo Admin. Lista usuarios pendientes de aprobación.

### POST `/usuarios/{id}/aprobar`

Solo Admin. Aprueba un usuario pendiente.

**Body:**
```json
{
  "rol": "gestor"
}
```

### POST `/usuarios/{id}/rechazar`

Solo Admin. Elimina un usuario pendiente.

### POST `/usuarios/`

Solo Admin. Crea un usuario directamente con rol asignado.

**Body:**
```json
{
  "cedula": "11111111",
  "nombres": "María",
  "apellidos": "García",
  "email": "maria@uni.edu",
  "password": "password123",
  "rol": "gestor"
}
```

### PUT `/usuarios/{id}`

Solo Admin. Actualiza rol o estado activo.

### DELETE `/usuarios/{id}`

Solo Admin. Elimina un usuario (no puede eliminarse a sí mismo).

---

## 🏛️ Campus

### GET `/campus/`

Lista los campus del usuario autenticado.

- **Admin**: ve TODOS los campus
- **Gestor/Consultor**: solo los suyos

**Respuesta:**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "nombre": "Universidad Central de Venezuela",
    "area_total_m2": 100000,
    "poblacion_total": 5000,
    "ciudad": "Caracas",
    "pais": "Venezuela"
  }
]
```

### POST `/campus/`

Solo Gestor y Admin. Crea un nuevo campus.

**Body:**
```json
{
  "nombre": "Universidad Central de Venezuela",
  "area_total_m2": 100000,
  "poblacion_total": 5000,
  "ciudad": "Caracas",
  "pais": "Venezuela"
}
```

---

## 🌳 Zonas Verdes

### GET `/zonas-verdes/?campus_id=1`

Lista las zonas verdes de un campus.

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Bosque Norte",
    "tipo": "bosque_academico",
    "area_m2": 1500.0,
    "uso_academico": true,
    "geom": {
      "type": "Polygon",
      "coordinates": [[[-70.0, 10.0], [-69.9, 10.0], ...]]
    }
  }
]
```

### POST `/zonas-verdes/?campus_id=1`

Crea una nueva zona verde.

**Body:**
```json
{
  "nombre": "Bosque Norte",
  "tipo": "bosque_academico",
  "uso_academico": true,
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-70.0, 10.0], [-69.9, 10.0], [-69.9, 10.1], [-70.0, 10.1], [-70.0, 10.0]]]
  }
}
```

**Tipos válidos:**
- `bosque_academico`
- `vegetacion_plantada`
- `cesped`
- `jardin`
- `jardin_lluvia`

**Nota sobre `uso_academico`:**
- Solo aplica a `bosque_academico`
- Si es `true`, el área suma al indicador SI 2
- Si es `false`, el área solo suma a SI 1 y SI 4

---

## 📊 Indicadores

### GET `/indicadores/actuales?campus_id=1`

Devuelve los puntajes SI 1-8 actuales.

**Respuesta:**
```json
{
  "indicadores": [
    {
      "codigo": "SI1",
      "nombre": "Proporción de espacio abierto",
      "puntaje": 50.0,
      "puntaje_maximo": 200.0,
      "porcentaje": 25.0
    }
  ],
  "puntaje_total_si": 410.0,
  "puntaje_maximo_si": 1100.0,
  "porcentaje_total": 37.27
}
```

---

## ✅ Checklist

### GET `/checklist/?campus_id=1`

Obtiene el checklist SI 5-8 de un campus.

### PUT `/checklist/?campus_id=1`

Actualiza el checklist completo.

**Body:**
```json
{
  "si5_rampas": true,
  "si5_banos_accesibles": true,
  "si6_extintores": true,
  "si6_alarmas": true
}
```

---

## 🧪 Simulaciones

### POST `/simulaciones/?campus_id=1`

Simula una intervención en espacios verdes.

**Body:**
```json
{
  "tipo_intervencion": "bosque_academico",
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-70.0, 10.0], [-69.9, 10.0], [-69.9, 10.1], [-70.0, 10.1], [-70.0, 10.0]]]
  }
}
```

**Respuesta (201):**
```json
{
  "id": 1,
  "tipo_intervencion": "bosque_academico",
  "area_m2": 1234.56,
  "puntajes_antes": { "SI1": 50.0, "SI2": 5.0, "total": 410.0 },
  "puntajes_despues": { "SI1": 90.0, "SI2": 25.0, "total": 450.0 },
  "ranking_antes": null,
  "ranking_despues": null,
  "creado_en": "2026-09-16T15:30:00"
}
```

---

## 🏆 Ranking

### POST `/ranking/predecir`

Predice la posición en el ranking global.

**Body:**
```json
{
  "SI": 600,
  "EC": 1200,
  "WS": 900,
  "WR": 500,
  "TR": 1000,
  "ED": 1200
}
```

**Respuesta:**
```json
{
  "ranking_estimado": 646,
  "puntaje_total": 5400,
  "mensaje": "Con un puntaje total de 5400 puntos, la universidad estaría aproximadamente en la posición #646."
}
```

---

## 💡 Recomendaciones

### GET `/recomendaciones/?campus_id=1&presupuesto_max=50000`

Genera recomendaciones de intervenciones.

**Query params:**
- `campus_id` (requerido): ID del campus
- `presupuesto_max` (opcional): Presupuesto máximo en USD
- `top_n` (opcional): Número de recomendaciones (default 5)

**Respuesta:**
```json
{
  "ranking_actual": 787,
  "puntaje_si_actual": 410.0,
  "presupuesto_usado": 50000.0,
  "total_recomendaciones": 5,
  "recomendaciones": [
    {
      "tipo": "cesped",
      "area_m2": 7873,
      "costo_estimado_usd": 23619.06,
      "descripcion": "Cesped y areas verdes de bajo mantenimiento",
      "puntaje_si_actual": 165.0,
      "puntaje_si_nuevo": 215.0,
      "ganancia_si": 50.0,
      "porcentaje_ganancia_si": 30.3,
      "ranking_predicho": 861,
      "posiciones_mejoradas": 0
    }
  ],
  "areas_minimas_para_avanzar": [
    {
      "indicador": "SI1",
      "valor_actual": 33955.0,
      "porcentaje_actual": 33.96,
      "siguiente_rango_pct": 80.0,
      "area_adicional_m2": 46045.0,
      "ganancia_puntaje_si": 50.0,
      "multiplicador_actual": 0.25,
      "multiplicador_siguiente": 0.5
    }
  ]
}
```

---

## ⚙️ Perfil de Sostenibilidad

### GET `/perfil/?campus_id=1`

Obtiene los puntajes base de las categorías EC, WS, WR, TR, ED.

**Respuesta:**
```json
{
  "id": 1,
  "energia_clima": 1000.0,
  "residuos": 850.0,
  "agua": 550.0,
  "transporte": 850.0,
  "educacion_investigacion": 650.0
}
```

### PUT `/perfil/?campus_id=1`

Actualiza los puntajes base.

**Body:**
```json
{
  "energia_clima": 1200,
  "residuos": 900,
  "agua": 600,
  "transporte": 1000,
  "educacion_investigacion": 700
}
```

**Máximos oficiales:**
- energia_clima: 2000
- residuos: 1700
- agua: 1100
- transporte: 1700
- educacion_investigacion: 1300

---

## 📄 Reportes

### GET `/reportes/datos-graficos?campus_id=1`

Devuelve **todos los datos necesarios** para que el frontend dibuje los gráficos y muestre el dashboard.

**Respuesta:**
```json
{
  "campus": {
    "nombre": "Universidad Central de Venezuela",
    "area_total_m2": 100000,
    "poblacion_total": 5000
  },
  "indicadores": [
    {
      "codigo": "SI1",
      "nombre": "Proporción de espacio abierto",
      "puntaje": 50.0,
      "puntaje_maximo": 200.0,
      "porcentaje": 25.0
    }
  ],
  "radar_categorias": {
    "SI": 165, "EC": 1000, "WS": 850,
    "WR": 550, "TR": 850, "ED": 650
  },
  "zonas_por_tipo": {
    "bosque_academico": 10914.25,
    "vegetacion_plantada": 12126.98
  },
  "recomendaciones": [...],
  "ranking_estimado": 861,
  "checklist_resumen": {
    "SI5": {
      "nivel": 1,
      "puntaje": 5.0,
      "items_cumplidos": 0,
      "items_totales": 10,
      "items_faltantes": ["Rampas", "Baños accesibles"]
    }
  },
  "simulaciones": [...],
  "areas_minimas": [...]
}
```

**Uso:**
- Todas las pantallas del dashboard pueden consumir este endpoint
- Se usa para gráficos interactivos
- Sirve como fuente única de verdad para el estado del campus

---

### GET `/reportes/pdf?campus_id=1`

Genera y descarga un **reporte PDF completo de 9 páginas** del campus.

**Respuesta:** Archivo binario PDF (`Content-Type: application/pdf`)

**Contenido:**
1. Portada + Resumen ejecutivo
2. Indicadores SI 1-8 + gráfico de barras
3. Radar de categorías + torta de zonas verdes
4. Historial de simulaciones (últimas 10)
5-6. Recomendaciones detalladas con áreas exactas
7. Áreas mínimas para avanzar de rango
8-9. Checklist detallado con items faltantes

**Ejemplo con curl:**
```bash
curl -X GET "http://localhost:8000/api/v1/reportes/pdf?campus_id=1" \
  -H "Authorization: Bearer <token>" \
  --output reporte.pdf
```

**Ejemplo con JavaScript:**
```javascript
async function descargarPDF(campusId) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:8000/api/v1/reportes/pdf?campus_id=${campusId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

## 🔴 Códigos de error

| Código | Significado |
|:---|:---|
| 200 | OK |
| 201 | Creado |
| 204 | Eliminado |
| 400 | Datos inválidos |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 500 | Error interno |
| 503 | Servicio no disponible |