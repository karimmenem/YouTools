import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import BrandProducts from './pages/BrandProducts';
import Auth from './pages/Auth';
import './styles/App.css';

function App() {
  const [loading, setLoading] = useState(false); // Remove auto-login loading

  // Clean up any existing auth on app start to prevent auto-login
  useEffect(() => {
    // Clear any existing auth state to force manual login
    localStorage.removeItem('youtools_auth');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: '#fff',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="produtos" element={<Products />} />
            <Route path="ferramentas-manuais" element={<Products />} />
            <Route path="maquinas-eletricas" element={<Products />} />
            <Route path="movimentacao-carga" element={<Products />} />
            <Route path="construcao-civil" element={<Products />} />
            <Route path="jardim-agricultura" element={<Products />} />
            <Route path=":brandSlug" element={<BrandProducts />} />
          </Route>
          <Route path="/admin/*" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;
