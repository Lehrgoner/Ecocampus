// src/services/perfilService.js

import api from './api';

export const obtenerPerfil = async (campusId) => {
  const response = await api.get(`/perfil/?campus_id=${campusId}`);
  return response.data;
};

export const actualizarPerfil = async (campusId, perfilData) => {
  const response = await api.put(`/perfil/?campus_id=${campusId}`, perfilData);
  return response.data;
};