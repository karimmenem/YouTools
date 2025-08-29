import React from 'react';
import PosterCarousel from '../components/Posters/PosterCarousel';
import BrandGrid from '../components/Brand/BrandGrid';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="container">
        {/* Billboard section */}
        <PosterCarousel />
        {/* Brand cards grid */}
        <BrandGrid />
      </div>
    </div>
  );
};

export default Home;
