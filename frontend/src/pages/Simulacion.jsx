import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { listarCampus } from '../services/campusService';
import { listarZonas } from '../services/zonasService';
import { obtenerIndicadores } from '../services/indicadoresService';
import { crearSimulacion } from '../services/simulacionService';
import { obtenerPerfil } from '../services/perfilService';
import { predecirRanking } from '../services/rankingService';
import './Simulacion.css';

// Colores y nombres por tipo
const COLORES_TIPO = {
  bosque_academico: '#1B5E20',
  vegetacion_plantada: '#4CAF50',
  cesped: '#8BC34A',
  jardin: '#689F38',
  jardin_lluvia: '#00897B',
};

const NOMBRES_TIPO = {
  bosque_academico: '🌳 Bosque Académico',
  vegetacion_plantada: '🌿 Vegetación Plantada',
  cesped: '🌱 Césped',
  jardin: '🌸 Jardín',
  jardin_lluvia: '🌧️ Jardín de Lluvia',
};

const Simulacion = () => {
  const [campus, setCampus] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const [tipoIntervencion, setTipoIntervencion] = useState('bosque_academico');
  const [usoAcademico, setUsoAcademico] = useState(false);
  const [poligonoDibujado, setPoligonoDibujado] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [simulando, setSimulando] = useState(false);
  const [rankingActual, setRankingActual] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);

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

        // Calcular ranking actual
        try {
          const indicadores = await obtenerIndicadores(miCampus.id);
          const perfil = await obtenerPerfil(miCampus.id);

          const puntajesML = {
            SI: indicadores.puntaje_total_si,
            EC: perfil.energia_clima,
            WS: perfil.residuos,
            WR: perfil.agua,
            TR: perfil.transporte,
            ED: perfil.educacion_investigacion,
          };

          const rankingResp = await predecirRanking(puntajesML);
          setRankingActual(rankingResp);
        } catch (e) {
          console.warn('No se pudo calcular ranking actual:', e);
        }

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
    if (!mapRef.current || mapInstanceRef.current || loading) return;

    // Centro dinámico basado en zonas existentes
    let centro = [8.0, -66.0];
    let zoom = 6;

    if (zonas.length > 0) {
      let latSum = 0, lngSum = 0, count = 0;
      zonas.forEach(z => {
        if (z.geom && z.geom.coordinates) {
          z.geom.coordinates[0].forEach(([lng, lat]) => {
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

    const map = L.map(mapRef.current).setView(centro, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Mostrar zonas existentes (fondo)
    zonas.forEach((zona) => {
      if (!zona.geom) return;
      const color = COLORES_TIPO[zona.tipo] || '#4CAF50';
      L.geoJSON(zona.geom, {
        style: {
          color: color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 2,
        },
      })
        .bindPopup(`<strong>${zona.nombre}</strong><br/>${zona.area_m2?.toFixed(0)} m²`)
        .addTo(map);
    });

    // Capa para el polígono de simulación
    drawnItemsRef.current = L.featureGroup().addTo(map);

    // Control de dibujo
    const drawControl = new L.Control.Draw({
      edit: false,
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#667eea',
            fillColor: '#667eea',
            fillOpacity: 0.4,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#667eea',
            fillColor: '#667eea',
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
    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItemsRef.current.clearLayers();
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      const geojson = layer.toGeoJSON();
      setPoligonoDibujado(geojson.geometry);
      setResultado(null);
      mostrarMensaje('📐 Polígono dibujado. Ahora presiona "Simular Impacto".', 'info');
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, zonas.length]);

  // ============ SIMULAR ============
  const manejarSimular = async () => {
    if (!poligonoDibujado) {
      mostrarMensaje('⚠️ Primero dibuja un polígono en el mapa.', 'error');
      return;
    }

    if (!campus) return;

    try {
      setSimulando(true);
      setResultado(null);

      const payload = {
        tipo_intervencion: tipoIntervencion,
        geom: poligonoDibujado,
        uso_academico: tipoIntervencion === 'bosque_academico' ? usoAcademico : false,
      };

      const respuesta = await crearSimulacion(campus.id, payload);
      setResultado(respuesta);
      mostrarMensaje('✅ Simulación completada', 'success');
    } catch (err) {
      console.error('Error al simular:', err);
      mostrarMensaje('❌ Error al simular: ' + (err.message || 'Desconocido'), 'error');
    } finally {
      setSimulando(false);
    }
  };

  // ============ LIMPIAR ============
  const manejarLimpiar = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    setPoligonoDibujado(null);
    setResultado(null);
  };

  // ============ MENSAJES ============
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="simulacion-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando simulación...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simulacion-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="simulacion-container">
      <div className="simulacion-header">
        <h1>🧪 Simulación de Intervención</h1>
        <p style={{ color: '#666' }}>
          Dibuja un polígono en el mapa, selecciona el tipo de intervención y presiona "Simular Impacto".
        </p>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          borderRadius: '6px',
          background: mensaje.tipo === 'success' ? '#e8f5e9' :
                     mensaje.tipo === 'error' ? '#ffebee' : '#e3f2fd',
          color: mensaje.tipo === 'success' ? '#2e7d32' :
                 mensaje.tipo === 'error' ? '#c62828' : '#1565c0',
          fontWeight: 'bold',
        }}>
          {mensaje.texto}
        </div>
      )}

      <div className="simulacion-content">
        {/* Mapa */}
        <div className="mapa-section">
          <div
            ref={mapRef}
            style={{
              height: '600px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            justifyContent: 'space-between',
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {poligonoDibujado ? '✅ Polígono listo para simular' : '💡 Dibuja un polígono con las herramientas del mapa'}
            </div>
            {poligonoDibujado && (
              <button
                onClick={manejarLimpiar}
                style={{
                  padding: '8px 16px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="controles-section">
          {/* Selector de tipo */}
          <div className="form-group">
            <label>Tipo de Intervención:</label>
            <select
              value={tipoIntervencion}
              onChange={(e) => {
                setTipoIntervencion(e.target.value);
                setResultado(null);
              }}
              className="form-select"
            >
              {Object.entries(NOMBRES_TIPO).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Checkbox de uso académico (solo para bosques) */}
          {tipoIntervencion === 'bosque_academico' && (
            <div className="form-group" style={{
              padding: '12px',
              background: '#e8f5e9',
              borderRadius: '6px',
              borderLeft: '4px solid #1B5E20',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginBottom: 0,
              }}>
                <input
                  type="checkbox"
                  checked={usoAcademico}
                  onChange={(e) => {
                    setUsoAcademico(e.target.checked);
                    setResultado(null);
                  }}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>
                  🎓 <strong>Uso académico</strong><br/>
                  <small style={{ color: '#666' }}>
                    Marca si el bosque se usará para investigación, docencia o vinculación (requisito SI 2)
                  </small>
                </span>
              </label>
            </div>
          )}

          {/* Ranking actual */}
          {rankingActual && (
            <div style={{
              padding: '15px',
              background: '#fff3e0',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Ranking actual</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                #{rankingActual.ranking_estimado}
              </div>
            </div>
          )}

          {/* Botón simular */}
          <div className="simulacion-actions">
            <button
              className="btn-primary"
              onClick={manejarSimular}
              disabled={!poligonoDibujado || simulando}
              style={{
                opacity: (!poligonoDibujado || simulando) ? 0.5 : 1,
                cursor: (!poligonoDibujado || simulando) ? 'not-allowed' : 'pointer',
              }}
            >
              {simulando ? '⏳ Simulando...' : '🧮 Simular Impacto'}
            </button>
          </div>

          {/* Resultados */}
          {resultado && (
            <div className="indicadores-table" style={{ marginTop: '20px' }}>
              <h3>📊 Impacto en Indicadores</h3>
              <div style={{
                padding: '10px',
                background: '#f5f5f5',
                borderRadius: '6px',
                marginBottom: '10px',
                fontSize: '0.9rem',
              }}>
                Área de la intervención: <strong>{resultado.area_m2?.toFixed(2)} m²</strong>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Antes</th>
                    <th>Después</th>
                  </tr>
                </thead>
                <tbody>
                  {['SI1', 'SI2', 'SI3', 'SI4'].map((codigo) => {
                    const antes = resultado.puntajes_antes[codigo] || 0;
                    const despues = resultado.puntajes_despues[codigo] || 0;
                    const cambio = despues - antes;

                    return (
                      <tr key={codigo}>
                        <td><strong>{codigo}</strong></td>
                        <td>{antes.toFixed(1)}</td>
                        <td>
                          {despues.toFixed(1)}
                          {cambio > 0 && (
                            <span className="cambio-positivo">▲ +{cambio.toFixed(1)}</span>
                          )}
                          {cambio === 0 && (
                            <span className="cambio-neutro">=</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Total */}
              <div style={{
                marginTop: '15px',
                padding: '15px',
                background: '#e8f5e9',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Puntaje SI Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
                  {resultado.puntajes_antes.total?.toFixed(1)} → {resultado.puntajes_despues.total?.toFixed(1)}
                  {resultado.puntajes_despues.total - resultado.puntajes_antes.total > 0 && (
                    <span style={{ color: '#4caf50', marginLeft: '10px' }}>
                      (+{(resultado.puntajes_despues.total - resultado.puntajes_antes.total).toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulacion;