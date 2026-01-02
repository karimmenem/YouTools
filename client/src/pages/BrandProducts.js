import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';

import { useParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { getProducts } from '../services/productService';
import './Home.css';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../context/LoadingContext';

const BrandProducts = () => {
  const { brandSlug } = useParams();
  const { language } = useLanguage();
  const { hideLoading } = useLoading();
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);

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

    setImagesLoadedCount(0); // Reset on slug change
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  // Check if all images are loaded
  useEffect(() => {
    if (!loading && products.length > 0) {
      if (imagesLoadedCount === products.length) {
        hideLoading();
      }
    } else if (!loading && products.length === 0) {
      // If loaded but no products, hide immediately
      hideLoading();
    }
  }, [imagesLoadedCount, products.length, loading, hideLoading]);

  const handleImageLoad = () => {
    setImagesLoadedCount(prev => prev + 1);
  };

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
      // Removed hideLoading() here, moved to image load effect
    }
  };

  if (loading) {
    return <div className="home" style={{ minHeight: '60vh' }}></div>;
  }

  // Show error if fetch failed
  if (fetchError) {
    hideLoading(); // ensure loader is hidden on error
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
      <SEO
        title={brand ? brand.name : brandSlug}
        description={language === 'pt' ? `Produtos da marca ${brand ? brand.name : brandSlug}` : `Products from ${brand ? brand.name : brandSlug}`}
      />
      <div className="container">
        <div style={{ paddingLeft: '40px' }}>
          <h1>{brand ? brand.name : brandSlug}</h1>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onImageLoad={handleImageLoad} />
          ))}
        </div>
        {!loading && products.length === 0 && (
          <div className="empty-state" style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '2rem' }}>
            <h3 className="empty-state-title">{language === 'pt' ? `Nenhum produto encontrado para ${brand ? brand.name : brandSlug}` : `No products found for ${brand ? brand.name : brandSlug}`}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;
