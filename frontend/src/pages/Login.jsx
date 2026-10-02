import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from "../services/authService";
import '../App.css';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',        // ← CAMBIO: era "username"
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';   // ← CAMBIO
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';  // ← CAMBIO
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const data = await loginUser(formData);
      login(data.usuario, data.access_token);   // ← CAMBIO: era "data.user"
      navigate('/dashboard');
    } catch (error) {
      setErrors({ 
        general: error.message || 'Credenciales inválidas o error de conexión con el servidor' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header Superior */}
      <header className="login-header">
        <div className="logo-container">
          <img 
            src="/images/icon1.png" 
            alt="Logo EcoCampus" 
            className="logo-image"
          />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="login-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            BIENVENIDO A <span className="highlight">ECOCAMPUS</span>
          </h1>
          <p className="welcome-description">
            La mejor herramienta en el control de espacios verdes universitarios. 
            Ingresa para descubrirlo.
          </p>
        </div>

        {/* Tarjeta de Formulario Glassmorphism */}
        <div className="login-card">
          <div className="card-header">
            <img 
              src="/images/logo.png" 
              alt="EcoCampus" 
              className="app-logo"
            />
            <h2 className="app-title-sub">Iniciar Sesión</h2>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}
            
            {/* CAMBIO: ahora es email */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email"
                id="email" 
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Ingresa tu correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0'
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <Link to="/recuperar-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
            </button>

            <Link to="/register" className="btn-register">
              REGISTRATE
            </Link>
          </form>
        </div>
      </main>

      {/* Pie de Página */}
      <footer className="login-footer">
        <div className="footer-section">
          <h3>Conoce más:</h3>
          <ul className="footer-links">
            <li><a href="#avisos">Avisos Legales.</a></li>
            <li><a href="#privacidad">Políticas de Privacidad.</a></li>
            <li><a href="#contacto">Contacto.</a></li>
            <li><a href="#faq">Preguntas Frecuentes.</a></li>
          </ul>
        </div>

        <div className="footer-section social-media">
          <h3>Síguenos en:</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-x-twitter"></i>
            </a>  
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;