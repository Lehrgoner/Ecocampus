import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listarUsuarios,
  listarPendientes,
  aprobarUsuario,
  rechazarUsuario,
  crearUsuarioDirecto,
  actualizarUsuario,
  eliminarUsuario,
} from '../services/usuariosService';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
  const { user } = useAuth();
  const [tabActiva, setTabActiva] = useState('pendientes');
  const [usuarios, setUsuarios] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Modal de aprobación
  const [modalAprobar, setModalAprobar] = useState(null);
  const [rolSeleccionado, setRolSeleccionado] = useState('gestor');

  // Modal de crear usuario
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    rol: 'gestor',
  });
  const [creando, setCreando] = useState(false);

  // ============ CARGAR DATOS ============
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [listaUsuarios, listaPendientes] = await Promise.all([
        listarUsuarios(),
        listarPendientes(),
      ]);
      setUsuarios(listaUsuarios || []);
      setPendientes(listaPendientes || []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar:', err);
      setError(err.message || 'Error al cargar los usuarios');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ============ VERIFICAR ROL ADMIN ============
  if (user?.rol !== 'admin') {
    return (
      <div className="gestion-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ color: '#f44336' }}>🚫 Acceso denegado</h2>
          <p>Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // ============ APROBAR USUARIO ============
  const manejarAprobar = async () => {
    if (!modalAprobar) return;

    try {
      await aprobarUsuario(modalAprobar.id, rolSeleccionado);
      setMensaje({
        texto: `✅ Usuario ${modalAprobar.nombres} aprobado como ${rolSeleccionado}`,
        tipo: 'success',
      });
      setModalAprobar(null);
      setRolSeleccionado('gestor');
      cargarDatos();
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    }
  };

  // ============ RECHAZAR USUARIO ============
  const manejarRechazar = async (usuarioId, nombre) => {
    if (!window.confirm(`¿Rechazar la solicitud de ${nombre}?`)) return;

    try {
      await rechazarUsuario(usuarioId);
      setMensaje({ texto: '✅ Usuario rechazado', tipo: 'success' });
      cargarDatos();
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    }
  };

  // ============ CREAR USUARIO DIRECTO ============
  const manejarCrearUsuario = async () => {
    try {
      setCreando(true);
      await crearUsuarioDirecto(nuevoUsuario);
      setMensaje({ texto: '✅ Usuario creado correctamente', tipo: 'success' });
      setModalCrear(false);
      setNuevoUsuario({
        cedula: '',
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        rol: 'gestor',
      });
      cargarDatos();
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    } finally {
      setCreando(false);
    }
  };

  // ============ ELIMINAR USUARIO ============
  const manejarEliminar = async (usuarioId, nombre) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${nombre}?`)) return;

    try {
      await eliminarUsuario(usuarioId);
      setMensaje({ texto: '✅ Usuario eliminado', tipo: 'success' });
      cargarDatos();
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    }
  };

  // ============ CAMBIAR ROL ============
  const manejarCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      await actualizarUsuario(usuarioId, { rol: nuevoRol });
      setMensaje({ texto: `✅ Rol cambiado a ${nuevoRol}`, tipo: 'success' });
      cargarDatos();
    } catch (err) {
      setMensaje({ texto: '❌ Error: ' + (err.message || ''), tipo: 'error' });
    }
  };

  // ============ HELPERS ============
  const getBadgeRol = (rol) => {
    const colores = {
      admin: { bg: '#ffebee', color: '#c62828', label: '👑 Admin' },
      gestor: { bg: '#e3f2fd', color: '#1565c0', label: '🌱 Gestor' },
      consultor: { bg: '#f3e5f5', color: '#6a1b9a', label: '👁️ Consultor' },
      pendiente: { bg: '#fff3e0', color: '#e65100', label: '⏳ Pendiente' },
    };
    return colores[rol] || { bg: '#f5f5f5', color: '#666', label: rol };
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="gestion-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando usuarios...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#f44336' }}>
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <div>
          <h1>👥 Gestión de Usuarios</h1>
          <p style={{ color: '#666' }}>
            Administra los usuarios del sistema: aprueba solicitudes, cambia roles o elimina cuentas.
          </p>
        </div>
        <button
          className="btn-crear-usuario"
          onClick={() => setModalCrear(true)}
        >
          ➕ Crear Usuario
        </button>
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

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tabActiva === 'pendientes' ? 'active' : ''}`}
          onClick={() => setTabActiva('pendientes')}
        >
          ⏳ Pendientes ({pendientes.length})
        </button>
        <button
          className={`tab ${tabActiva === 'activos' ? 'active' : ''}`}
          onClick={() => setTabActiva('activos')}
        >
          ✅ Todos los usuarios ({usuarios.length})
        </button>
      </div>

      {/* Tabla de pendientes */}
      {tabActiva === 'pendientes' && (
        <div className="tabla-container">
          {pendientes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '1.2rem' }}>✨ No hay usuarios pendientes</p>
              <p>Todas las solicitudes han sido procesadas.</p>
            </div>
          ) : (
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((u) => (
                  <tr key={u.id}>
                    <td>{u.cedula}</td>
                    <td>{u.nombres} {u.apellidos}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.creado_en || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-aprobar"
                        onClick={() => setModalAprobar(u)}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => manejarRechazar(u.id, `${u.nombres} ${u.apellidos}`)}
                      >
                        ❌ Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tabla de todos los usuarios */}
      {tabActiva === 'activos' && (
        <div className="tabla-container">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const badge = getBadgeRol(u.rol);
                const esYo = u.id === user?.id;

                return (
                  <tr key={u.id}>
                    <td>{u.cedula}</td>
                    <td>{u.nombres} {u.apellidos}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.rol}
                        onChange={(e) => manejarCambiarRol(u.id, e.target.value)}
                        disabled={esYo}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 'bold',
                          cursor: esYo ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="admin">👑 Admin</option>
                        <option value="gestor">🌱 Gestor</option>
                        <option value="consultor">👁️ Consultor</option>
                      </select>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '15px',
                        background: u.activo ? '#e8f5e9' : '#ffebee',
                        color: u.activo ? '#2e7d32' : '#c62828',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}>
                        {u.activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>
                      {!esYo && (
                        <button
                          className="btn-eliminar"
                          onClick={() => manejarEliminar(u.id, `${u.nombres} ${u.apellidos}`)}
                        >
                          🗑️
                        </button>
                      )}
                      {esYo && (
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>Tú</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de aprobación */}
      {modalAprobar && (
        <div className="modal-overlay" onClick={() => setModalAprobar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Aprobar Usuario</h2>
            <p><strong>{modalAprobar.nombres} {modalAprobar.apellidos}</strong></p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{modalAprobar.email}</p>

            <label style={{ display: 'block', marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
              Selecciona el rol:
            </label>
            <select
              value={rolSeleccionado}
              onChange={(e) => setRolSeleccionado(e.target.value)}
              className="modal-select"
            >
              <option value="gestor">🌱 Gestor (puede crear y editar)</option>
              <option value="consultor">👁️ Consultor (solo lectura)</option>
            </select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button className="btn-cancelar" onClick={() => setModalAprobar(null)}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={manejarAprobar}>
                ✅ Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear usuario */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>➕ Crear Usuario Directo</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
              El usuario se creará activo y podrá iniciar sesión de inmediato.
            </p>

            <div className="modal-form">
              <input
                type="text"
                placeholder="Cédula (solo números)"
                value={nuevoUsuario.cedula}
                onChange={(e) => setNuevoUsuario({
                  ...nuevoUsuario,
                  cedula: e.target.value.replace(/\D/g, ''),
                })}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Nombres"
                value={nuevoUsuario.nombres}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombres: e.target.value })}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={nuevoUsuario.apellidos}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellidos: e.target.value })}
                className="modal-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Contraseña (mínimo 8 caracteres)"
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                className="modal-input"
              />
              <select
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                className="modal-input"
              >
                <option value="gestor">🌱 Gestor</option>
                <option value="consultor">👁️ Consultor</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button className="btn-cancelar" onClick={() => setModalCrear(false)}>
                Cancelar
              </button>
              <button
                className="btn-confirmar"
                onClick={manejarCrearUsuario}
                disabled={creando}
              >
                {creando ? '⏳ Creando...' : '➕ Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;