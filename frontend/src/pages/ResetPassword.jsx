import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../services/authService';
import '../App.css';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message || 'Código enviado a tu correo. Revisa también la bandeja de spam.');
      setStep(2);
      setCode('');
      setUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al solicitar el código.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code.trim() || code.length !== 6) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    if (!username.trim()) {
      setError('Ingresa tu nombre de usuario.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Asegúrate de que authService.js reciba el 'username' si tu backend lo requiere
      const res = await resetPassword(email, code, username, newPassword);
      setMessage(res.message || 'Contraseña actualizada exitosamente.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al restablecer la contraseña.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <main className="login-main" style={{ justifyContent: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="login-card">
          <div className="card-header">
            <h2 className="app-title-sub">Recuperar Contraseña</h2>
          </div>

          {error && (
            <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
              {message}
            </div>
          )}

          {step === 1 ? (
            <form className="login-form" onSubmit={handleRequestCode}>
              <p style={{ textAlign: 'center', marginBottom: '15px', color: '#555' }}>
                Ingresa tu correo electrónico registrado para recibir el código de seguridad.
              </p>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleResetPassword}>
              <p style={{ textAlign: 'center', marginBottom: '15px', color: '#555' }}>
                Código enviado a <strong>{email}</strong>
              </p>
              
              <div className="form-group">
                <label>Código de Seguridad (6 dígitos)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  maxLength="6"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 123456"
                  required
                  disabled={isLoading}
                  style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                />
              </div>

              <div className="form-group">
                <label>Usuario</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ width: '100%', paddingRight: '40px' }}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0' }}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? 'VERIFICANDO...' : 'ACTUALIZAR CONTRASEÑA'}
              </button>
            </form>
          )}

          <div className="login-link" style={{ marginTop: '15px', textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>← Volver a Iniciar Sesión</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;