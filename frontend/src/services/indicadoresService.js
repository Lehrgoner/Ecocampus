// src/services/indicadoresService.js

import api from './api';

export const obtenerIndicadores = async (campusId) => {
  const response = await api.get(`/indicadores/actuales?campus_id=${campusId}`);
  return response.data;
};