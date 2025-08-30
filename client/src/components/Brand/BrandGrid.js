import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BrandGrid.css';

const BrandGrid = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Fetches brand data directly from localStorage
    const storedBrands = localStorage.getItem('brands');
    if (storedBrands) {
      try {
        const parsedBrands = JSON.parse(storedBrands);
        setBrands(parsedBrands);
      } catch (error) {
        console.error("Failed to parse brands from localStorage", error);
        setBrands([]); // Set to empty array on error
      }
    }
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
