// src/services/usuariosService.js

import api from './api';

export const listarUsuarios = async () => {
  const response = await api.get('/usuarios/');
  return response.data;
};

export const listarPendientes = async () => {
  const response = await api.get('/usuarios/pendientes');
  return response.data;
};

export const aprobarUsuario = async (usuarioId, rol) => {
  const response = await api.post(`/usuarios/${usuarioId}/aprobar`, { rol });
  return response.data;
};

export const rechazarUsuario = async (usuarioId) => {
  await api.post(`/usuarios/${usuarioId}/rechazar`);
};

export const crearUsuarioDirecto = async (usuarioData) => {
  const response = await api.post('/usuarios/', usuarioData);
  return response.data;
};

export const actualizarUsuario = async (usuarioId, datos) => {
  const response = await api.put(`/usuarios/${usuarioId}`, null, {
    params: datos,
  });
  return response.data;
};

export const eliminarUsuario = async (usuarioId) => {
  await api.delete(`/usuarios/${usuarioId}`);
};