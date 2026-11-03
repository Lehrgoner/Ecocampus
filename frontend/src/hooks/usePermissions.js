// src/hooks/usePermissions.js

import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const esAdmin = user?.rol === 'admin';
  const esGestor = user?.rol === 'gestor';
  const esConsultor = user?.rol === 'consultor';

  const puedeModificar = esAdmin || esGestor;
  const esSoloAdmin = esAdmin;
  const puedeEscribir = esAdmin || esGestor;

  return {
    rol: user?.rol,
    esAdmin,
    esGestor,
    esConsultor,
    puedeModificar,
    puedeEscribir,
    esSoloAdmin,
    esSoloLectura: esConsultor,
  };
};