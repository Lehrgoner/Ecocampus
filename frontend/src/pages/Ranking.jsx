import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { listarCampus } from '../services/campusService';
import { obtenerIndicadores } from '../services/indicadoresService';
import { obtenerPerfil, actualizarPerfil } from '../services/perfilService';
import { predecirRanking } from '../services/rankingService';
import './Ranking.css';

// Máximos oficiales GreenMetric 2026
const CATEGORIAS = [
  { key: 'SI', nombre: 'Setting & Infrastructure', maximo: 1100, color: '#4CAF50' },
  { key: 'EC', nombre: 'Energy & Climate Change', maximo: 2000, color: '#2196F3' },
  { key: 'WS', nombre: 'Waste Management', maximo: 1700, color: '#FF9800' },
  { key: 'WR', nombre: 'Water Management', maximo: 1100, color: '#00BCD4' },
  { key: 'TR', nombre: 'Transportation', maximo: 1700, color: '#9C27B0' },
  { key: 'ED', nombre: 'Education & Research', maximo: 1300, color: '#F44336' },
];

// Tooltip personalizado para el gráfico de torta
const CustomTooltip = ({ active, payload, datosTorta }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = datosTorta.reduce((sum, d) => sum + d.value, 0);
    const porcentaje = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div style={{
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <strong style={{ color: data.color }}>{data.name}</strong><br />
        Puntaje: <strong>{data.value}</strong><br />
        Porcentaje: <strong>{porcentaje}%</strong>
      </div>
    );
  }
  return null;
};

const Ranking = () => {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const [puntajes, setPuntajes] = useState({
    SI: 0,
    EC: 0,
    WS: 0,
    WR: 0,
    TR: 0,
    ED: 0,
  });

  const [resultado, setResultado] = useState(null);
  const [prediciendo, setPrediciendo] = useState(false);

  // Refs para los inputs (para forzar actualización manual)
  const inputsRef = useRef({});

  // ============ CARGAR DATOS ============
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

        const indicadores = await obtenerIndicadores(miCampus.id);
        const perfil = await obtenerPerfil(miCampus.id);

        const nuevosPuntajes = {
          SI: Number(indicadores.puntaje_total_si) || 0,
          EC: Number(perfil.energia_clima) || 0,
          WS: Number(perfil.residuos) || 0,
          WR: Number(perfil.agua) || 0,
          TR: Number(perfil.transporte) || 0,
          ED: Number(perfil.educacion_investigacion) || 0,
        };

        console.log('✅ Datos cargados:', nuevosPuntajes);
        setPuntajes(nuevosPuntajes);

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // ============ ACTUALIZAR INPUTS CUANDO CAMBIAN LOS PUNTAJES ============
  useEffect(() => {
    // Sincronizar el valor de los inputs con el estado de React
    Object.keys(puntajes).forEach((key) => {
      const input = inputsRef.current[key];
      if (input && input.value !== String(puntajes[key])) {
        input.value = puntajes[key];
      }
    });
  }, [puntajes]);

  // ============ CAMBIAR PUNTAJE ============
  const handleCambioPuntaje = (categoria, valor) => {
    const numero = parseInt(valor) || 0;
    const cat = CATEGORIAS.find(c => c.key === categoria);
    const maximo = cat?.maximo || 1000;
    const acotado = Math.max(0, Math.min(maximo, numero));

    setPuntajes(prev => ({
      ...prev,
      [categoria]: acotado,
    }));
    setResultado(null);
  };

  // ============ PREDECIR RANKING ============
  const manejarPredecir = async () => {
    try {
      setPrediciendo(true);
      setResultado(null);

      const respuesta = await predecirRanking(puntajes);
      setResultado(respuesta);
      mostrarMensaje('✅ Predicción completada', 'success');
    } catch (err) {
      console.error('Error al predecir:', err);
      mostrarMensaje('❌ Error: ' + (err.message || 'Desconocido'), 'error');
    } finally {
      setPrediciendo(false);
    }
  };

  // ============ GUARDAR PUNTAJES ============
  const manejarGuardarPerfil = async () => {
    if (!campus) return;
    try {
      await actualizarPerfil(campus.id, {
        energia_clima: puntajes.EC,
        residuos: puntajes.WS,
        agua: puntajes.WR,
        transporte: puntajes.TR,
        educacion_investigacion: puntajes.ED,
      });
      mostrarMensaje('💾 Puntajes guardados en el perfil', 'success');
    } catch (err) {
      mostrarMensaje('❌ Error al guardar: ' + (err.message || ''), 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const calcularProgreso = (categoria) => {
    const cat = CATEGORIAS.find(c => c.key === categoria);
    if (!cat) return 0;
    return Math.min(100, (puntajes[categoria] / cat.maximo) * 100);
  };

  const puntajeTotal = Object.values(puntajes).reduce((a, b) => a + b, 0);
  const puntajeMaximoTotal = CATEGORIAS.reduce((sum, c) => sum + c.maximo, 0);

  const datosTorta = CATEGORIAS.map(cat => ({
    name: cat.key,
    value: puntajes[cat.key],
    color: cat.color,
  }));

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="ranking-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando ranking...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>🏆 Predicción de Ranking Global</h1>
        <p style={{ color: '#666' }}>
          Ajusta los puntajes de cada categoría y presiona "Predecir Ranking".
        </p>
      </div>

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

      <div className="ranking-content">
        {/* Formulario de puntajes */}
        <div className="puntajes-categorias">
          <h2>Puntajes por Categoría:</h2>
          {CATEGORIAS.map((cat) => (
            <div key={cat.key} className="categoria-item">
              <label htmlFor={`input-${cat.key}`}>
                {cat.key} - {cat.nombre}
              </label>
              <div className="categoria-input">
                <input
                  ref={(el) => { inputsRef.current[cat.key] = el; }}
                  id={`input-${cat.key}`}
                  name={`input-${cat.key}`}
                  type="number"
                  defaultValue={puntajes[cat.key] || 0}
                  onChange={(e) => handleCambioPuntaje(cat.key, e.target.value)}
                  className="form-input"
                  min="0"
                  max={cat.maximo}
                />
                <span>/{cat.maximo}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calcularProgreso(cat.key)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Puntaje total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
              {puntajeTotal} / {puntajeMaximoTotal}
            </div>
          </div>
        </div>

        {/* Predicción */}
        <div className="ranking-prediccion">
          <div className="ranking-box">
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Posición estimada</div>
            <div className="ranking-numero">
              {resultado ? `#${resultado.ranking_estimado}` : '#----'}
            </div>
            <p>Con {puntajeTotal} puntos</p>
            {resultado && (
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '10px' }}>
                Margen de error: ±103 posiciones (R² = 0.86)
              </p>
            )}
          </div>

          {/* Gráfico de torta */}
          <div className="grafico-torta-placeholder">
            <h3>Contribución por categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosTorta}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  labelLine={true}
                >
                  {datosTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip datosTorta={datosTorta} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="ranking-actions">
        <button
          className="btn-recalcular"
          onClick={manejarPredecir}
          disabled={prediciendo}
          style={{
            opacity: prediciendo ? 0.5 : 1,
            cursor: prediciendo ? 'not-allowed' : 'pointer',
          }}
        >
          {prediciendo ? '⏳ Prediciendo...' : '🔮 Predecir Ranking'}
        </button>

        <button
          className="btn-recalcular"
          onClick={manejarGuardarPerfil}
          style={{ background: '#4caf50' }}
        >
          💾 Guardar puntajes
        </button>
      </div>
    </div>
  );
};

export default Ranking;