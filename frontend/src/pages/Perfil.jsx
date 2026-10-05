import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Perfil.css';

const Perfil = () => {
  const { user } = useAuth();

  const nombreCompleto = user
    ? `${user.nombres || ''} ${user.apellidos || ''}`.trim()
    : 'Usuario';

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

      {/* Info de roles */}
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