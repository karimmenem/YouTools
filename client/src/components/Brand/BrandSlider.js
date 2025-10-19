import React, { useEffect, useState } from 'react';
import './BrandSlider.css';
import { getBrands } from '../../services/brandService';

const BrandSlider = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getBrands();
      if (mounted && res.success){ 
        setBrands(res.data || [])
        
      ;};
    })();
    return () => { mounted = false; };
  }, []);

  if (!brands.length) return null;

  // Build a base list wide enough, then duplicate once for seamless loop
  let base = [...brands];
  // Ensure minimum number of items for smooth scroll (avoid visible reset)
  while (base.length < 10) {
    base = base.concat(brands);
    if (base.length > 40) break; // safety cap
  }
  const loop = [...base, ...base]; // exactly two sequences for -50% translate cycle

  return (
    <section className="brand-marquee single" aria-label="Brands">
      <div className="brand-marquee-inner">
        <div className="marquee-track single">
          {loop.map((b, i) => {if(b.position !== 10) return (
            
            <div key={`${b.id || b.slug}-${i}`} className="brand-chip-mini" title={b.name} onClick={() =>  console.log(brands) }>
              <img loading="lazy" src={b.logo} alt={b.name} onError={e => { e.currentTarget.style.visibility='hidden'; }} />
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
