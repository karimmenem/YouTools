import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { getProducts } from '../services/productService';
import brandsList from '../data/brands';
import './Home.css';

const BrandProducts = () => {
  const { brandSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const b = brandsList.find(br => br.slug === brandSlug);
    setBrand(b);
    // fetch products for this brand
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      if (res.success) {
        // filter products by brand field
        const filtered = res.data.filter(p => p.brand === brandSlug);
        setProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading brand products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <p>Loading products for {brand?.name || brandSlug}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <h1>{brand ? brand.name : brandSlug}</h1>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="empty-state">
            <h3>No products found for {brand ? brand.name : brandSlug}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;
