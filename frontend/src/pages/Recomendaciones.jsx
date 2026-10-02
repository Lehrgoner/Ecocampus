import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Recomendaciones.css';

const Recomendaciones = () => {
  const [presupuesto, setPresupuesto] = useState(5000);

  const recomendaciones = [
    {
      id: 1,
      puesto: 1,
      emoji: '🥇',
      tipo: 'Bosque académico',
      area: 300,
      impactoSI: 18,
      impactoRanking: 12,
      costo: 2500,
      accion: '/simulacion',
      accionTexto: '🚀 Simular',
    },
    {
      id: 2,
      puesto: 2,
      emoji: '',
      tipo: 'Jardín de lluvia',
      area: 150,
      impactoSI: 10,
      impactoRanking: 7,
      costo: 1200,
      accion: '/simulacion',
      accionTexto: '🚀 Simular',
    },
    {
      id: 3,
      puesto: 3,
      emoji: '🥉',
      tipo: 'Completar checklist SI 5',
      area: null,
      impactoSI: 40,
      impactoRanking: 8,
      costo: 800,
      accion: '/checklist',
      accionTexto: '✅ Ir a Checklist',
    },
  ];

  return (
    <div className="recomendaciones-container">
      <div className="recomendaciones-header">
        <h1>💡 Recomendaciones Inteligentes</h1>
      </div>

      <div className="recomendaciones-filtro">
        <label>Presupuesto disponible:</label>
        <select
          value={presupuesto}
          onChange={(e) => setPresupuesto(parseInt(e.target.value))}
          className="form-select"
        >
          <option value={1000}>$1,000 USD</option>
          <option value={5000}>$5,000 USD</option>
          <option value={10000}>$10,000 USD</option>
          <option value={50000}>$50,000 USD</option>
        </select>
      </div>

      <div className="recomendaciones-info">
        <p>
          Mejores estrategias para subir en el ranking con un presupuesto de{' '}
          <strong>${presupuesto.toLocaleString()} USD</strong>:
        </p>
      </div>

      <div className="recomendaciones-lista">
        {recomendaciones.map((rec) => (
          <div key={rec.id} className="recomendacion-card">
            <div className="recomendacion-header">
              <span className="recomendacion-emoji">{rec.emoji}</span>
              <span className="recomendacion-puesto">#{rec.puesto}</span>
            </div>

            <h3>{rec.tipo}</h3>

            <div className="recomendacion-detalles">
              {rec.area && <p>📐 Área: {rec.area} m²</p>}
              <p>📈 Impacto SI: +{rec.impactoSI} pts</p>
              <p>🏆 Impacto Ranking: +{rec.impactoRanking} posiciones</p>
              <p>💰 Costo est: ${rec.costo.toLocaleString()} USD</p>
            </div>

            <Link to={rec.accion} className="recomendacion-btn">
              {rec.accionTexto}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recomendaciones;