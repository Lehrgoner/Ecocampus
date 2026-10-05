import React, { useState, useEffect } from 'react';
import { listarCampus } from '../services/campusService';
import { obtenerChecklist, actualizarChecklist } from '../services/checklistService';
import './Checklist.css';

const SECCIONES = {
  SI5: {
    nombre: 'SI 5 - Discapacidad y Maternidad',
    descripcion: 'Instalaciones para personas con discapacidad, necesidades especiales y/o atención de maternidad',
    maximo: 100,
    items: [
      { key: 'si5_rampas', texto: 'Rampas de acceso' },
      { key: 'si5_banos_accesibles', texto: 'Baños accesibles' },
      { key: 'si5_pasamanos', texto: 'Pasamanos' },
      { key: 'si5_ascensores', texto: 'Ascensores' },
      { key: 'si5_senializacion', texto: 'Señalización' },
      { key: 'si5_rutas_accesibles', texto: 'Rutas accesibles' },
      { key: 'si5_estacionamiento', texto: 'Estacionamiento accesible' },
      { key: 'si5_sala_lactancia', texto: 'Sala de lactancia' },
      { key: 'si5_cambiadores', texto: 'Cambiadores' },
      { key: 'si5_apoyos_visuales', texto: 'Apoyos visuales' },
    ],
  },
  SI6: {
    nombre: 'SI 6 - Seguridad y Protección',
    descripcion: 'Instalaciones de seguridad y protección',
    maximo: 100,
    items: [
      { key: 'si6_extintores', texto: 'Extintores' },
      { key: 'si6_alarmas', texto: 'Alarmas' },
      { key: 'si6_cctv', texto: 'CCTV' },
      { key: 'si6_personal_seguridad', texto: 'Personal de seguridad' },
      { key: 'si6_botones_panico', texto: 'Botones de pánico' },
      { key: 'si6_app_emergencia', texto: 'App de emergencia' },
      { key: 'si6_salidas_emergencia', texto: 'Salidas de emergencia' },
      { key: 'si6_sistema_contra_incendios', texto: 'Sistema contra incendios' },
      { key: 'si6_refugios', texto: 'Refugios' },
      { key: 'si6_primeros_auxilios', texto: 'Primeros auxilios' },
      { key: 'si6_iluminacion_emergencia', texto: 'Iluminación de emergencia' },
      { key: 'si6_simulacros', texto: 'Simulacros' },
      { key: 'si6_control_acceso', texto: 'Control de acceso' },
    ],
  },
  SI7: {
    nombre: 'SI 7 - Salud y Bienestar',
    descripcion: 'Infraestructura de salud para el bienestar',
    maximo: 100,
    items: [
      { key: 'si7_servicio_medico', texto: 'Servicio médico' },
      { key: 'si7_ambulancia', texto: 'Ambulancia' },
      { key: 'si7_consultorio_dental', texto: 'Consultorio dental' },
      { key: 'si7_apoyo_psicologico', texto: 'Apoyo psicológico' },
      { key: 'si7_gimnasio', texto: 'Gimnasio' },
      { key: 'si7_cancha_deportiva', texto: 'Cancha deportiva' },
      { key: 'si7_agua_potable', texto: 'Agua potable' },
      { key: 'si7_comedor', texto: 'Comedor' },
      { key: 'si7_lactario', texto: 'Lactario' },
      { key: 'si7_guarderia', texto: 'Guardería' },
    ],
  },
  SI8: {
    nombre: 'SI 8 - Conservación',
    descripcion: 'Conservación de flora, fauna, vida silvestre y recursos genéticos',
    maximo: 100,
    items: [
      { key: 'si8_jardin_botanico', texto: 'Jardín botánico' },
      { key: 'si8_banco_semillas', texto: 'Banco de semillas' },
      { key: 'si8_invernadero', texto: 'Invernadero' },
      { key: 'si8_area_conservacion', texto: 'Área de conservación' },
      { key: 'si8_programa_reforestacion', texto: 'Programa de reforestación' },
      { key: 'si8_inventario_flora', texto: 'Inventario de flora' },
      { key: 'si8_inventario_fauna', texto: 'Inventario de fauna' },
      { key: 'si8_especies_amenazadas', texto: 'Especies amenazadas' },
      { key: 'si8_programa_reintroduccion', texto: 'Programa de reintroducción' },
      { key: 'si8_corredor_biologico', texto: 'Corredor biológico' },
      { key: 'si8_compostaje', texto: 'Compostaje' },
      { key: 'si8_agricultura_organica', texto: 'Agricultura orgánica' },
      { key: 'si8_investigacion_biodiversidad', texto: 'Investigación en biodiversidad' },
      { key: 'si8_educacion_ambiental', texto: 'Educación ambiental' },
    ],
  },
};

const calcularNivel = (seccion, cumplidos) => {
  if (cumplidos === 0) return 1;

  if (seccion === 'SI5') {
    if (cumplidos <= 2) return 2;
    if (cumplidos <= 5) return 3;
    if (cumplidos <= 8) return 4;
    return 5;
  }
  if (seccion === 'SI6') {
    if (cumplidos <= 3) return 2;
    if (cumplidos <= 7) return 3;
    if (cumplidos <= 10) return 4;
    return 5;
  }
  if (seccion === 'SI7') {
    if (cumplidos <= 2) return 2;
    if (cumplidos <= 5) return 3;
    if (cumplidos <= 8) return 4;
    return 5;
  }
  if (seccion === 'SI8') {
    if (cumplidos <= 3) return 2;
    if (cumplidos <= 7) return 3;
    if (cumplidos <= 11) return 4;
    return 5;
  }
  return 1;
};

const calcularPuntajePorNivel = (nivel) => {
  const multiplicadores = { 1: 0.05, 2: 0.25, 3: 0.50, 4: 0.75, 5: 1.00 };
  return (multiplicadores[nivel] || 0.05) * 100;
};

const Checklist = () => {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const [seccionAbierta, setSeccionAbierta] = useState('SI5');
  const [estado, setEstado] = useState({
    si5_rampas: false,
    si5_banos_accesibles: false,
    si5_pasamanos: false,
    si5_ascensores: false,
    si5_senializacion: false,
    si5_rutas_accesibles: false,
    si5_estacionamiento: false,
    si5_sala_lactancia: false,
    si5_cambiadores: false,
    si5_apoyos_visuales: false,
    si6_extintores: false,
    si6_alarmas: false,
    si6_cctv: false,
    si6_personal_seguridad: false,
    si6_botones_panico: false,
    si6_app_emergencia: false,
    si6_salidas_emergencia: false,
    si6_sistema_contra_incendios: false,
    si6_refugios: false,
    si6_primeros_auxilios: false,
    si6_iluminacion_emergencia: false,
    si6_simulacros: false,
    si6_control_acceso: false,
    si7_servicio_medico: false,
    si7_ambulancia: false,
    si7_consultorio_dental: false,
    si7_apoyo_psicologico: false,
    si7_gimnasio: false,
    si7_cancha_deportiva: false,
    si7_agua_potable: false,
    si7_comedor: false,
    si7_lactario: false,
    si7_guarderia: false,
    si8_jardin_botanico: false,
    si8_banco_semillas: false,
    si8_invernadero: false,
    si8_area_conservacion: false,
    si8_programa_reforestacion: false,
    si8_inventario_flora: false,
    si8_inventario_fauna: false,
    si8_especies_amenazadas: false,
    si8_programa_reintroduccion: false,
    si8_corredor_biologico: false,
    si8_compostaje: false,
    si8_agricultura_organica: false,
    si8_investigacion_biodiversidad: false,
    si8_educacion_ambiental: false,
  });

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

        const checklist = await obtenerChecklist(miCampus.id);

        const nuevoEstado = {};
        Object.keys(estado).forEach(key => {
          nuevoEstado[key] = checklist[key] || false;
        });

        setEstado(nuevoEstado);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar:', err);
        setError(err.message || 'Error al cargar los datos');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // ============ TOGGLE CHECKBOX ============
  const toggleItem = (key) => {
    setEstado(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ============ GUARDAR ============
  const manejarGuardar = async () => {
    if (!campus) return;

    try {
      setGuardando(true);
      setMensaje(null);
      setGuardadoExitoso(false);

      await actualizarChecklist(campus.id, estado);

      setMensaje({
        texto: '✅ Checklist guardado correctamente',
        tipo: 'success',
      });

      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
      setMensaje({
        texto: '❌ Error al guardar: ' + (err.message || 'Desconocido'),
        tipo: 'error',
      });
    } finally {
      setGuardando(false);
    }
  };

  // ============ HELPERS ============
  const contarCumplidos = (seccion) => {
    return SECCIONES[seccion].items.filter(item => estado[item.key]).length;
  };

  const totalCumplidos = Object.keys(SECCIONES).reduce(
    (sum, seccion) => sum + contarCumplidos(seccion),
    0
  );

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="checklist-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando checklist...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checklist-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <h1>✅ Checklist - {campus?.nombre}</h1>
        <p style={{ color: '#666' }}>
          Marca los ítems que tiene tu campus. Los indicadores SI 5-8 se calculan
          automáticamente según los niveles alcanzados.
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

      <div style={{
        background: '#e8f5e9',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px',
      }}>
        <div>
          <strong>Total de ítems cumplidos:</strong> {totalCumplidos} / 47
        </div>
        <div>
          <strong>Progreso general:</strong> {Math.round((totalCumplidos / 47) * 100)}%
        </div>
      </div>

      {Object.entries(SECCIONES).map(([key, seccion]) => {
        const cumplidos = contarCumplidos(key);
        const total = seccion.items.length;
        const nivel = calcularNivel(key, cumplidos);
        const puntaje = calcularPuntajePorNivel(nivel);
        const estaAbierta = seccionAbierta === key;
        const porcentaje = Math.round((cumplidos / total) * 100);

        return (
          <div key={key} className="checklist-seccion">
            <div
              className="checklist-header-seccion"
              onClick={() => setSeccionAbierta(estaAbierta ? null : key)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>
                  {estaAbierta ? '▼' : '▶'} {seccion.nombre}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                  {seccion.descripcion}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: puntaje >= 50 ? '#4caf50' : puntaje >= 25 ? '#ff9800' : '#f44336',
                }}>
                  Nivel {nivel}/5
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {puntaje.toFixed(0)}/100 pts
                </div>
              </div>
            </div>

            <div className="checklist-progreso" style={{ marginTop: '10px' }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${porcentaje}%`,
                    backgroundColor: puntaje >= 50 ? '#4caf50' : puntaje >= 25 ? '#ff9800' : '#f44336',
                  }}
                />
              </div>
              <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                {cumplidos}/{total} ítems
              </span>
            </div>

            {estaAbierta && (
              <div className="checklist-items" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '10px',
                marginTop: '15px',
                padding: '15px',
                background: '#f9f9f9',
                borderRadius: '8px',
              }}>
                {seccion.items.map((item) => (
                  <label
                    key={item.key}
                    className="checklist-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: estado[item.key] ? '#e8f5e9' : 'white',
                      border: estado[item.key] ? '2px solid #4caf50' : '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={estado[item.key]}
                      onChange={() => toggleItem(item.key)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{
                      fontWeight: estado[item.key] ? 'bold' : 'normal',
                      color: estado[item.key] ? '#2e7d32' : '#555',
                    }}>
                      {item.texto}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="checklist-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          className="btn-guardar"
          onClick={manejarGuardar}
          disabled={guardando}
          style={{
            padding: '15px 50px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: guardadoExitoso
              ? 'linear-gradient(135deg, #4caf50 0%, #1B5E20 100%)'
              : guardando
              ? '#ccc'
              : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: guardando ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s',
          }}
        >
          {guardando
            ? '⏳ Guardando...'
            : guardadoExitoso
            ? '✅ ¡Guardado exitosamente!'
            : '💾 Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default Checklist;