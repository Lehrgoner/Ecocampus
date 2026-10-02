import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { listarCampus } from '../services/campusService';
import { listarZonas, crearZona, eliminarZona } from '../services/zonasService';
import './ZonasVerdes.css';

// Colores por tipo de zona
const COLORES_TIPO = {
  bosque_academico: '#1B5E20',
  vegetacion_plantada: '#4CAF50',
  cesped: '#8BC34A',
  jardin: '#689F38',
  jardin_lluvia: '#00897B',
};

// Nombres en español
const NOMBRES_TIPO = {
  bosque_academico: 'Bosque Académico',
  vegetacion_plantada: 'Vegetación Plantada',
  cesped: 'Césped',
  jardin: 'Jardín',
  jardin_lluvia: 'Jardín de Lluvia',
};

const ZonasVerdes = () => {
  const [campus, setCampus] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('bosque_academico');
  const [usoAcademico, setUsoAcademico] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const zonasLayerRef = useRef(null);

  // ============ CARGAR DATOS INICIALES ============
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const campusList = await listarCampus();
        if (!campusList || campusList.length === 0) {
          setError('No tienes un campus registrado. Crea uno en Configuración.');
          setLoading(false);
          return;
        }

        const miCampus = campusList[0];
        setCampus(miCampus);

        const zonasList = await listarZonas(miCampus.id);
        setZonas(zonasList || []);

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // ============ INICIALIZAR MAPA ============
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (loading) return;

    // Centro por defecto: Venezuela
    let centro = [8.0, -66.0];
    let zoom = 6;

    // Si hay zonas, calcular el centroide
    if (zonas.length > 0) {
      let latSum = 0, lngSum = 0, count = 0;
      zonas.forEach(z => {
        if (z.geom && z.geom.coordinates) {
          const coords = z.geom.coordinates[0];
          coords.forEach(([lng, lat]) => {
            latSum += lat;
            lngSum += lng;
            count++;
          });
        }
      });
      if (count > 0) {
        centro = [latSum / count, lngSum / count];
        zoom = 15;
      }
    }

    // Crear mapa
    const map = L.map(mapRef.current).setView(centro, zoom);
    mapInstanceRef.current = map;

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Capa para zonas existentes
    zonasLayerRef.current = L.featureGroup().addTo(map);

    // Capa para dibujo
    drawnItemsRef.current = L.featureGroup().addTo(map);

    // Control de dibujo
    const drawControl = new L.Control.Draw({
      edit: false,
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#4CAF50',
            fillOpacity: 0.4,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#4CAF50',
            fillOpacity: 0.4,
          },
        },
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    // Evento: polígono dibujado
    map.on(L.Draw.Event.CREATED, async (e) => {
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      const geojson = layer.toGeoJSON();

      await manejarNuevaZona(geojson.geometry);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, zonas.length]);

  // ============ DIBUJAR ZONAS EXISTENTES ============
  useEffect(() => {
    if (!zonasLayerRef.current || !mapInstanceRef.current) return;

    // Limpiar capa
    zonasLayerRef.current.clearLayers();

    zonas.forEach((zona) => {
      if (!zona.geom) return;

      const color = COLORES_TIPO[zona.tipo] || '#4CAF50';

      const layer = L.geoJSON(zona.geom, {
        style: {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          weight: 2,
        },
      });

      layer.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong style="font-size: 14px;">${zona.nombre}</strong><br/>
          <span style="color: #666;">${NOMBRES_TIPO[zona.tipo] || zona.tipo}</span><br/>
          <span style="color: #4CAF50; font-weight: bold;">${zona.area_m2?.toFixed(2) || '0'} m²</span>
          ${zona.uso_academico ? '<br/><span style="color: #1B5E20;">🎓 Uso académico</span>' : ''}
        </div>
      `);

      zonasLayerRef.current.addLayer(layer);
    });
  }, [zonas]);

  // ============ MANEJAR NUEVA ZONA ============
  const manejarNuevaZona = async (geom) => {
    if (!campus) return;

    try {
      const nuevaZona = {
        nombre: `${NOMBRES_TIPO[tipoSeleccionado] || 'Zona'} ${new Date().toLocaleTimeString()}`,
        tipo: tipoSeleccionado,
        uso_academico: tipoSeleccionado === 'bosque_academico' ? usoAcademico : false,
        geom: geom,
      };

      const zonaCreada = await crearZona(campus.id, nuevaZona);
      setZonas((prev) => [...prev, zonaCreada]);
      mostrarMensaje(`✅ Zona "${zonaCreada.nombre}" creada (${zonaCreada.area_m2?.toFixed(2)} m²)`, 'success');

      // Limpiar capa de dibujo
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
      }
    } catch (err) {
      console.error('Error al crear zona:', err);
      mostrarMensaje('❌ Error al crear la zona', 'error');
    }
  };

  // ============ ELIMINAR ZONA ============
  const manejarEliminar = async (zonaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;

    try {
      await eliminarZona(zonaId);
      setZonas((prev) => prev.filter(z => z.id !== zonaId));
      mostrarMensaje('✅ Zona eliminada', 'success');
    } catch (err) {
      console.error('Error al eliminar:', err);
      mostrarMensaje('❌ Error al eliminar la zona', 'error');
    }
  };

  // ============ MENSAJES TEMPORALES ============
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="zonas-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando zonas verdes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zonas-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="zonas-container">
      <div className="zonas-header">
        <h1>🌳 Zonas Verdes - {campus?.nombre}</h1>
      </div>

      {/* Mensaje temporal */}
      {mensaje && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          borderRadius: '6px',
          background: mensaje.tipo === 'success' ? '#e8f5e9' : '#ffebee',
          color: mensaje.tipo === 'success' ? '#2e7d32' : '#c62828',
          fontWeight: 'bold',
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Toolbar */}
      <div className="zonas-toolbar">
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Tipo de zona:</label>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {Object.entries(NOMBRES_TIPO).map(([key, nombre]) => (
              <option key={key} value={key}>{nombre}</option>
            ))}
          </select>
        </div>

        {tipoSeleccionado === 'bosque_academico' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={usoAcademico}
                onChange={(e) => setUsoAcademico(e.target.checked)}
              />
              🎓 Uso académico (cuenta para SI 2)
            </label>
          </div>
        )}

        <div style={{ marginLeft: 'auto', color: '#666' }}>
          📏 Total: <strong>{zonas.length}</strong> zonas
        </div>
      </div>

      {/* Instrucciones */}
      <div style={{
        padding: '12px 20px',
        marginBottom: '20px',
        borderRadius: '6px',
        background: '#e3f2fd',
        color: '#1565c0',
        fontSize: '0.95rem',
      }}>
        💡 <strong>Instrucciones:</strong> Usa las herramientas de dibujo en el mapa (esquina superior izquierda)
        para crear una nueva zona. El tipo se selecciona arriba.
      </div>

      {/* Contenido: Mapa + Tabla */}
      <div className="zonas-content">
        {/* Mapa */}
        <div className="zonas-mapa" style={{ position: 'relative' }}>
          <div
            ref={mapRef}
            style={{
              height: '600px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Tabla */}
        <div className="zonas-tabla">
          <h3 style={{ marginTop: 0, color: '#2e7d32' }}>📋 Zonas registradas</h3>
          {zonas.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              background: '#f5f5f5',
              borderRadius: '8px',
              color: '#666',
            }}>
              <p>No hay zonas registradas</p>
              <small>Dibuja una en el mapa para empezar</small>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {zonas.map((zona) => (
                <div
                  key={zona.id}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    background: 'white',
                    borderRadius: '8px',
                    borderLeft: `5px solid ${COLORES_TIPO[zona.tipo] || '#4CAF50'}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{zona.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {NOMBRES_TIPO[zona.tipo] || zona.tipo}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4CAF50', fontWeight: 'bold' }}>
                      {zona.area_m2?.toFixed(2) || '0'} m²
                      {zona.uso_academico && <span style={{ marginLeft: '8px', color: '#1B5E20' }}>🎓</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => manejarEliminar(zona.id)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                    title="Eliminar zona"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZonasVerdes;