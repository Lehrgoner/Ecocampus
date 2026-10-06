import { Link } from 'react-router-dom';
import '../App.css';

const ResetPassword = () => {
  return (
    <div className="app">
      <main
        className="login-main"
        style={{
          justifyContent: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="login-card" style={{ textAlign: 'center', padding: '50px', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>

          <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>
            Recuperación de contraseña
          </h2>

          <p style={{ color: '#555', marginBottom: '25px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Esta funcionalidad estará disponible próximamente.
            <br />
            Mientras tanto, por favor contacta al administrador del sistema para
            restablecer tu contraseña.
          </p>

          <div style={{
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '8px',
            color: '#1565c0',
            fontSize: '0.95rem',
            marginBottom: '25px',
          }}>
            📧 Contacto: admin@greenmetric.com
          </div>

          <Link
            to="/login"
            className="btn-login"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              padding: '15px 40px',
            }}
          >
            ← Volver al Login
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;