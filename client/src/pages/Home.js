import React, { useState, useEffect } from 'react';
import ProductCard from '../components/Product/ProductCard';
import { getProducts } from '../services/productService';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('🔄 Loading products...');
      const response = await getProducts();
      console.log('📦 Products response:', response);
      
      if (response.success && response.data) {
        console.log('✅ All products loaded:', response.data.length, 'products');
        
        // Filter only products marked as special offers
        const specialOffers = response.data.filter(product => {
          const isSpecial = product.is_special_offer === true || product.is_special_offer === "true" || product.is_special_offer === 1;
          console.log(`🏷️ ${product.name}: is_special_offer = ${product.is_special_offer} (${typeof product.is_special_offer}) (${isSpecial ? 'INCLUDED' : 'EXCLUDED'})`);
          return isSpecial;
        });
        
        console.log('🎯 Special offers found:', specialOffers.length);
        setProducts(specialOffers);
      } else {
        console.error('❌ Failed to load products:', response.message);
      }
    } catch (error) {
      console.error('💥 Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    console.log('🗑️ Clearing localStorage and refreshing...');
    localStorage.removeItem('youtools_products');
    setLoading(true);
    setProducts([]);
    loadProducts();
  };

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando ofertas especiais...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <div className="home-header">
          <h1 className="page-title">Ofertas Especiais</h1>
          <p className="page-subtitle">
            Produtos selecionados com descontos exclusivos - apenas por tempo limitado!
          </p>
          
          {/* Debug info */}
          <div style={{
            background: '#333', 
            padding: '10px', 
            marginTop: '10px', 
            borderRadius: '5px',
            fontSize: '14px',
            color: '#ccc'
          }}>
            <strong>Debug Info:</strong> {products.length} ofertas especiais encontradas
            <br />
            <button 
              onClick={forceRefresh}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Limpar Cache e Recarregar
            </button>
          </div>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Nenhuma oferta especial disponível no momento</h3>
            <p>Nossa equipe está preparando novas ofertas incríveis para você!</p>
            <button 
              onClick={forceRefresh}
              style={{
                marginTop: '10px', 
                padding: '10px 20px', 
                backgroundColor: '#d32f2f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer'
              }}
            >
              🔄 Recarregar Produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
