import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import './Perfil.css';

const Perfil = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="perfil-page">
        <h1>Mi Perfil</h1>
        
        <div className="perfil-card">
          <div className="perfil-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          
          <div className="perfil-info">
            <h2>{user?.username}</h2>
            <p className="email">{user?.email}</p>
            <p className="role">Rol: <span className="badge">{user?.role}</span></p>
          </div>
          
          <div className="perfil-actions">
            <button className="btn-edit-perfil">
              <i className="fas fa-edit"></i> Editar Perfil
            </button>
            <button className="btn-change-password">
              <i className="fas fa-key"></i> Cambiar Contraseña
            </button>
          </div>
        </div>
        
        <div className="perfil-stats">
          <h2>Mi Actividad</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>15</h3>
              <p>Espacios Gestionados</p>
            </div>
            <div className="stat-item">
              <h3>8</h3>
              <p>Reportes Creados</p>
            </div>
            <div className="stat-item">
              <h3>23</h3>
              <p>Mantenimientos</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Perfil;