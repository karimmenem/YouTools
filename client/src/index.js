import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { makeServer } from './server/mirage';
import { supabase } from './services/supabaseClient';

// Start Mirage only if Supabase not configured and not explicitly disabled
if (typeof window !== 'undefined' && !supabase && process.env.REACT_APP_ENABLE_MIRAGE !== 'false') {
  if (!window.server) {
    try { window.server = makeServer({ environment: 'production' }); } catch (e) {}
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
