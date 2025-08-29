import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Auth.css';

const SignUp = ({ onToggle, onSignUpSuccess }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'pt' ? 'As senhas não coincidem' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(language === 'pt' ? 'A senha deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call success callback
        onSignUpSuccess(data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">
          {language === 'pt' ? 'Cadastrar' : 'Sign Up'}
        </h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">
                {language === 'pt' ? 'Nome' : 'First Name'}
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder={language === 'pt' ? 'Digite seu nome' : 'Enter your first name'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                {language === 'pt' ? 'Sobrenome' : 'Last Name'}
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder={language === 'pt' ? 'Digite seu sobrenome' : 'Enter your last name'}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              {language === 'pt' ? 'Email' : 'Email'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={language === 'pt' ? 'Digite seu email' : 'Enter your email'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              {language === 'pt' ? 'Telefone' : 'Phone'}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={language === 'pt' ? 'Digite seu telefone' : 'Enter your phone'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">
              {language === 'pt' ? 'Endereço' : 'Address'}
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={language === 'pt' ? 'Digite seu endereço' : 'Enter your address'}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                {language === 'pt' ? 'Senha' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={language === 'pt' ? 'Digite sua senha' : 'Enter your password'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                {language === 'pt' ? 'Confirmar Senha' : 'Confirm Password'}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder={language === 'pt' ? 'Confirme sua senha' : 'Confirm your password'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading 
              ? (language === 'pt' ? 'Cadastrando...' : 'Signing up...') 
              : (language === 'pt' ? 'Cadastrar' : 'Sign Up')
            }
          </button>
        </form>

        <p className="auth-toggle">
          {language === 'pt' ? 'Já tem conta? ' : "Already have an account? "}
          <button onClick={onToggle} className="toggle-button">
            {language === 'pt' ? 'Entrar' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
