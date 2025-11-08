// Supabase client (optional production backend)
// Provide env vars REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel.
// If not set, services fall back to Mirage/local storage.
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Configure Supabase with timeout and better connection settings
export const supabase = (url && key) 
  ? createClient(url, key, { 
      auth: { persistSession: false },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'youtools-web'
        },
        // Add fetch with timeout (compatible with all browsers)
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          return fetch(url, {
            ...options,
            signal: controller.signal
          }).then(response => {
            clearTimeout(timeoutId);
            return response;
          }).catch(error => {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              throw new Error('Request timeout - please check your connection or try again');
            }
            throw error;
          });
        }
      }
    }) 
  : null;
