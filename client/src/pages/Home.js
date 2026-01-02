import React from 'react';
import PosterCarousel from '../components/Posters/PosterCarousel';
import BrandGrid from '../components/Brand/BrandGrid';
import BrandRail from '../components/Brand/BrandRail';
import './Home.css';

import { useLoading } from '../context/LoadingContext';

import SEO from '../components/SEO';

const Home = () => {
  const { hideLoading } = useLoading();
  const [loadedComponents, setLoadedComponents] = React.useState({
    rail: false,
    poster: false,
    grid: false
  });

  const handleLoad = React.useCallback((component) => {
    setLoadedComponents(prev => {
      const newState = { ...prev, [component]: true };
      // Check if all are true
      if (Object.values(newState).every(v => v)) {
        hideLoading();
      }
      return newState;
    });
  }, [hideLoading]);

  const handleRailLoad = React.useCallback(() => handleLoad('rail'), [handleLoad]);
  const handlePosterLoad = React.useCallback(() => handleLoad('poster'), [handleLoad]);
  const handleGridLoad = React.useCallback(() => handleLoad('grid'), [handleLoad]);

  return (
    <div className="home">
      <SEO
        title="Início"
        description="A YouTools é sua parceira ideal em ferramentas e equipamentos industriais. Encontre as melhores marcas e preços."
      />
      <div className="container">
        {/* Billboard section */}
        <BrandRail onLoad={handleRailLoad} />
        <PosterCarousel onLoad={handlePosterLoad} />

        {/* Trusted Brands Rail */}


        {/* Brand cards grid */}
        {/* Brand cards grid */}
        <BrandGrid onLoad={handleGridLoad} />
      </div>
    </div>
  );
};

export default Home;
