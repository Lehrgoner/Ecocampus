import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService'; // <--- IMPORTANTE: Importar el servicio real
import '../App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      // 1. Enviar datos reales al backend mediante authService
      const data = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // 2. Almacenar las credenciales devueltas por el servidor (Token JWT y usuario con rol "user")
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 3. Redirigir al Dashboard de manera exitosa
      navigate('/dashboard');

    } catch (error) {
      // Mostrar el error real devuelto por FastAPI (ej. "El usuario ya existe")
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header idéntico al Login */}
      <header className="login-header">
        <div className="logo-container">
          <img 
            src="/images/icon1.png" 
            alt="Logo EcoCampus" 
            className="logo-image"
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="login-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            BIENVENIDO A <span className="highlight">ECOCAMPUS</span>
          </h1>
          <p className="welcome-description">
            Únete a la mejor herramienta en el control de espacios verdes universitarios.
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="login-card">
          <div className="card-header">
            <img 
              src="/images/logo.png" 
              alt="EcoCampus" 
              className="app-logo"
            />
            <h2 className="app-title-sub">Registro de Usuario</h2>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message" style={{ color: '#d32f2f', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* ✅ Campo de Contraseña con Mostrar/Ocultar */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
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

            {/* ✅ Campo de Confirmar Contraseña con Mostrar/Ocultar */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0'
                  }}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
            </button>

            <div className="login-link">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
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

export default Register;