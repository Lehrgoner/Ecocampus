// src/services/simulacionService.js

import api from './api';

export const crearSimulacion = async (campusId, simulacionData) => {
  const response = await api.post(`/simulaciones/?campus_id=${campusId}`, simulacionData);
  return response.data;
};

export const listarSimulaciones = async (campusId) => {
  const response = await api.get(`/simulaciones/?campus_id=${campusId}`);
  return response.data;
};

export const obtenerSimulacion = async (simId) => {
  const response = await api.get(`/simulaciones/${simId}`);
  return response.data;
};