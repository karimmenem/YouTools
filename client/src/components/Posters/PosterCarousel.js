import React, { useState, useEffect } from 'react';
import { getPosters } from '../../services/posterService';
import '../../components/Product/ProductCard.css';
import './PosterCarousel.css';

const PosterCarousel = () => {
  const [posters, setPosters] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await getPosters();
      if (res.success) setPosters(res.data);
    })();
  }, []);

  useEffect(() => {
    if (!posters.length) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % posters.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [posters]);

  if (!posters.length) return null;

  return (
    <div className="poster-carousel">
      {posters.map((p, idx) => (
        <div
          key={p.id}
          className={`product-card ${idx === current ? 'active' : ''}`}
        >
          <div className="product-image-container">
            <img
              src={p.image_url}
              alt={`Poster ${idx + 1}`}
              className="product-image"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PosterCarousel;
