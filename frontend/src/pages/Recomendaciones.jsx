import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarCampus } from '../services/campusService';
import { obtenerRecomendaciones } from '../services/recomendacionesService';
import { obtenerIndicadores } from '../services/indicadoresService';
import './Recomendaciones.css';

const Recomendaciones = () => {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const [presupuesto, setPresupuesto] = useState(50000);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [areasMinimas, setAreasMinimas] = useState([]);
  const [rankingActual, setRankingActual] = useState(null);
  const [puntajeSIActual, setPuntajeSIActual] = useState(0);
  const [generando, setGenerando] = useState(false);

  // ============ CARGAR CAMPUS ============
  useEffect(() => {
    const cargarCampus = async () => {
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

        const indicadores = await obtenerIndicadores(miCampus.id);
        setPuntajeSIActual(indicadores.puntaje_total_si || 0);

        setLoading(false);

        await generarRecomendaciones(miCampus.id, 50000);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };

    cargarCampus();
  }, []);

  // ============ GENERAR RECOMENDACIONES ============
  const generarRecomendaciones = async (campusId, presupuestoMax) => {
    try {
      setGenerando(true);
      setMensaje(null);

      const respuesta = await obtenerRecomendaciones(campusId, presupuestoMax);

      setRecomendaciones(respuesta.recomendaciones || []);
      setAreasMinimas(respuesta.areas_minimas_para_avanzar || []);
      setRankingActual(respuesta.ranking_actual);
      setPuntajeSIActual(respuesta.puntaje_si_actual || 0);

      if (respuesta.recomendaciones?.length === 0) {
        setMensaje({
          texto: 'No hay recomendaciones disponibles con ese presupuesto. Prueba con uno más alto.',
          tipo: 'error',
        });
      }
    } catch (err) {
      console.error('Error al generar recomendaciones:', err);
      setMensaje({
        texto: '❌ Error al generar recomendaciones: ' + (err.message || 'Desconocido'),
        tipo: 'error',
      });
    } finally {
      setGenerando(false);
    }
  };

  const manejarGenerar = () => {
    if (!campus) return;
    if (presupuesto <= 0) {
      setMensaje({ texto: '⚠️ Ingresa un presupuesto mayor a 0', tipo: 'error' });
      return;
    }
    generarRecomendaciones(campus.id, presupuesto);
  };

  // ============ HELPERS ============
  const getEmoji = (index) => {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || '🏅';
  };

  const getNombreTipo = (tipo) => {
    const nombres = {
      bosque_academico: 'Bosque Académico',
      vegetacion_plantada: 'Vegetación Plantada',
      cesped: 'Césped',
      jardin: 'Jardín',
      jardin_lluvia: 'Jardín de Lluvia',
    };
    return nombres[tipo] || tipo;
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="recomendaciones-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando recomendaciones...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recomendaciones-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="recomendaciones-container">
      <div className="recomendaciones-header">
        <h1>💡 Recomendaciones Inteligentes</h1>
        <p style={{ color: '#666' }}>
          Estrategias óptimas para mejorar tu puntaje SI con el presupuesto disponible.
        </p>
      </div>

      {/* Filtro de presupuesto */}
      <div className="recomendaciones-filtro">
        <label htmlFor="presupuesto-input">Presupuesto disponible (USD):</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontWeight: 'bold',
            }}>
              $
            </span>
            <input
              id="presupuesto-input"
              name="presupuesto-input"
              type="number"
              min="0"
              step="1000"
              value={presupuesto === 0 ? '' : presupuesto}
              onChange={(e) => {
                const valor = e.target.value.replace(/^0+/, '') || '0';
                setPresupuesto(parseInt(valor, 10) || 0);
              }}
              className="form-input"
              style={{
                width: '100%',
                padding: '10px 10px 10px 28px',
                borderRadius: '5px',
                border: '2px solid #ddd',
                fontSize: '1rem',
                color: '#333',
                background: '#fff',
              }}
              placeholder="Ingresa un monto"
            />
          </div>

          <span style={{ color: '#666', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            USD
          </span>

          <button
            onClick={manejarGenerar}
            disabled={generando}
            style={{
              padding: '10px 25px',
              background: generando ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: generando ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {generando ? '⏳ Generando...' : '🔄 Generar'}
          </button>
        </div>

        {/* Botones de acceso rápido */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            Montos rápidos:
          </span>
          {[10000, 25000, 50000, 100000, 250000].map((monto) => (
            <button
              key={monto}
              onClick={() => setPresupuesto(monto)}
              style={{
                padding: '5px 12px',
                border: presupuesto === monto ? '2px solid #4caf50' : '1px solid #ddd',
                background: presupuesto === monto ? '#e8f5e9' : 'white',
                borderRadius: '15px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: presupuesto === monto ? 'bold' : 'normal',
                color: presupuesto === monto ? '#2e7d32' : '#555',
              }}
            >
              ${(monto / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
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

      {/* Info actual */}
      <div className="recomendaciones-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <strong>Puntaje SI actual:</strong> {puntajeSIActual.toFixed(1)} pts
          </div>
          {rankingActual && (
            <div>
              <strong>Ranking actual:</strong> #{rankingActual}
            </div>
          )}
          <div>
            <strong>Presupuesto:</strong> ${presupuesto.toLocaleString()} USD
          </div>
        </div>
      </div>

      {/* Lista de recomendaciones */}
      {recomendaciones.length > 0 ? (
        <div className="recomendaciones-lista">
          {recomendaciones.map((rec, index) => (
            <div key={index} className="recomendacion-card">
              <div className="recomendacion-header">
                <span className="recomendacion-emoji">{getEmoji(index)}</span>
                <span className="recomendacion-puesto">#{index + 1}</span>
              </div>

              <h3>
                {getNombreTipo(rec.tipo)}
                {rec.indicador_objetivo && (
                  <span style={{
                    marginLeft: '10px',
                    fontSize: '0.85rem',
                    color: '#666',
                    fontWeight: 'normal',
                  }}>
                    (para {rec.indicador_objetivo})
                  </span>
                )}
              </h3>

              <div className="recomendacion-detalles">
                {rec.area_m2 && (
                  <p>📐 Área sugerida: <strong>{rec.area_m2.toLocaleString()} m²</strong></p>
                )}
                <p>
                  📈 Ganancia SI:{' '}
                  <strong style={{ color: '#4caf50' }}>
                    +{rec.ganancia_si.toFixed(1)} pts ({rec.porcentaje_ganancia_si.toFixed(1)}%)
                  </strong>
                </p>
                {rec.posiciones_mejoradas > 0 ? (
                  <p>
                    🏆 Ranking: <strong>#{rec.ranking_predicho}</strong>{' '}
                    (mejora {rec.posiciones_mejoradas} posiciones)
                  </p>
                ) : (
                  <p>
                    🏆 Ranking: <strong>#{rec.ranking_predicho || 'N/A'}</strong>
                  </p>
                )}
                <p>
                  💰 Costo estimado:{' '}
                  <strong>${rec.costo_estimado_usd?.toLocaleString() || '0'} USD</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
                  {rec.descripcion}
                </p>
              </div>

              <Link to="/simulacion" className="recomendacion-btn">
                🚀 Simular esta intervención
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '10px',
          color: '#666',
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            ⚠️ No hay recomendaciones disponibles
          </p>
          <small>
            Prueba aumentar el presupuesto (las intervenciones más económicas cuestan ~$20,000)
            o registrar más zonas verdes en tu campus.
          </small>
        </div>
      )}

      {/* Áreas mínimas para avanzar */}
      {areasMinimas.length > 0 && (
        <div style={{
          marginTop: '40px',
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ color: '#2e7d32', marginTop: 0 }}>
            📌 Áreas mínimas para avanzar de rango
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
            Área adicional necesaria para subir al siguiente rango de puntuación en cada indicador.
          </p>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Indicador
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                  Actual
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                  Siguiente rango
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                  Área adicional
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                  Ganancia
                </th>
              </tr>
            </thead>
            <tbody>
              {areasMinimas.map((area) => (
                <tr key={area.indicador}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <strong>{area.indicador}</strong>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {area.porcentaje_actual.toFixed(2)}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {area.siguiente_rango_pct.toFixed(2)}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    <strong>{area.area_adicional_m2.toLocaleString()} m²</strong>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      +{area.ganancia_puntaje_si.toFixed(1)} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Recomendaciones;