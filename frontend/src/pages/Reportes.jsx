import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { descargarReportePDF, obtenerDatosGraficos } from '../services/reportesService';
import './Reportes.css';

const Reportes = () => {
  const { campusActual, loading: loadingCampus } = useCampus();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (loadingCampus) return;
      if (!campusActual) {
        setError('No tienes un campus registrado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const datosGraficos = await obtenerDatosGraficos(campusActual.id);
        setDatos(datosGraficos);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };
    cargarDatos();
  }, [campusActual, loadingCampus]);

  const manejarDescargar = async () => {
    if (!campusActual) return;
    try {
      setDescargando(true);
      setMensaje(null);
      await descargarReportePDF(campusActual.id);
      setMensaje({ texto: '✅ Reporte descargado exitosamente', tipo: 'success' });
    } catch (err) {
      console.error('Error al descargar:', err);
      setMensaje({ texto: '❌ Error al descargar el reporte', tipo: 'error' });
    } finally {
      setDescargando(false);
    }
  };

  if (loading || loadingCampus) {
    return (
      <div className="reportes-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando reportes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1>📄 Reportes de Sostenibilidad - {campusActual?.nombre}</h1>
        <p style={{ color: '#666' }}>
          Genera un reporte PDF completo con todos los indicadores, gráficos,
          simulaciones y recomendaciones de tu campus.
        </p>
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 20px', marginBottom: '20px', borderRadius: '6px',
          background: mensaje.tipo === 'success' ? '#e8f5e9' : '#ffebee',
          color: mensaje.tipo === 'success' ? '#2e7d32' : '#c62828',
          fontWeight: 'bold',
        }}>
          {mensaje.texto}
        </div>
      )}

      <div className="reportes-content">
        <div className="reporte-card">
          <div className="reporte-icon">📊</div>
          <h2>Reporte Completo de Sostenibilidad</h2>
          <p className="reporte-descripcion">
            Documento profesional en PDF con toda la información de tu campus.
          </p>

          <div className="reporte-contenido">
            <h3>📋 El reporte incluye:</h3>
            <ul>
              <li>✅ <strong>Portada</strong> con resumen ejecutivo</li>
              <li>✅ <strong>Indicadores SI 1-8</strong> con gráfico</li>
              <li>✅ <strong>Perfil de sostenibilidad</strong> (radar)</li>
              <li>✅ <strong>Distribución de zonas verdes</strong> (torta)</li>
              <li>✅ <strong>Historial de simulaciones</strong></li>
              <li>✅ <strong>Recomendaciones</strong> con áreas y costos</li>
              <li>✅ <strong>Áreas mínimas</strong> para avanzar</li>
              <li>✅ <strong>Checklist SI 5-8</strong> con items faltantes</li>
            </ul>
          </div>

          {datos && (
            <div className="reporte-stats">
              <div className="stat">
                <div className="stat-valor">{(datos.indicadores || []).length}</div>
                <div className="stat-label">Indicadores SI</div>
              </div>
              <div className="stat">
                <div className="stat-valor">
                  {datos.indicadores
                    ? datos.indicadores.reduce((sum, i) => sum + i.puntaje, 0).toFixed(0)
                    : 0}
                </div>
                <div className="stat-label">Puntaje Total</div>
              </div>
              <div className="stat">
                <div className="stat-valor">{datos.simulaciones ? datos.simulaciones.length : 0}</div>
                <div className="stat-label">Simulaciones</div>
              </div>
              <div className="stat">
                <div className="stat-valor">
                  {datos.ranking_estimado ? `#${datos.ranking_estimado}` : 'N/A'}
                </div>
                <div className="stat-label">Ranking</div>
              </div>
            </div>
          )}

          <button
            onClick={manejarDescargar}
            disabled={descargando}
            className="btn-descargar"
            style={{
              opacity: descargando ? 0.6 : 1,
              cursor: descargando ? 'wait' : 'pointer',
            }}
          >
            {descargando ? (
              <>
                <span className="spinner"></span>
                Generando PDF... (puede tardar 10 seg)
              </>
            ) : (
              <>📥 Descargar Reporte PDF</>
            )}
          </button>

          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '15px' }}>
            💡 El PDF se genera con los datos más recientes de tu campus.
          </p>
        </div>

        <div className="reporte-card">
          <div className="reporte-icon">📊</div>
          <h2>Datos para Gráficos</h2>
          <p className="reporte-descripcion">
            Descarga los datos en formato JSON para análisis externo.
          </p>

          <pre style={{
            background: '#f5f5f5', padding: '15px', borderRadius: '6px',
            fontSize: '0.8rem', overflow: 'auto', maxHeight: '300px',
          }}>
{JSON.stringify({
  indicadores: datos?.indicadores?.length || 0,
  radar_categorias: Object.keys(datos?.radar_categorias || {}).length,
  zonas_por_tipo: Object.keys(datos?.zonas_por_tipo || {}).length,
  recomendaciones: datos?.recomendaciones?.length || 0,
  simulaciones: datos?.simulaciones?.length || 0,
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Reportes;