// src/services/zonasService.js

import api from './api';

export const listarZonas = async (campusId) => {
  const response = await api.get(`/zonas-verdes/?campus_id=${campusId}`);
  return response.data;
};

export const crearZona = async (campusId, zonaData) => {
  const response = await api.post(`/zonas-verdes/?campus_id=${campusId}`, zonaData);
  return response.data;
};

export const actualizarZona = async (zonaId, zonaData) => {
  const response = await api.put(`/zonas-verdes/${zonaId}`, zonaData);
  return response.data;
};

export const eliminarZona = async (zonaId) => {
  await api.delete(`/zonas-verdes/${zonaId}`);
};