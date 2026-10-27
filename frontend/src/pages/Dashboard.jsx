import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { obtenerDatosGraficos } from '../services/reportesService';
import { useCampus } from '../context/CampusContext';
import './Dashboard.css';

const Dashboard = () => {
  const { campusActual, loading: loadingCampus } = useCampus();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indicadores, setIndicadores] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [rankingEstimado, setRankingEstimado] = useState(null);
  const [puntajeTotal, setPuntajeTotal] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      if (loadingCampus) return;

      if (!campusActual) {
        setError('No tienes un campus registrado. Crea uno en Configuración.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const datos = await obtenerDatosGraficos(campusActual.id);

        setIndicadores(datos.indicadores || []);
        setRankingEstimado(datos.ranking_estimado);

        if (datos.radar_categorias) {
          const radar = Object.entries(datos.radar_categorias).map(([key, value]) => ({
            categoria: key,
            valor: value,
          }));
          setRadarData(radar);
        }

        const total = (datos.indicadores || []).reduce((sum, ind) => sum + ind.puntaje, 0);
        setPuntajeTotal(total);
        setError(null);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [campusActual, loadingCampus]);

  const getColorSemaforo = (porcentaje) => {
    if (porcentaje >= 70) return '#4caf50';
    if (porcentaje >= 40) return '#ff9800';
    return '#f44336';
  };

  if (loading || loadingCampus) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
          <Link to="/configuracion" className="btn-nueva-simulacion">
            Ir a Configuración
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏛️ Dashboard - {campusActual?.nombre}</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Puntaje total SI: <strong>{puntajeTotal.toFixed(1)} / 1100 pts</strong>
        </p>
      </div>

      <div className="puntajes-grid">
        {indicadores.map((ind) => {
          const porcentaje = ind.porcentaje || 0;
          return (
            <div key={ind.codigo} className="puntaje-card">
              <h3>{ind.codigo}</h3>
              <div className="puntaje-valor">{ind.puntaje.toFixed(1)}</div>
              <div className="puntaje-maximo">/{ind.puntaje_maximo}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(porcentaje, 100)}%`,
                    backgroundColor: getColorSemaforo(porcentaje),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <div className="radar-section">
          <h2>📊 Indicadores SI 1-8</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={indicadores.map(i => ({
              codigo: i.codigo,
              puntaje: i.puntaje,
              maximo: i.puntaje_maximo,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="codigo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="puntaje" fill="#4caf50" name="Actual" />
              <Bar dataKey="maximo" fill="#e0e0e0" name="Máximo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="radar-section">
          <h2>📊 Categorías GreenMetric</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="categoria" />
              <PolarRadiusAxis />
              <Radar name="Puntaje" dataKey="valor" stroke="#4caf50" fill="#4caf50" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ranking-section" style={{ marginTop: '30px' }}>
        <h2>🏆 Ranking Global</h2>
        <div className="ranking-display">
          <div className="ranking-numero">#{rankingEstimado || 'N/A'}</div>
          <p>Posición estimada</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/simulacion" className="btn-nueva-simulacion">
          🚀 Nueva Simulación
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;