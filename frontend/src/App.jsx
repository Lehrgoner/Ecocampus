import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Rutas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// Rutas protegidas
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Simulacion from './pages/Simulacion';
import ZonasVerdes from './pages/ZonasVerdes';
import Checklist from './pages/Checklist';
import Ranking from './pages/Ranking';
import Recomendaciones from './pages/Recomendaciones';

import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recuperar-password" element={<ResetPassword />} />

          {/* Rutas Protegidas (envueltas con Layout) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/simulacion" element={<ProtectedRoute><Simulacion /></ProtectedRoute>} />
          <Route path="/zonas-verdes" element={<ProtectedRoute><ZonasVerdes /></ProtectedRoute>} />
          <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/recomendaciones" element={<ProtectedRoute><Recomendaciones /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/espacios" element={<Navigate to="/zonas-verdes" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;