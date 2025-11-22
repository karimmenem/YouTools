import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={() => {navigate(`/produto/${product.id}`)}}>
        <img 
          src={product.image_url || product.image || '/placeholder-product.jpg'} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        
        <div className="product-pricing">
          {product.original_price && product.original_price > product.price && (
            <span className="original-price">
              {formatPrice(product.original_price)}
            </span>
          )}
          <span className="current-price">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;