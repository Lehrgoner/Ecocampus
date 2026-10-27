import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campusList, campusActual, cambiarCampus } = useCampus();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-home' },
    { path: '/simulacion', label: 'Simulación', icon: 'fa-map-marked-alt' },
    { path: '/zonas-verdes', label: 'Zonas Verdes', icon: 'fa-tree' },
    { path: '/checklist', label: 'Checklist', icon: 'fa-clipboard-check' },
    { path: '/ranking', label: 'Ranking', icon: 'fa-trophy' },
    { path: '/recomendaciones', label: 'Recomendaciones', icon: 'fa-lightbulb' },
    { path: '/reportes', label: 'Reportes', icon: 'fa-chart-bar' },
    { path: '/perfil', label: 'Mi Perfil', icon: 'fa-user' },
    { path: '/configuracion', label: 'Configuración', icon: 'fa-cog' },
  ];

  if (user?.rol === 'admin') {
    menuItems.splice(menuItems.length - 1, 0, {
      path: '/gestion-usuarios',
      label: 'Gestión Usuarios',
      icon: 'fa-users',
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nombreUsuario = user
    ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.email
    : 'Usuario';

  const rolUsuario = user?.rol
    ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1)
    : '';

  // Mostrar selector si hay más de 1 campus (Admin)
  const mostrarSelectorCampus = campusList.length > 1;

  return (
    <div className="layout">
      {sidebarAbierto && (
        <div className="sidebar-overlay" onClick={() => setSidebarAbierto(false)}></div>
      )}

      <aside className={`sidebar ${sidebarAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-header">
          <h2>ECOCAMPUS</h2>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '5px' }}>
            Análisis Predictivo
          </p>
          <button className="btn-cerrar-sidebar" onClick={() => setSidebarAbierto(false)}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="main-content-layout">
        <header className="top-header">
          <button className="btn-menu" onClick={() => setSidebarAbierto(true)}>
            <i className="fas fa-bars"></i>
          </button>

          {/* Selector de campus (solo si hay más de 1) */}
          {mostrarSelectorCampus && (
            <div className="campus-selector">
              <i className="fas fa-university"></i>
              <select
                value={campusActual?.id || ''}
                onChange={(e) => cambiarCampus(e.target.value)}
              >
                {campusList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 'bold' }}>{nombreUsuario}</span>
              {rolUsuario && (
                <span style={{ fontSize: '0.75rem', color: '#4CAF50' }}>
                  {rolUsuario}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;