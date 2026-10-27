import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { crearCampus, actualizarCampus } from '../services/campusService';
import { obtenerPerfil, actualizarPerfil } from '../services/perfilService';
import './Configuracion.css';

const Configuracion = () => {
  const { campusActual, campusList, recargarCampus, loading: loadingCampus } = useCampus();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [guardandoCampus, setGuardandoCampus] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardadoCampusExitoso, setGuardadoCampusExitoso] = useState(false);
  const [guardadoPerfilExitoso, setGuardadoPerfilExitoso] = useState(false);
  const [modoCrear, setModoCrear] = useState(false);

  const [campusForm, setCampusForm] = useState({
    nombre: '', area_total_m2: 100000, poblacion_total: 5000, ciudad: '', pais: '',
  });

  const [perfilForm, setPerfilForm] = useState({
    energia_clima: 1000, residuos: 850, agua: 550, transporte: 850, educacion_investigacion: 650,
  });

  useEffect(() => {
    if (loadingCampus) return;

    if (campusActual && !modoCrear) {
      setCampusForm({
        nombre: campusActual.nombre || '',
        area_total_m2: campusActual.area_total_m2 || 100000,
        poblacion_total: campusActual.poblacion_total || 5000,
        ciudad: campusActual.ciudad || '',
        pais: campusActual.pais || '',
      });

      obtenerPerfil(campusActual.id).then(perfil => {
        setPerfilForm({
          energia_clima: perfil.energia_clima || 1000,
          residuos: perfil.residuos || 850,
          agua: perfil.agua || 550,
          transporte: perfil.transporte || 850,
          educacion_investigacion: perfil.educacion_investigacion || 650,
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [campusActual, loadingCampus, modoCrear]);

  const handleCampusChange = (e) => {
    const { name, value } = e.target;
    const esNumerico = name === 'area_total_m2' || name === 'poblacion_total';
    setCampusForm(prev => ({
      ...prev,
      [name]: esNumerico
        ? (value === '' ? '' : parseInt(value.replace(/^0+/, ''), 10) || 0)
        : value,
    }));
  };

  const manejarGuardarCampus = async () => {
    try {
      setGuardandoCampus(true);
      setMensaje(null);
      setGuardadoCampusExitoso(false);

      if (!campusForm.nombre || !campusForm.area_total_m2 || !campusForm.poblacion_total) {
        setMensaje({ texto: '⚠️ Nombre, área y población son obligatorios', tipo: 'error' });
        setGuardandoCampus(false);
        return;
      }

      if (campusActual && !modoCrear) {
        await actualizarCampus(campusActual.id, campusForm);
        setMensaje({ texto: '✅ Campus actualizado correctamente', tipo: 'success' });
      } else {
        await crearCampus(campusForm);
        setMensaje({ texto: '✅ Campus creado correctamente', tipo: 'success' });
        setModoCrear(false);
      }

      await recargarCampus();
      setGuardadoCampusExitoso(true);
      setTimeout(() => setGuardadoCampusExitoso(false), 3000);
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    } finally {
      setGuardandoCampus(false);
    }
  };

  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setPerfilForm(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value.replace(/^0+/, ''), 10) || 0,
    }));
  };

  const manejarGuardarPerfil = async () => {
    if (!campusActual) return;
    try {
      setGuardandoPerfil(true);
      setMensaje(null);
      setGuardadoPerfilExitoso(false);
      await actualizarPerfil(campusActual.id, perfilForm);
      setMensaje({ texto: '✅ Perfil actualizado', tipo: 'success' });
      setGuardadoPerfilExitoso(true);
      setTimeout(() => setGuardadoPerfilExitoso(false), 3000);
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  if (loading || loadingCampus) {
    return (
      <div className="config-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando configuración...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>⚙️ Configuración</h1>
        <p style={{ color: '#666' }}>
          Configura los datos de tu campus y el perfil de sostenibilidad.
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

      <div className="config-card">
        <h2>📋 Datos del Campus {campusActual && !modoCrear ? '' : '(Crear nuevo)'}</h2>

        {campusList.length > 1 && (
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
            💡 Tienes {campusList.length} campus. Usa el selector arriba para cambiar entre ellos.
          </p>
        )}

        <div className="config-grid">
          <div className="config-item">
            <label htmlFor="nombre">Nombre de la universidad *</label>
            <input
              id="nombre" name="nombre" type="text"
              value={campusForm.nombre}
              onChange={handleCampusChange}
              placeholder="Ej: Universidad Central de Venezuela"
            />
          </div>

          <div className="config-item">
            <label htmlFor="area_total_m2">Área total (m²) *</label>
            <input
              id="area_total_m2" name="area_total_m2" type="number"
              value={campusForm.area_total_m2}
              onChange={handleCampusChange}
              onFocus={(e) => e.target.select()}
              min="1"
            />
          </div>

          <div className="config-item">
            <label htmlFor="poblacion_total">Población total *</label>
            <input
              id="poblacion_total" name="poblacion_total" type="number"
              value={campusForm.poblacion_total}
              onChange={handleCampusChange}
              onFocus={(e) => e.target.select()}
              min="1"
            />
          </div>

          <div className="config-item">
            <label htmlFor="ciudad">Ciudad</label>
            <input
              id="ciudad" name="ciudad" type="text"
              value={campusForm.ciudad}
              onChange={handleCampusChange}
            />
          </div>

          <div className="config-item">
            <label htmlFor="pais">País</label>
            <input
              id="pais" name="pais" type="text"
              value={campusForm.pais}
              onChange={handleCampusChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            className="btn-save"
            onClick={manejarGuardarCampus}
            disabled={guardandoCampus}
            style={{
              opacity: guardandoCampus ? 0.6 : 1,
              background: guardadoCampusExitoso
                ? 'linear-gradient(135deg, #4caf50 0%, #1B5E20 100%)'
                : undefined,
            }}
          >
            {guardandoCampus ? '⏳ Guardando...'
              : guardadoCampusExitoso ? '✅ ¡Guardado!'
              : campusActual && !modoCrear ? '💾 Actualizar Campus'
              : '➕ Crear Campus'}
          </button>

          {campusActual && (
            <button
              className="btn-save"
              onClick={() => {
                setModoCrear(true);
                setCampusForm({ nombre: '', area_total_m2: 100000, poblacion_total: 5000, ciudad: '', pais: '' });
              }}
              style={{ background: '#2196f3' }}
            >
              ➕ Agregar otro campus
            </button>
          )}

          {modoCrear && campusActual && (
            <button
              className="btn-save"
              onClick={() => setModoCrear(false)}
              style={{ background: '#999' }}
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </div>

      {campusActual && !modoCrear && (
        <div className="config-card">
          <h2>🌱 Perfil de Sostenibilidad</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
            Puntajes base de las categorías que NO se calculan automáticamente.
          </p>

          <div className="config-grid">
            <div className="config-item">
              <label htmlFor="energia_clima">EC - Energy & Climate Change (máx 2000)</label>
              <input id="energia_clima" name="energia_clima" type="number"
                value={perfilForm.energia_clima} onChange={handlePerfilChange}
                onFocus={(e) => e.target.select()} min="0" max="2000" />
            </div>

            <div className="config-item">
              <label htmlFor="residuos">WS - Waste (máx 1700)</label>
              <input id="residuos" name="residuos" type="number"
                value={perfilForm.residuos} onChange={handlePerfilChange}
                onFocus={(e) => e.target.select()} min="0" max="1700" />
            </div>

            <div className="config-item">
              <label htmlFor="agua">WR - Water (máx 1100)</label>
              <input id="agua" name="agua" type="number"
                value={perfilForm.agua} onChange={handlePerfilChange}
                onFocus={(e) => e.target.select()} min="0" max="1100" />
            </div>

            <div className="config-item">
              <label htmlFor="transporte">TR - Transportation (máx 1700)</label>
              <input id="transporte" name="transporte" type="number"
                value={perfilForm.transporte} onChange={handlePerfilChange}
                onFocus={(e) => e.target.select()} min="0" max="1700" />
            </div>

            <div className="config-item">
              <label htmlFor="educacion_investigacion">ED - Education & Research (máx 1300)</label>
              <input id="educacion_investigacion" name="educacion_investigacion" type="number"
                value={perfilForm.educacion_investigacion} onChange={handlePerfilChange}
                onFocus={(e) => e.target.select()} min="0" max="1300" />
            </div>
          </div>

          <button
            className="btn-save"
            onClick={manejarGuardarPerfil}
            disabled={guardandoPerfil}
            style={{
              opacity: guardandoPerfil ? 0.6 : 1, marginTop: '20px',
              background: guardadoPerfilExitoso
                ? 'linear-gradient(135deg, #4caf50 0%, #1B5E20 100%)'
                : undefined,
            }}
          >
            {guardandoPerfil ? '⏳ Guardando...'
              : guardadoPerfilExitoso ? '✅ ¡Perfil guardado!'
              : '💾 Guardar Perfil'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Configuracion;