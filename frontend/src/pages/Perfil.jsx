import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import './Perfil.css';

const Perfil = () => {
  const { user: userContext } = useAuth();
  const [user, setUser] = useState(userContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        // Consultar el backend para obtener datos frescos
        const usuarioActual = await getCurrentUser();
        setUser(usuarioActual);
        // Actualizar localStorage con datos frescos
        localStorage.setItem('user', JSON.stringify(usuarioActual));
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        // Si falla, usar el del contexto como fallback
        setUser(userContext);
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  const nombreCompleto = user
    ? `${user.nombres || ''} ${user.apellidos || ''}`.trim()
    : 'Usuario';

  if (loading) {
    return (
      <div className="perfil-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando perfil...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>👤 Mi Perfil</h1>
      </div>

      <div className="perfil-card">
        <div className="perfil-avatar">
          <i className="fas fa-user-circle"></i>
        </div>

        <h2>{nombreCompleto}</h2>

        <div className="perfil-info">
          <div className="perfil-item">
            <label>Cédula</label>
            <span>{user?.cedula || 'No especificada'}</span>
          </div>

          <div className="perfil-item">
            <label>Email</label>
            <span>{user?.email || 'No especificado'}</span>
          </div>

          <div className="perfil-item">
            <label>Rol</label>
            <span className="badge-rol">
              {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'N/A'}
            </span>
          </div>

          <div className="perfil-item">
            <label>Estado</label>
            <span style={{ color: user?.activo ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
              {user?.activo ? '✅ Activo' : '❌ Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className="perfil-info-card">
        <h3>ℹ️ Sobre los roles</h3>
        <ul>
          <li>
            <strong>Admin:</strong> Gestiona usuarios y ve todos los campus
          </li>
          <li>
            <strong>Gestor:</strong> Administra sus campus, zonas verdes y checklist
          </li>
          <li>
            <strong>Consultor:</strong> Solo lectura de sus campus
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Perfil;