import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Menú base para todos
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

  // Ítem extra SOLO para Admin
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

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ECOCAMPUS</h2>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '5px' }}>
            Análisis Predictivo
          </p>
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