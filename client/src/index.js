import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { makeServer } from './server/mirage';

// Start Mirage unless explicitly disabled (needed for Vercel static deploy)
// Set REACT_APP_ENABLE_MIRAGE=false when a real backend is available.
if (typeof window !== 'undefined' && process.env.REACT_APP_ENABLE_MIRAGE !== 'false') {
  if (!window.server) {
    try {
      window.server = makeServer({ environment: 'production' });
      // console.log('Mirage server started in production mode');
    } catch (e) {
      // Fallback attempt (avoid crash if already created)
      // console.warn('Mirage start failed:', e);
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
