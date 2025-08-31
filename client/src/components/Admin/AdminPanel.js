import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getProducts, getCategories } from '../../services/productService';
import { supabase } from '../../services/supabaseClient';
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import UserManagement from './UserManagement';
import PosterManagement from './PosterManagement';
import BrandManagement from './BrandManagement';
import Header from '../Layout/Header';
import './AdminPanel.css';

const AdminPanel = ({ user, onLogout }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 2, // Fixed - we have 2 admin users
    totalCategories: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load products count
      const productsRes = await getProducts();
      const categoriesRes = await getCategories();
      
      setStats({
        totalProducts: productsRes.data?.length || 0,
        totalUsers: 2, // Fixed - we have 2 admin users
        totalCategories: categoriesRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const tabs = [
    { 
      id: 'dashboard', 
      label: language === 'pt' ? 'Dashboard' : 'Dashboard', 
      icon: '📊' 
    },
    { 
      id: 'products', 
      label: language === 'pt' ? 'Produtos' : 'Products', 
      icon: '📦' 
    },
    { 
      id: 'add-product', 
      label: language === 'pt' ? 'Adicionar Produto' : 'Add Product', 
      icon: '➕' 
    },
    { 
      id: 'manage-posters', 
      label: language === 'pt' ? 'Cartazes' : 'Posters', 
      icon: '🖼️' 
    },
    { 
      id: 'manage-brands', 
      label: language === 'pt' ? 'Marcas' : 'Brands', 
      icon: '🔖' 
    },
    { 
      id: 'users', 
      label: language === 'pt' ? 'Usuários' : 'Users', 
      icon: '👥' 
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': {
        const backendActive = !!supabase;
        const modeLabel = backendActive ? (language === 'pt' ? 'Supabase (Persistente Global)' : 'Supabase (Global Persistent)') : (language === 'pt' ? 'Somente Frontend' : 'Frontend Only');
        const storageLabel = backendActive ? 'Supabase Postgres' : (language === 'pt' ? 'LocalStorage do Navegador' : 'Browser LocalStorage');
        return (
          <div className="dashboard">
            <h2>{language === 'pt' ? 'Dashboard' : 'Dashboard'}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>{language === 'pt' ? 'Produtos' : 'Products'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>{language === 'pt' ? 'Usuários Admin' : 'Admin Users'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-info">
                  <h3>{stats.totalCategories}</h3>
                  <p>{language === 'pt' ? 'Categorias' : 'Categories'}</p>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '30px', color: '#ccc', fontSize: '14px' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>
                {language === 'pt' ? 'Informações do Sistema' : 'System Information'}
              </h3>
              <div style={{ background: 'rgba(211, 47, 47, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
                <p><strong>{language === 'pt' ? 'Modo:' : 'Mode:'}</strong> {modeLabel}</p>
                <p><strong>{language === 'pt' ? 'Armazenamento:' : 'Storage:'}</strong> {storageLabel}</p>
                <p><strong>{language === 'pt' ? 'Autenticação:' : 'Authentication:'}</strong> {backendActive ? 'Anon policies (open) – configure RLS later' : (language === 'pt' ? 'Usuários Pré-definidos' : 'Predefined Users')}</p>
                {backendActive ? (
                  <p style={{ marginTop: '8px' }}>{language === 'pt' ? 'Mirage desativado; dados agora são compartilhados entre todos os usuários.' : 'Mirage disabled; data now shared across all users.'}</p>
                ) : (
                  <p style={{ marginTop: '8px' }}>{language === 'pt' ? 'Ative Supabase adicionando variáveis de ambiente e redeploy.' : 'Enable Supabase by adding env vars & redeploy.'}</p>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'products':
        return <ProductList onStatsUpdate={loadStats} />;
      case 'add-product':
        return <AddProduct onProductAdded={loadStats} />;
      case 'manage-posters':
        return <PosterManagement />;
      case 'manage-brands':
        return <BrandManagement />;
      case 'users':
        return <UserManagement onStatsUpdate={loadStats} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="admin-panel">
        <div className="admin-header">
          <div className="admin-user-info">
            <h1>{language === 'pt' ? 'Painel Administrativo' : 'Admin Panel'}</h1>
            <div className="user-welcome">
              {language === 'pt' ? 'Bem-vindo, ' : 'Welcome, '}
              <strong>{user.first_name} {user.last_name}</strong>
              {user.is_admin && (
                <span className="admin-badge">
                  {language === 'pt' ? 'Admin' : 'Admin'}
                </span>
              )}
            </div>
          </div>
          <button onClick={onLogout} className="logout-button">
            {language === 'pt' ? 'Sair' : 'Logout'}
          </button>
        </div>

        <div className="admin-content">
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <main className="admin-main">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
