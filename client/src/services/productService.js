// Product service using IndexedDB (Dexie) and Supabase
import db from '../db';
import { supabase } from './supabaseClient';
import { productCache, withTimeout } from './productCache';
const API_BASE = '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('Non-JSON response');
  return await response.json();
};

const handleResponse = async (response) => {
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await safeJson(response);
};

// Helper function to normalize product images (backward compatibility)
const normalizeProductImages = (product) => {
  // If images array exists and has items, use first image as main image
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return {
      ...product,
      image_url: product.images[0],
      images: product.images
    };
  }
  // Fallback to single image field for backward compatibility
  return {
    ...product,
    image_url: product.image || product.image_url,
    images: product.image ? [product.image] : []
  };
};

export const getProducts = async (useCache = true) => {
  const cacheKey = 'all-products';
  
  // Try cache first (unless explicitly bypassed)
  if (useCache) {
    const cached = productCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Use cache deduplication to avoid multiple simultaneous requests
  return productCache.getOrFetch(cacheKey, async () => {
    if (supabase) {
      try {
        // First, try with images column (if migration was run)
        let query = supabase
          .from('products')
          .select('id,name,brand,price,category,image,images,position,description')
          .order('position', { ascending: true })
          .order('id');

        // Add timeout to prevent hanging
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Query timeout after 30s')), REQUEST_TIMEOUT);
        });
        
        let result;
        try {
          result = await Promise.race([
            query.then(result => {
              clearTimeout(timeoutId);
              return result;
            }),
            timeoutPromise
          ]);
        } catch (timeoutError) {
          clearTimeout(timeoutId);
          throw timeoutError;
        }
        
        const { data, error } = result;
        
        // If error about missing column, try without images column
        if (error && (error.message?.includes('column') || error.code === '42703')) {
          console.warn('Images column not found, retrying without it:', error.message);
          // Retry without images column (for backward compatibility)
          const fallbackQuery = supabase
            .from('products')
            .select('id,name,brand,price,category,image,position,description')
            .order('position', { ascending: true })
            .order('id');
          
          const fallbackResult = await Promise.race([
            fallbackQuery.then(result => result),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), REQUEST_TIMEOUT))
          ]);
          
          if (fallbackResult.error) {
            console.error('Supabase getProducts error (fallback):', fallbackResult.error);
            throw fallbackResult.error;
          }
          
          const normalized = (fallbackResult.data || []).map(normalizeProductImages);
          console.log(`✅ Fetched ${normalized.length} products from Supabase (without images column)`);
          return { success: true, data: normalized, remote: true };
        }
        
        if (error) {
          console.error('Supabase getProducts error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        const normalized = (data || []).map(normalizeProductImages);
        console.log(`✅ Fetched ${normalized.length} products from Supabase`);
        return { success: true, data: normalized, remote: true };
      } catch (e) { 
        console.error('Supabase getProducts failed:', e);
        console.error('Error message:', e.message);
        console.error('Error code:', e.code);
        // Don't fall through silently - return error so user knows
        // But also try IndexedDB as fallback
      }
    }
    
    // IndexedDB fallback
    try { 
      const data = await db.products.toArray(); 
      const normalized = data.map(normalizeProductImages);
      console.log(`⚠️ Using IndexedDB fallback: ${normalized.length} products`);
      return { success: true, data: normalized, fallback: true }; 
    } catch (error) { 
      console.error('Error reading products from DB:', error); 
      return { success: false, message: error.message, data: [] }; 
    }
  });
};

export const getSpecialOffers = async () => {
  try {
    const response = await fetch(`${API_BASE}/products/special-offers`, { headers:{'Accept':'application/json'} });
    const data = await handleResponse(response);
    return { success: true, data: data.products || data };
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return { success: true, data: [] , fallback:true};
  }
};

export const getProductById = async (id, useCache = true) => {
  const cacheKey = `product-${id}`;
  
  // Try cache first
  if (useCache) {
    const cached = productCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  return productCache.getOrFetch(cacheKey, async () => {
    if (supabase) {
      try {
        const query = supabase
          .from('products')
          .select('id,name,brand,price,category,image,images,position,description')
          .eq('id', id)
          .single();

        // Add timeout
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Query timeout after 30s')), REQUEST_TIMEOUT);
        });
        
        const { data, error } = await Promise.race([
          query.then(result => {
            clearTimeout(timeoutId);
            return result;
          }),
          timeoutPromise
        ]);
        
        if (error) throw error;
        const normalized = normalizeProductImages(data);
        return { success: true, data: normalized };
      } catch (e) { 
        console.warn('Supabase getProductById error:', e.message);
        // Fallback to API if Supabase fails
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
          
          const response = await fetch(`${API_BASE}/products/${id}`, { 
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const data = await handleResponse(response);
          const normalized = normalizeProductImages(data.product || data);
          return { success: true, data: normalized };
        } catch (error) {
          console.error('Error fetching product:', error);
          return { success: false, message: error.message };
        }
      }
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(`${API_BASE}/products/${id}`, { 
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await handleResponse(response);
      const normalized = normalizeProductImages(data.product || data);
      return { success: true, data: normalized };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, message: error.message };
    }
  });
};

export const addProduct = async (product) => {
  if (supabase) {
    try {
      let nextPos = 1;
      try {
        const { data: posData } = await supabase.from('products').select('position').order('position', { ascending: false }).limit(1);
        if (posData && posData.length && typeof posData[0].position === 'number') nextPos = posData[0].position + 1;
      } catch {}
      
      const toInsert = { ...product, position: nextPos };
      
      // Handle images array
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        toInsert.images = product.images;
        // Set first image as main image for backward compatibility
        toInsert.image = product.images[0];
      } else if (product.image_url || product.image) {
        // Single image support (backward compatibility)
        toInsert.image = product.image_url || product.image;
        toInsert.images = [product.image_url || product.image];
      }
      
      delete toInsert.image_url;
      const { data, error } = await supabase.from('products').insert(toInsert).select();
      if (error) throw error;
      const created = normalizeProductImages(data[0]);
      
      // Clear cache and fetch fresh data (bypass cache)
      productCache.clear();
      const all = await getProducts(false);
      return { success: true, data: created, all: all.data };
    } catch (e) { console.warn('Supabase addProduct fallback:', e.message); }
  }
  try { 
    const id = await db.products.add(product); 
    const data = await db.products.get(id); 
    const normalized = normalizeProductImages(data);
    return { success: true, data: normalized }; 
  } catch (error) { console.error('Error adding product to DB:', error); return { success: false, message: error.message }; }
};

export const updateProduct = async (id, product) => {
  if (supabase) {
    try {
      const toUpdate = { ...product };
      
      // Handle images array
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        toUpdate.images = product.images;
        // Set first image as main image for backward compatibility
        toUpdate.image = product.images[0];
      } else if (product.image_url || product.image) {
        // Single image support (backward compatibility)
        toUpdate.image = product.image_url || product.image;
        // If images field exists, update it too
        if (!toUpdate.images) {
          toUpdate.images = [product.image_url || product.image];
        }
      }
      
      delete toUpdate.image_url;
      const { data, error } = await supabase.from('products').update(toUpdate).eq('id', id).select();
      if (error) throw error;
      const updated = normalizeProductImages(data[0]);
      
      // Clear cache and fetch fresh data (bypass cache)
      productCache.clear();
      const all = await getProducts(false);
      return { success: true, data: updated, all: all.data };
    } catch (e) { console.warn('Supabase updateProduct fallback:', e.message); }
  }
  try { 
    await db.products.update(id, product); 
    const data = await db.products.get(id); 
    const normalized = normalizeProductImages(data);
    return { success: true, data: normalized }; 
  } catch (error) { console.error('Error updating product in DB:', error); return { success: false, message: error.message }; }
};

export const deleteProduct = async (id) => {
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      // Clear cache and fetch fresh data (bypass cache)
      productCache.clear();
      const all = await getProducts(false);
      return { success: true, data: all.data };
    } catch (e) { console.warn('Supabase deleteProduct fallback:', e.message); }
  }
  try { 
    await db.products.delete(id); 
    productCache.clear();
    return { success: true, message: 'Product deleted successfully' }; 
  } catch (error) { 
    console.error('Error deleting product from DB:', error); 
    return { success: false, message: error.message }; 
  }
};

export const getCategories = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('id,name,created_at');
      if (error) throw error;
      return { success: true, data: data || [], remote: true };
    } catch (e) { console.warn('Supabase categories fallback:', e.message); }
  }
  return { success: true, data: [], fallback:true };
};

export const refreshProducts = async () => { 
  productCache.clear();
  return await getProducts(false); 
};

// Debug function to test Supabase connection
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('❌ Supabase client is not initialized. Check your environment variables.');
    return { success: false, message: 'Supabase not configured' };
  }

  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Try to get actual count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('⚠️ Could not get product count:', countError);
    } else {
      console.log(`📊 Products in database: ${count}`);
    }
    
    return { success: true, count };
  } catch (e) {
    console.error('❌ Supabase test failed:', e);
    return { success: false, error: e.message };
  }
};
