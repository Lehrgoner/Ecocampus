// src/services/campusService.js

import api from './api';

export const listarCampus = async () => {
  const response = await api.get('/campus/');
  return response.data;
};

export const obtenerCampusActual = async () => {
  const response = await api.get('/campus/actual');
  return response.data;
};

export const crearCampus = async (campusData) => {
  const response = await api.post('/campus/', campusData);
  return response.data;
};