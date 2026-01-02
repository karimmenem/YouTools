import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BrandGrid.css';
import { getBrands } from '../../services/brandService';

const BrandGrid = ({ onLoad }) => {
  const [brands, setBrands] = useState([]);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getBrands();
        if (mounted && res.success) {
          const list = res.data || [];
          setBrands(list);
          // If no brands, we are "loaded" immediately
          if (list.length === 0 && onLoad) {
            onLoad();
          }
        } else {
          // If fetch fails, we should still signal "loaded" to avoid hanging
          if (onLoad) onLoad();
        }
      } catch (e) {
        console.error("BrandGrid load error", e);
        if (onLoad) onLoad();
      }
    })();
    return () => { mounted = false; };
  }, [onLoad]);

  useEffect(() => {
    // Safety check: if all images loaded (or erred), signal done
    if (brands.length > 0 && imagesLoadedCount === brands.length) {
      if (onLoad) onLoad();
    }
  }, [imagesLoadedCount, brands.length, onLoad]);

  const handleImageLoad = () => {
    setImagesLoadedCount(prev => prev + 1);
  };

  if (!brands.length) return null;

  return (
    <div className="brand-grid">
      {brands.map(brand => (
        <Link key={brand.slug} to={`/${brand.slug}`} className="brand-card">
          <img
            loading="lazy"
            src={brand.logo}
            alt={brand.name}
            className="brand-logo"
            onLoad={handleImageLoad}
            onError={handleImageLoad}
          />
        </Link>
      ))}
    </div>
  );
};

export default BrandGrid;
