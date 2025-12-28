import React, { useState, useEffect } from 'react';
import LoadingCentered from './components/Loading/LoadingCentered';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import BrandProducts from './pages/BrandProducts';
import Auth from './pages/Auth';
import ProductDetail from './pages/ProductDetail'; // Import ProductDetail component
import About from './pages/About';
import './styles/App.css';

import { LoadingProvider, useLoading } from './context/LoadingContext';
import GlobalLoading from './components/Loading/GlobalLoading';
import { useLocation } from 'react-router-dom';

function RouteChangeHandler({ children }) {
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const [prevLoc, setPrevLoc] = useState(location.pathname);

  useEffect(() => {
    if (prevLoc !== location.pathname) {
      setPrevLoc(location.pathname);
      showLoading();
    }
  }, [location, showLoading, prevLoc]);

  return children;
}

function App() {
  // Clean up any existing auth on app start to prevent auto-login
  useEffect(() => {
    // Clear any existing auth state to force manual login
    localStorage.removeItem('youtools_auth');
  }, []);

  return (
    <LoadingProvider>
      <LanguageProvider>
        <div className="App">
          <GlobalLoading />
          <RouteChangeHandler>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="produtos" element={<Products />} />
                <Route path="produtos/:categorySlug" element={<Products />} />

                <Route path=":brandSlug" element={<BrandProducts />} />
                <Route path="produto/:productSlug" element={<ProductDetail />} /> {/* Add route for product detail page */}
                <Route path="about" element={<About />} />
              </Route>
              <Route path="/admin/*" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RouteChangeHandler>
        </div>
      </LanguageProvider>
    </LoadingProvider>
  );
}

export default App;
