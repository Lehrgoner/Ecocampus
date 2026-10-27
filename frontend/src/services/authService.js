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
  localStorage.removeItem('campus_actual_id');
};

// ============================================
// Recuperación de contraseña
// ============================================

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.detail || 'Error al solicitar el código';
    throw new Error(mensaje);
  }
};

export const resetPassword = async (email, code, username, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email: email,
      code: code,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.detail || 'Error al restablecer la contraseña';
    throw new Error(mensaje);
  }
};