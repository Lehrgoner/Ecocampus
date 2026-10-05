import React, { useState, useEffect } from 'react';
import { listarCampus } from '../services/campusService';
import { descargarReportePDF, obtenerDatosGraficos } from '../services/reportesService';
import './Reportes.css';

const Reportes = () => {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [datos, setDatos] = useState(null);

  // ============ CARGAR CAMPUS Y DATOS ============
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

        // Cargar datos para vista previa
        const datosGraficos = await obtenerDatosGraficos(miCampus.id);
        setDatos(datosGraficos);

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // ============ DESCARGAR PDF ============
  const manejarDescargar = async () => {
    if (!campus) return;

    try {
      setDescargando(true);
      setMensaje(null);

      await descargarReportePDF(campus.id);

      setMensaje({
        texto: '✅ Reporte descargado exitosamente',
        tipo: 'success',
      });
    } catch (err) {
      console.error('Error al descargar:', err);
      setMensaje({
        texto: '❌ Error al descargar el reporte: ' + (err.message || 'Desconocido'),
        tipo: 'error',
      });
    } finally {
      setDescargando(false);
    }
  };

  // ============ RENDER ============
  if (loading) {
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
        <h1>📄 Reportes de Sostenibilidad</h1>
        <p style={{ color: '#666' }}>
          Genera un reporte PDF completo con todos los indicadores, gráficos,
          simulaciones y recomendaciones de tu campus.
        </p>
      </div>

      {/* Mensaje */}
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

      <div className="reportes-content">
        {/* Card principal */}
        <div className="reporte-card">
          <div className="reporte-icon">📊</div>

          <h2>Reporte Completo de Sostenibilidad</h2>

          <p className="reporte-descripcion">
            Documento profesional en PDF con toda la información de tu campus
            y su desempeño en los indicadores UI GreenMetric.
          </p>

          {/* Contenido del PDF */}
          <div className="reporte-contenido">
            <h3>📋 El reporte incluye:</h3>
            <ul>
              <li>✅ <strong>Portada</strong> con resumen ejecutivo</li>
              <li>✅ <strong>Indicadores SI 1-8</strong> con tabla y gráfico de barras</li>
              <li>✅ <strong>Perfil de sostenibilidad</strong> (radar de 6 categorías)</li>
              <li>✅ <strong>Distribución de zonas verdes</strong> (gráfico de torta)</li>
              <li>✅ <strong>Historial de simulaciones</strong> (últimas 10)</li>
              <li>✅ <strong>Recomendaciones</strong> con áreas exactas y costos</li>
              <li>✅ <strong>Áreas mínimas</strong> para avanzar de rango</li>
              <li>✅ <strong>Checklist SI 5-8</strong> con items faltantes</li>
            </ul>
          </div>

          {/* Stats del campus */}
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
                <div className="stat-valor">
                  {datos.simulaciones ? datos.simulaciones.length : 0}
                </div>
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

          {/* Botón de descarga */}
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

        {/* Card secundaria: descarga de datos */}
        <div className="reporte-card">
          <div className="reporte-icon">📊</div>

          <h2>Datos para Gráficos</h2>

          <p className="reporte-descripcion">
            Descarga los datos en formato JSON para análisis externo o integración
            con otras herramientas.
          </p>

          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            overflow: 'auto',
            maxHeight: '300px',
          }}>
{JSON.stringify({
  indicadores: datos?.indicadores?.length || 0,
  radar_categorias: Object.keys(datos?.radar_categorias || {}).length,
  zonas_por_tipo: Object.keys(datos?.zonas_por_tipo || {}).length,
  recomendaciones: datos?.recomendaciones?.length || 0,
  simulaciones: datos?.simulaciones?.length || 0,
}, null, 2)}
          </pre>

          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '15px' }}>
            Los datos completos están disponibles en <code>/reportes/datos-graficos</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reportes;