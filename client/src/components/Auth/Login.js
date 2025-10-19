import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { login } from '../../services/authService';
import './Auth.css';

const Login = ({ onLogin }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.username, formData.password);
      
      if (response.success) {
        onLogin(response.data.user);
      } else {
        setError(response.message || (language === 'pt' ? 'Credenciais inválidas' : 'Invalid credentials'));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(language === 'pt' ? 'Erro de conexão' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-you-text">YOU</span>
            <span className="auth-tools-text">TOOLS</span>
          </div>
         
          <h2 className="auth-title">
            {language === 'pt' ? 'Login Administrativo' : 'Admin Login'}
          </h2>
          
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">{language === 'pt' ? 'Email' : 'Email'}</label>
            <input
              className="form-input"
              type="email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder={language === 'pt' ? 'Digite seu email' : 'Enter your email'}
            />
          </div>

          <div className="form-group">
            <label className="auth-label">{language === 'pt' ? 'Senha' : 'Password'}</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder={language === 'pt' ? 'Digite sua senha' : 'Enter your password'}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading 
              ? (language === 'pt' ? 'Entrando...' : 'Logging in...') 
              : (language === 'pt' ? 'Entrar' : 'Login')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
