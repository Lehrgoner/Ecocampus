// src/context/CampusContext.jsx

import { createContext, useState, useContext, useEffect } from 'react';
import { listarCampus } from '../services/campusService';
import { useAuth } from './AuthContext';

const CampusContext = createContext();

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus debe ser usado dentro de un CampusProvider');
  }
  return context;
};

export const CampusProvider = ({ children }) => {
  const { user, isAuthenticated, loading: loadingAuth } = useAuth();
  const [campusList, setCampusList] = useState([]);
  const [campusActual, setCampusActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargado, setCargado] = useState(false); // ← NUEVO

  // Cargar campus cuando el usuario esté listo
  useEffect(() => {
    const cargarCampus = async () => {
      // ⚠️ Esperar a que AuthContext termine de cargar
      if (loadingAuth) return;

      // Si no está autenticado, limpiar todo
      if (!isAuthenticated || !user) {
        setCampusList([]);
        setCampusActual(null);
        setLoading(false);
        setCargado(true);
        return;
      }

      try {
        setLoading(true);
        setCargado(false);

        const lista = await listarCampus();
        setCampusList(lista || []);

        if (lista && lista.length > 0) {
          const campusGuardado = localStorage.getItem('campus_actual_id');
          let campusSeleccionado = null;

          if (user.rol === 'consultor') {
            campusSeleccionado = lista[0];
          } else if (campusGuardado) {
            const encontrado = lista.find(c => c.id === parseInt(campusGuardado));
            campusSeleccionado = encontrado || lista[0];
          } else {
            campusSeleccionado = lista[0];
          }

          setCampusActual(campusSeleccionado);
          localStorage.setItem('campus_actual_id', campusSeleccionado.id);
        } else {
          setCampusActual(null);
        }
      } catch (err) {
        console.error('Error al cargar campus:', err);
        setCampusActual(null);
      } finally {
        setLoading(false);
        setCargado(true);
      }
    };

    cargarCampus();
  }, [isAuthenticated, user, loadingAuth]);

  const cambiarCampus = (campusId) => {
    const campus = campusList.find(c => c.id === parseInt(campusId));
    if (campus) {
      setCampusActual(campus);
      localStorage.setItem('campus_actual_id', campus.id);
      window.location.reload();
    }
  };

  const recargarCampus = async () => {
    if (!isAuthenticated) return;
    try {
      const lista = await listarCampus();
      setCampusList(lista || []);
      if (lista && lista.length > 0 && !campusActual) {
        setCampusActual(lista[0]);
      }
    } catch (err) {
      console.error('Error al recargar campus:', err);
    }
  };

  const value = {
    campusList,
    campusActual,
    cambiarCampus,
    recargarCampus,
    loading: loading || !cargado, // ← Ahora también considera "cargado"
    campus: campusActual,
  };

  return (
    <CampusContext.Provider value={value}>
      {children}
    </CampusContext.Provider>
  );
};