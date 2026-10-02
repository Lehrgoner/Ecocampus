import Layout from '../components/Layout';
import './Configuracion.css';

const Configuracion = () => {
  return (
    <Layout>
      <div className="config-page">
        <h1>Configuración</h1>
        
        <div className="config-sections">
          <div className="config-card">
            <h2>Configuración General</h2>
            <div className="config-item">
              <label>Nombre de la Universidad</label>
              <input type="text" placeholder="Ej: Universidad Nacional" />
            </div>
            <div className="config-item">
              <label>Email de Contacto</label>
              <input type="email" placeholder="contacto@universidad.edu" />
            </div>
            <button className="btn-save">Guardar Cambios</button>
          </div>

          <div className="config-card">
            <h2>Notificaciones</h2>
            <div className="config-item checkbox">
              <input type="checkbox" id="email-notif" defaultChecked />
              <label htmlFor="email-notif">Recibir notificaciones por email</label>
            </div>
            <div className="config-item checkbox">
              <input type="checkbox" id="maintenance-notif" defaultChecked />
              <label htmlFor="maintenance-notif">Alertas de mantenimiento</label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracion;