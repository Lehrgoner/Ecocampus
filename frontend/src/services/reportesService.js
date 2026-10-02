// src/services/reportesService.js

import api from './api';

export const obtenerDatosGraficos = async (campusId) => {
  const response = await api.get(`/reportes/datos-graficos?campus_id=${campusId}`);
  return response.data;
};

export const descargarReportePDF = async (campusId) => {
  const response = await api.get(`/reportes/pdf?campus_id=${campusId}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'reporte_sostenibilidad.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};