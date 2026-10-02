import React, { useState } from 'react';
import './Ranking.css';

const Ranking = () => {
  const [puntajes, setPuntajes] = useState({
    SI: 600,
    EC: 500,
    WS: 400,
    WR: 300,
    TR: 450,
    ED: 550,
  });

  const [rankingEstimado, setRankingEstimado] = useState(430);
  const [rankingAnterior, setRankingAnterior] = useState(450);

  const categorias = [
    { key: 'SI', nombre: 'Setting & Infrastructure', maximo: 1100 },
    { key: 'EC', nombre: 'Energy & Climate Change', maximo: 900 },
    { key: 'WS', nombre: 'Waste Management', maximo: 750 },
    { key: 'WR', nombre: 'Water Management', maximo: 650 },
    { key: 'TR', nombre: 'Transportation', maximo: 700 },
    { key: 'ED', nombre: 'Education', maximo: 900 },
  ];

  const handleCambioPuntaje = (categoria, valor) => {
    setPuntajes(prev => ({
      ...prev,
      [categoria]: parseInt(valor) || 0,
    }));
  };

  const calcularProgreso = (categoria) => {
    const cat = categorias.find(c => c.key === categoria);
    return (puntajes[categoria] / cat.maximo) * 100;
  };

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>🏆 Predicción de Ranking Global</h1>
      </div>

      <div className="ranking-content">
        <div className="puntajes-categorias">
          <h2>Puntajes por Categoría:</h2>
          {categorias.map((cat) => (
            <div key={cat.key} className="categoria-item">
              <label>{cat.key} - {cat.nombre}</label>
              <div className="categoria-input">
                <input
                  type="number"
                  value={puntajes[cat.key]}
                  onChange={(e) => handleCambioPuntaje(cat.key, e.target.value)}
                  className="form-input"
                />
                <span>/{cat.maximo}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${calcularProgreso(cat.key)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="ranking-prediccion">
          <div className="ranking-box">
            <div className="ranking-numero">#{rankingEstimado}</div>
            <p>Posición estimada</p>
            <div className="ranking-cambio">
              {rankingAnterior > rankingEstimado ? (
                <span className="mejora">
                  ▲ {rankingAnterior - rankingEstimado} posiciones
                </span>
              ) : (
                <span className="empeora">
                  ▼ {rankingEstimado - rankingAnterior} posiciones
                </span>
              )}
            </div>
            <p className="ranking-anterior">(anterior: #{rankingAnterior})</p>
          </div>

          <div className="grafico-torta-placeholder">
            <h3>Contribución por categoría</h3>
            <p>* Aquí iría un gráfico de torta</p>
          </div>
        </div>
      </div>

      <div className="ranking-actions">
        <button className="btn-recalcular"> Recalcular</button>
      </div>
    </div>
  );
};

export default Ranking;