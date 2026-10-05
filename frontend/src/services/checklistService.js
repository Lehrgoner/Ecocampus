// src/services/checklistService.js

import api from './api';

export const obtenerChecklist = async (campusId) => {
  const response = await api.get(`/checklist/?campus_id=${campusId}`);
  return response.data;
};

export const actualizarChecklist = async (campusId, checklistData) => {
  const response = await api.put(`/checklist/?campus_id=${campusId}`, checklistData);
  return response.data;
};