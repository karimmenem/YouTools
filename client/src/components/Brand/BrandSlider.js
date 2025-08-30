import React from 'react';
import './BrandSlider.css';

const BrandSlider = () => {
  // Placeholder brands - client will provide actual images later
  const brands = [
    { id: 1, name: 'INGCO', logo: '/brands/ingco.png' },
    { id: 2, name: 'BOSCH', logo: '/brands/bosch.png' },
    { id: 3, name: 'MAKITA', logo: '/brands/makita.png' },
    { id: 4, name: 'DEWALT', logo: '/brands/dewalt.png' },
    { id: 5, name: 'STANLEY', logo: '/brands/stanley.png' },
    { id: 6, name: 'BLACK & DECKER', logo: '/brands/blackdecker.png' },
    { id: 7, name: 'TRAMONTINA', logo: '/brands/tramontina.png' },
    { id: 8, name: 'VONDER', logo: '/brands/vonder.png' },
    { id: 9, name: 'WORKER', logo: '/brands/worker.png' },
    { id: 10, name: 'EINHELL', logo: '/brands/einhell.png' }
  ];

  // Duplicate brands array for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

  return (
    <div className="brand-slider">
      <div className="brand-slider-track">
        {duplicatedBrands.map((brand, index) => (
          <div key={`${brand.id}-${index}`} className="brand-item">
            <img 
              src={brand.logo} 
              alt={brand.name}
              className="slider-brand-logo"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="brand-fallback">
              {brand.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandSlider;
