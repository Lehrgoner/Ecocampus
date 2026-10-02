# Contrato de API para el Frontend

Guía completa para que el equipo de frontend consuma la API con autenticación JWT.

## 🔗 Base URL

```
http://localhost:8000/api/v1
```

---

## 🔐 Autenticación (OBLIGATORIA)

**Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren autenticación con JWT.**

### Flujo de autenticación

```
1. Usuario se registra → POST /auth/register
2. Admin aprueba al usuario → POST /usuarios/{id}/aprobar
3. Usuario hace login → POST /auth/login → recibe token
4. Usuario usa el token en cada petición → Header: Authorization: Bearer <token>
```

### 1. Registro público

```javascript
POST /auth/register
{
  "cedula": "12345678",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@uni.edu",
  "password": "password123"
}

// Respuesta 201:
{
  "mensaje": "Registro exitoso. Tu cuenta está pendiente de aprobación.",
  "usuario_id": 2
}
```

### 2. Login

```javascript
POST /auth/login
{
  "email": "juan@uni.edu",
  "password": "password123"
}

// Respuesta 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "usuario": {
    "id": 2,
    "cedula": "87654321",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@uni.edu",
    "rol": "gestor"
  }
}
```

### 3. Guardar el token

```javascript
// Guardar en localStorage
localStorage.setItem('token', response.access_token);
localStorage.setItem('usuario', JSON.stringify(response.usuario));
```

### 4. Usar el token en cada petición

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:8000/api/v1/campus/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### 5. Obtener usuario actual

```javascript
GET /auth/me
Header: Authorization: Bearer <token>

// Respuesta:
{
  "id": 2,
  "cedula": "87654321",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@uni.edu",
  "rol": "gestor",
  "activo": true
}
```

---

## 👥 Roles del sistema

| Rol | Descripción | Permisos |
|:---|:---|:---|
| **admin** | Administrador del sistema | Ve TODOS los campus, gestiona usuarios |
| **gestor** | Gestor de sostenibilidad | Crea/edita zonas verdes, checklist, simulaciones de SUS campus |
| **consultor** | Solo lectura | Ve dashboards e indicadores de SUS campus |
| **pendiente** | Sin aprobar | No puede hacer login |

### Rutas protegidas por rol (en el frontend)

```javascript
// Ejemplo de protección de ruta
const usuario = JSON.parse(localStorage.getItem('usuario'));

// Solo admin
if (usuario.rol !== 'admin') {
  navigate('/dashboard'); // redirigir
}

// Admin o gestor
if (!['admin', 'gestor'].includes(usuario.rol)) {
  navigate('/dashboard');
}
```

---

## 🏛️ Multi-Campus

Cada usuario (excepto Admin) puede tener **uno o más campus**. Todas las operaciones requieren especificar `campus_id`.

### Flujo típico

```
1. Gestor se registra → Admin lo aprueba
2. Gestor hace login → ve su lista de campus (vacía)
3. Gestor crea su campus → POST /campus/
4. Gestor usa su campus_id para todas las operaciones
```

### Obtener campus del usuario

```javascript
GET /campus/
Header: Authorization: Bearer <token>

// Respuesta:
[
  {
    "id": 1,
    "usuario_id": 2,
    "nombre": "Universidad XYZ",
    "area_total_m2": 100000,
    "poblacion_total": 5000,
    "ciudad": "Caracas",
    "pais": "Venezuela"
  }
]
```

---

## 📋 Flujo completo de uso

### 1. Gestor crea su campus

```javascript
POST /campus/
{
  "nombre": "Universidad Central de Venezuela",
  "area_total_m2": 100000,
  "poblacion_total": 5000,
  "ciudad": "Caracas",
  "pais": "Venezuela"
}
```

### 2. Configurar perfil de sostenibilidad

```javascript
PUT /perfil/?campus_id=1
{
  "energia_clima": 1000,
  "residuos": 850,
  "agua": 550,
  "transporte": 850,
  "educacion_investigacion": 650
}
```

### 3. Registrar zonas verdes

```javascript
POST /zonas-verdes/?campus_id=1
{
  "nombre": "Bosque Norte",
  "tipo": "bosque_academico",
  "uso_academico": true,
  "geom": {
    "type": "Polygon",
    "coordinates": [[
      [-70.0, 10.0],
      [-69.95, 10.0],
      [-69.95, 10.05],
      [-70.0, 10.05],
      [-70.0, 10.0]
    ]]
  }
}
```

### 4. Configurar checklist

```javascript
PUT /checklist/?campus_id=1
{
  "si5_rampas": true,
  "si5_banos_accesibles": true,
  "si6_extintores": true,
  ...
}
```

### 5. Consultar dashboard

```javascript
GET /indicadores/actuales?campus_id=1
```

### 6. Simular intervención

```javascript
POST /simulaciones/?campus_id=1
{
  "tipo_intervencion": "bosque_academico",
  "geom": { /* GeoJSON dibujado en el mapa */ }
}
```

### 7. Ver recomendaciones

```javascript
GET /recomendaciones/?campus_id=1&presupuesto_max=50000
```

### 8. Consultar datos para gráficos

```javascript
GET /reportes/datos-graficos?campus_id=1
```

### 9. Descargar PDF

```javascript
GET /reportes/pdf?campus_id=1
```

---

## 🗺️ Formato de las geometrías

Todas las geometrías usan **GeoJSON** con SRID 4326 (WGS84).

### Ejemplo de polígono

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [-70.0, 10.0],
      [-69.9, 10.0],
      [-69.9, 10.1],
      [-70.0, 10.1],
      [-70.0, 10.0]
    ]
  ]
}
```

### Dibujar con Leaflet

```javascript
import L from 'leaflet';
import 'leaflet-draw';

const map = L.map('map').setView([10.0, -70.0], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    circle: false,
    marker: false,
    polyline: false,
  },
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, (e) => {
  const layer = e.layer;
  drawnItems.addLayer(layer);
  const geojson = layer.toGeoJSON();
  
  // Enviar a POST /simulaciones/?campus_id=1
  enviarSimulacion(geojson);
});
```

---

## 🎨 Colores por tipo de zona

| Tipo | Color | Hex |
|:---|:---|:---|
| bosque_academico | Verde oscuro | #1B5E20 |
| vegetacion_plantada | Verde medio | #4CAF50 |
| cesped | Verde claro | #8BC34A |
| jardin | Verde oliva | #689F38 |
| jardin_lluvia | Azul verdoso | #00897B |

---

## 🔴 Manejo de errores

| Código | Significado | Acción en el frontend |
|:---|:---|:---|
| 200 | OK | Procesar respuesta |
| 201 | Creado | Procesar respuesta |
| 204 | Eliminado | Refrescar lista |
| 400 | Datos inválidos | Mostrar mensaje de error |
| 401 | No autenticado | Redirigir a /login |
| 403 | Sin permisos | Mostrar "Acceso denegado" |
| 404 | No encontrado | Mostrar "Recurso no encontrado" |
| 500 | Error interno | Mostrar error genérico |
| 503 | ML no disponible | Reintentar más tarde |

### Manejo global de errores

```javascript
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8000/api/v1${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  if (response.status === 403) {
    throw new Error('No tienes permisos para esta acción');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error en la petición');
  }
  
  return response.status === 204 ? null : response.json();
}
```

---

## 📄 Reportes y Gráficos

### Obtener datos para gráficos (frontend)

```javascript
GET /reportes/datos-graficos?campus_id=1
Header: Authorization: Bearer <token>
```

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
    "SI": 165,
    "EC": 1000,
    "WS": 850,
    "WR": 550,
    "TR": 850,
    "ED": 650
  },
  "zonas_por_tipo": {
    "bosque_academico": 10914.25,
    "vegetacion_plantada": 12126.98
  },
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
  "ranking_estimado": 861,
  "checklist_resumen": {
    "SI5": {
      "nivel": 1,
      "puntaje": 5.0,
      "items_cumplidos": 0,
      "items_totales": 10,
      "items_faltantes": ["Rampas", "Baños accesibles", "..."]
    }
  },
  "simulaciones": [...],
  "areas_minimas": [...]
}
```

**Uso en el frontend:**
- `indicadores` → gráfico de barras SI 1-8
- `radar_categorias` → gráfico radar de 6 categorías
- `zonas_por_tipo` → gráfico de torta
- `recomendaciones` → gráfico de barras horizontales + cards
- `checklist_resumen` → lista de progreso con items faltantes
- `areas_minimas` → tabla de áreas necesarias para avanzar

---

### Descargar reporte PDF

```javascript
GET /reportes/pdf?campus_id=1
Header: Authorization: Bearer <token>
```

**Respuesta:** Archivo PDF binario (Content-Type: application/pdf)

**Ejemplo con JavaScript:**
```javascript
async function descargarPDF(campusId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:8000/api/v1/reportes/pdf?campus_id=${campusId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (!response.ok) {
    throw new Error('Error al descargar PDF');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_sostenibilidad.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
```

**Ejemplo con axios:**
```javascript
import axios from 'axios';

async function descargarPDF(campusId) {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(
    `http://localhost:8000/api/v1/reportes/pdf?campus_id=${campusId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob',  // ← Importante para archivos binarios
    }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'reporte_sostenibilidad.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

---

### Contenido del PDF

El PDF incluye **9 páginas**:

1. **Portada** - Nombre del campus, fecha, resumen ejecutivo
2. **Indicadores SI 1-8** - Tabla + gráfico de barras
3. **Perfil de sostenibilidad** - Gráfico radar + torta de zonas verdes
4. **Historial de simulaciones** - Últimas 10 simulaciones
5-6. **Recomendaciones** - Top 5 con áreas exactas y costos
7. **Áreas mínimas para avanzar** - Cuánto falta para subir de rango
8-9. **Checklist detallado** - Items faltantes y sugerencias

---

### Recomendaciones del frontend

**Para la sección de reportes:**

1. **Botón "Descargar PDF"** en el dashboard principal
2. **Sección de gráficos** usando los datos de `/datos-graficos`
3. **Tabla de recomendaciones** con cards visuales
4. **Progreso del checklist** con barras de nivel

**Librerías recomendadas para gráficos:**
- **Recharts** (React) - Ideal para React
- **Chart.js** (Vue/Angular) - Universal
- **ApexCharts** - Bonito y moderno
- **D3.js** - Máxima personalización

**Ejemplo con Recharts:**
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function GraficoIndicadores({ indicadores }) {
  const data = indicadores.map(i => ({
    codigo: i.codigo,
    puntaje: i.puntaje,
    maximo: i.puntaje_maximo,
  }));

  return (
    <BarChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="codigo" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="puntaje" fill="#4CAF50" name="Puntaje actual" />
      <Bar dataKey="maximo" fill="#E0E0E0" name="Máximo" />
    </BarChart>
  );
}
```

---

## 🎯 Resumen para el frontend

### Debes implementar:

1. **Pantalla de Registro** → `POST /auth/register`
2. **Pantalla de Login** → `POST /auth/login` + guardar token
3. **Interceptor de peticiones** → Añadir `Authorization: Bearer <token>`
4. **Protección de rutas** → Verificar rol del usuario
5. **Manejo de errores 401** → Redirigir a login
6. **Selector de campus** → Para usuarios con múltiples campus
7. **Panel de Admin** → Aprobar usuarios pendientes
8. **Dashboard** → Consumir `/reportes/datos-graficos`
9. **Botón "Descargar PDF"** → Llamar a `/reportes/pdf`
10. **Todas las pantallas** → Enviar `campus_id` en los endpoints

### Estados a manejar:

- ✅ Autenticado y con campus → flujo normal
- ⏳ Autenticado sin campus → redirigir a "Crear campus"
- ❌ Token expirado → redirigir a login
- 🚫 Sin permisos → mostrar "Acceso denegado"

---

## 💡 Tips importantes

1. **El token dura 8 horas** → considera refresco o logout automático
2. **Todos los endpoints usan `campus_id`** como query param (excepto auth y ranking)
3. **El Admin ve todos los campus** → tu UI debe permitir cambiar entre ellos
4. **Las geometrías son GeoJSON** → usa `leaflet-draw` para dibujar
5. **El checklist tiene 47 ítems** → organízalos en acordeones por SI5-SI8
6. **El PDF tarda ~10 segundos** → muestra un spinner mientras se descarga
7. **Para archivos binarios** → usa `responseType: 'blob'` en axios

---

## 📞 Contacto

Si tienes dudas sobre algún endpoint, revisa:
- `docs/API.md` → documentación detallada
- `http://localhost:8000/docs` → Swagger interactivo