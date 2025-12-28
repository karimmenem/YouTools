import React from 'react';
import PosterCarousel from '../components/Posters/PosterCarousel';
import BrandGrid from '../components/Brand/BrandGrid';
import BrandRail from '../components/Brand/BrandRail';
import './Home.css';

import { useLoading } from '../context/LoadingContext';

const Home = () => {
  const { hideLoading } = useLoading();
  const [loadedComponents, setLoadedComponents] = React.useState({
    rail: false,
    poster: false,
    grid: false
  });

  const handleLoad = (component) => {
    setLoadedComponents(prev => {
      const newState = { ...prev, [component]: true };
      // Check if all are true
      if (Object.values(newState).every(v => v)) {
        hideLoading();
      }
      return newState;
    });
  };

  return (
    <div className="home">
      <div className="container">
        {/* Billboard section */}
        <BrandRail onLoad={() => handleLoad('rail')} />
        <PosterCarousel onLoad={() => handleLoad('poster')} />

        {/* Trusted Brands Rail */}


        {/* Brand cards grid */}
        {/* Brand cards grid */}
        <BrandGrid onLoad={() => handleLoad('grid')} />
      </div>
    </div>
  );
};

export default Home;
