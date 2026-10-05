// src/services/recomendacionesService.js

import api from './api';

export const obtenerRecomendaciones = async (campusId, presupuestoMax = null) => {
  let url = `/recomendaciones/?campus_id=${campusId}`;
  if (presupuestoMax) {
    url += `&presupuesto_max=${presupuestoMax}`;
  }
  const response = await api.get(url);
  return response.data;
};