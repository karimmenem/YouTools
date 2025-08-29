import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BrandGrid.css';
import { getBrands } from '../../services/brandService';

const BrandGrid = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getBrands();
      if (res.success) setBrands(res.data);
    })();
  }, []);

  return (
    <div className="brand-grid">
      {brands.map(brand => (
        <Link key={brand.slug} to={`/${brand.slug}`} className="brand-card">
          <img src={brand.logo} alt={brand.name} className="brand-logo" />
        </Link>
      ))}
    </div>
  );
};

export default BrandGrid;
