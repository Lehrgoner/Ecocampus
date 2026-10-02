import React, { useState } from 'react';
import './Checklist.css';

const Checklist = () => {
  const [checklists, setChecklists] = useState({
    SI5: {
      nombre: 'SI 5 - Discapacidad y Maternidad',
      items: [
        { id: 1, texto: 'Rampas de acceso', completado: true },
        { id: 2, texto: 'Baños accesibles', completado: true },
        { id: 3, texto: 'Salas de lactancia', completado: false },
        { id: 4, texto: 'Pasamanos', completado: true },
        { id: 5, texto: 'Señalización táctil', completado: false },
      ],
      puntajeMaximo: 100,
    },
    SI6: {
      nombre: 'SI 6 - Seguridad y Protección',
      items: [
        { id: 1, texto: 'Extintores', completado: true },
        { id: 2, texto: 'Alarmas', completado: true },
        { id: 3, texto: 'CCTV 24/7', completado: false },
        { id: 4, texto: 'Brigada de emergencia', completado: true },
      ],
      puntajeMaximo: 100,
    },
    SI7: {
      nombre: 'SI 7 - Salud y Bienestar',
      items: [
        { id: 1, texto: 'Centro de salud', completado: true },
        { id: 2, texto: 'Programas de salud mental', completado: false },
        { id: 3, texto: 'Áreas de recreación', completado: true },
      ],
      puntajeMaximo: 100,
    },
    SI8: {
      nombre: 'SI 8 - Conservación',
      items: [
        { id: 1, texto: 'Programa de conservación', completado: true },
        { id: 2, texto: 'Biodiversidad', completado: false },
      ],
      puntajeMaximo: 100,
    },
  });

  const [seccionAbierta, setSeccionAbierta] = useState('SI5');

  const toggleSeccion = (seccion) => {
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  };

  const toggleItem = (seccion, itemId) => {
    setChecklists(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        items: prev[seccion].items.map(item =>
          item.id === itemId ? { ...item, completado: !item.completado } : item
        ),
      },
    }));
  };

  const calcularProgreso = (seccion) => {
    const completados = checklists[seccion].items.filter(i => i.completado).length;
    const total = checklists[seccion].items.length;
    return Math.round((completados / total) * 100);
  };

  const calcularPuntaje = (seccion) => {
    const progreso = calcularProgreso(seccion);
    return Math.round((progreso / 100) * checklists[seccion].puntajeMaximo);
  };

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <h1>✅ Checklist de Infraestructura</h1>
      </div>

      {Object.entries(checklists).map(([key, seccion]) => {
        const progreso = calcularProgreso(key);
        const puntaje = calcularPuntaje(key);
        const estaAbierta = seccionAbierta === key;

        return (
          <div key={key} className="checklist-seccion">
            <div
              className="checklist-header-seccion"
              onClick={() => toggleSeccion(key)}
            >
              <h3>{seccion.nombre}</h3>
              <span>{estaAbierta ? '▼' : '▶'}</span>
            </div>

            <div className="checklist-progreso">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <span>{puntaje}/{seccion.puntajeMaximo} pts</span>
            </div>

            {estaAbierta && (
              <div className="checklist-items">
                {seccion.items.map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.completado}
                      onChange={() => toggleItem(key, item.id)}
                    />
                    <span>{item.texto}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="checklist-actions">
        <button className="btn-guardar">💾 Guardar cambios</button>
      </div>
    </div>
  );
};

export default Checklist;