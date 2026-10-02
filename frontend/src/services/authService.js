// src/services/authService.js

import api from './api';

// Registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.detail || 'Error al registrar el usuario';
    throw new Error(mensaje);
  }
};

// Iniciar sesión
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    // Guardar token y usuario (OJO: backend devuelve "usuario", no "user")
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.usuario));

    return data;
  } catch (error) {
    const mensaje = error.response?.data?.detail || 'Credenciales incorrectas';
    throw new Error(mensaje);
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error('No se pudo obtener el usuario actual');
  }
};

// Cerrar sesión
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============================================
// Funciones de recuperación de contraseña
// NO IMPLEMENTADAS (para evitar errores de import)
// ============================================

export const requestPasswordReset = async (email) => {
  throw new Error('La recuperación de contraseña aún no está disponible. Contacta al administrador.');
};

export const resetPassword = async (email, code, username, newPassword) => {
  throw new Error('La recuperación de contraseña aún no está disponible. Contacta al administrador.');
};