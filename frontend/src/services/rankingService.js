// src/services/rankingService.js

import api from './api';

export const predecirRanking = async (puntajes) => {
  const response = await api.post('/ranking/predecir', puntajes);
  return response.data;
};