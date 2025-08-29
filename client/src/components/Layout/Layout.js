import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BrandSlider from '../Brand/BrandSlider';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  console.log('Layout rendering, current path:', location.pathname, 'isAdminPage:', isAdminPage);

  return (
    <div className="layout">
      <Header />
      {!isAdminPage && <BrandSlider />}
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
