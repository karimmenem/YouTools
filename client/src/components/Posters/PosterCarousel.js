import React, { useState, useEffect, useRef } from 'react';
import { getPosters } from '../../services/posterService';
import './PosterCarousel.css';

const SLIDE_INTERVAL = 5000; // ms

const PosterCarousel = ({ onLoad }) => {
  const [posters, setPosters] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await getPosters();
      if (res.success) {
        setPosters(res.data);
        if (onLoad) onLoad();
      }
    })();
  }, [onLoad]);

  // Auto advance
  useEffect(() => {
    if (!posters.length) return;
    if (paused) return;
    intervalRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % posters.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(intervalRef.current);
  }, [posters, current, paused]);

  if (!posters.length) return null;

  const goto = (idx) => setCurrent(idx % posters.length);
  const next = () => goto((current + 1) % posters.length);
  const prev = () => goto((current - 1 + posters.length) % posters.length);

  return (
    <div
      className="poster-carousel redesigned"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="slides-wrapper">
        {posters.map((p, idx) => (
          <div
            key={p.id}
            className={`poster-slide ${idx === current ? 'active' : ''}`}
            aria-hidden={idx !== current}
          >
            <img
              src={p.image_url}
              alt={`Poster ${idx + 1}`}
              className="poster-image"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {posters.length > 1 && (
        <>
          <button className="poster-nav prev" onClick={prev} aria-label="Previous poster" />
          <button className="poster-nav next" onClick={next} aria-label="Next poster" />
          <div className="poster-dots" role="tablist" aria-label="Carousel Navigation">
            {posters.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? 'active' : ''}`}
                onClick={() => goto(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === current}
                role="tab"
              />
            ))}
          </div>
          <div className="poster-progress">
            <div key={current + (paused ? '-paused' : '')} className={`bar ${paused ? 'paused' : ''}`} />
          </div>
        </>
      )}
    </div>
  );
};

export default PosterCarousel;
