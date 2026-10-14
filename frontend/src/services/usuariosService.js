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

export const aprobarUsuario = async (usuarioId, datos) => {
  // datos = { rol: 'gestor' | 'consultor', campus_asignado_id: number | null }
  const response = await api.post(`/usuarios/${usuarioId}/aprobar`, datos);
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
  const params = new URLSearchParams();
  if (datos.rol) params.append('rol', datos.rol);
  if (datos.activo !== undefined) params.append('activo', datos.activo);
  if (datos.campus_asignado_id !== undefined) {
    params.append('campus_asignado_id', datos.campus_asignado_id);
  }

  const response = await api.put(`/usuarios/${usuarioId}?${params.toString()}`);
  return response.data;
};

export const eliminarUsuario = async (usuarioId) => {
  await api.delete(`/usuarios/${usuarioId}`);
};