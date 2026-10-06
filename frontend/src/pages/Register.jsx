import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import '../App.css';

const RequisitoItem = ({ cumplido, texto }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: cumplido ? '#2e7d32' : '#999',
    fontWeight: cumplido ? 'bold' : 'normal',
    transition: 'all 0.2s',
  }}>
    <span style={{
      display: 'inline-block',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: cumplido ? '#4caf50' : '#ddd',
      color: 'white',
      fontSize: '11px',
      textAlign: 'center',
      lineHeight: '16px',
      fontWeight: 'bold',
    }}>
      {cumplido ? '✓' : ''}
    </span>
    {texto}
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const regexSimbolo = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`;']/;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!/^\d{6,15}$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe tener entre 6 y 15 dígitos';
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una minúscula';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un número';
    } else if (!regexSimbolo.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un símbolo (!@#$%...)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valorLimpio = name === 'cedula' ? value.replace(/\D/g, '') : value;

    setFormData(prev => ({
      ...prev,
      [name]: valorLimpio,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const data = await registerUser({
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
      });

      setRegistroExitoso(true);

      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PANTALLA DE ÉXITO ============
  if (registroExitoso) {
    return (
      <div className="app">
        <header className="login-header">
          <div className="logo-container">
            <img src="/images/icon1.png" alt="Logo EcoCampus" className="logo-image" />
          </div>
        </header>

        <main className="login-main">
          <div className="login-card" style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>
              ¡Registro exitoso!
            </h2>
            <p style={{ color: '#555', marginBottom: '25px', fontSize: '1.05rem' }}>
              Tu cuenta ha sido creada correctamente.
              <br />
              Un administrador debe <strong>aprobar tu cuenta</strong> antes de que puedas iniciar sesión.
            </p>
            <div style={{
              padding: '15px',
              background: '#e3f2fd',
              borderRadius: '8px',
              color: '#1565c0',
              fontSize: '0.95rem',
              marginBottom: '20px',
            }}>
              ⏳ Serás redirigido al login en unos segundos...
            </div>
            <Link
              to="/login"
              className="btn-login"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Ir al Login ahora
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ============ FORMULARIO ============
  return (
    <div className="app">
      <header className="login-header">
        <div className="logo-container">
          <img src="/images/icon1.png" alt="Logo EcoCampus" className="logo-image" />
        </div>
      </header>

      <main className="login-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            BIENVENIDO A <span className="highlight">ECOCAMPUS</span>
          </h1>
          <p className="welcome-description">
            Únete a la mejor herramienta en el control de espacios verdes universitarios.
          </p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <img src="/images/logo.png" alt="EcoCampus" className="app-logo" />
            <h2 className="app-title-sub">Registro de Usuario</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message" style={{
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
                {errors.general}
              </div>
            )}

            {/* Cédula */}
            <div className="form-group">
              <label htmlFor="cedula">Cédula (solo números)</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                className={`form-input ${errors.cedula ? 'error' : ''}`}
                placeholder="Ej: 12345678"
                value={formData.cedula}
                onChange={handleChange}
                inputMode="numeric"
              />
              {errors.cedula && <span className="error-text">{errors.cedula}</span>}
            </div>

            {/* Nombres */}
            <div className="form-group">
              <label htmlFor="nombres">Nombres</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                className={`form-input ${errors.nombres ? 'error' : ''}`}
                placeholder="Ej: Juan Carlos"
                value={formData.nombres}
                onChange={handleChange}
              />
              {errors.nombres && <span className="error-text">{errors.nombres}</span>}
            </div>

            {/* Apellidos */}
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                className={`form-input ${errors.apellidos ? 'error' : ''}`}
                placeholder="Ej: Pérez González"
                value={formData.apellidos}
                onChange={handleChange}
              />
              {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
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
                    padding: '0',
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}

              {/* Requisitos de contraseña */}
              {formData.password && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                    Requisitos de contraseña:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <RequisitoItem
                      cumplido={formData.password.length >= 8}
                      texto="Mínimo 8 caracteres"
                    />
                    <RequisitoItem
                      cumplido={/[A-Z]/.test(formData.password)}
                      texto="Al menos una mayúscula (A-Z)"
                    />
                    <RequisitoItem
                      cumplido={/[a-z]/.test(formData.password)}
                      texto="Al menos una minúscula (a-z)"
                    />
                    <RequisitoItem
                      cumplido={/\d/.test(formData.password)}
                      texto="Al menos un número (0-9)"
                    />
                    <RequisitoItem
                      cumplido={regexSimbolo.test(formData.password)}
                      texto="Al menos un símbolo (!@#$%...)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
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
                    padding: '0',
                  }}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
            </button>

            <div className="login-link">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </form>
        </div>
      </main>

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