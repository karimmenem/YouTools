import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { getProducts } from '../services/productService';
import './Home.css';
import { useLanguage } from '../context/LanguageContext';

const BrandProducts = () => {
  const { brandSlug } = useParams();
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const storedBrands = localStorage.getItem('brands');
    if (storedBrands) {
      try {
        const parsedBrands = JSON.parse(storedBrands);
        const currentBrand = parsedBrands.find(b => b.slug === brandSlug);
        setBrand(currentBrand);
      } catch (e) {
        console.error("Failed to parse brands from localStorage", e);
      }
    }
    
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  const loadProducts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getProducts();
      if (res.success) {
        // filter products by brand field
        const filtered = (res.data || []).filter(p => p.brand === brandSlug);
        setProducts(filtered);
      } else {
        // If fetch failed, set error but keep loading state
        setFetchError(res.message || 'Failed to load products');
        console.error('Failed to load products:', res);
      }
    } catch (error) {
      console.error('Error loading brand products:', error);
      setFetchError(error.message || 'Error loading products');
    } finally {
      // Only set loading to false after fetch completes (success or failure)
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{language === 'pt' ? `Carregando produtos para ${brand?.name || brandSlug}...` : `Loading products for ${brand?.name || brandSlug}...`}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if fetch failed
  if (fetchError) {
    return (
      <div className="home">
        <div className="container">
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="empty-icon">⚠️</div>
            <h3>{language === 'pt' ? 'Erro ao carregar produtos' : 'Error loading products'}</h3>
            <p>{fetchError}</p>
            <button onClick={loadProducts} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
              {language === 'pt' ? 'Tentar novamente' : 'Try again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <div style={{paddingLeft: '40px'}}>
            <h1>{brand ? brand.name : brandSlug}</h1>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!loading && products.length === 0 && (
          <div className="empty-state" style={{ display: 'flex', justifyContent: 'center' ,textAlign: 'center', marginTop: '2rem' }}>
            <h3 className="empty-state-title">{language === 'pt' ? `Nenhum produto encontrado para ${brand ? brand.name : brandSlug}` : `No products found for ${brand ? brand.name : brandSlug}`}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;
