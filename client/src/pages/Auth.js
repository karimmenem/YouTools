import React, { useState } from 'react';
import Login from '../components/Auth/Login';
import SignUp from '../components/Auth/SignUp';
import AdminPanel from '../components/Admin/AdminPanel';
import { useLanguage } from '../context/LanguageContext';

const Auth = () => {
  const { language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  // Remove auto-login - only check when user manually logs in
  const handleLoginSuccess = (userData) => {
    // Store the user data in localStorage for persistence
    localStorage.setItem('youtools_auth', JSON.stringify({
      user: userData,
      token: `fake_token_${userData.id}_${Date.now()}`
    }));
    setUser(userData);
  };

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('youtools_auth');
    setUser(null);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  // If user is logged in and is admin, show admin panel
  if (user && user.is_admin) {
    return <AdminPanel user={user} onLogout={handleLogout} />;
  }

  // If user is logged in but not admin, show message
  if (user && !user.is_admin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        flexDirection: 'column',
        gap: '2rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#d32f2f' }}>
          {language === 'pt' 
            ? `Bem-vindo, ${user.first_name}!` 
            : `Welcome, ${user.first_name}!`
          }
        </h2>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>
          {language === 'pt' 
            ? 'Você está logado como usuário regular. Somente administradores podem acessar o painel administrativo.' 
            : 'You are logged in as a regular user. Only administrators can access the admin panel.'
          }
        </p>
        <button 
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {language === 'pt' ? 'Sair' : 'Logout'}
        </button>
      </div>
    );
  }

  // Show login/signup forms
  return (
    <div>
      {isLogin ? (
        <Login onToggle={toggleForm} onLogin={handleLoginSuccess} />
      ) : (
        <SignUp onToggle={toggleForm} onSignUpSuccess={handleSignUpSuccess} />
      )}
    </div>
  );
};

export default Auth;
