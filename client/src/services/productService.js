// Product service using IndexedDB (Dexie) and Supabase
import db from '../db';
import { supabase } from './supabaseClient';
const API_BASE = '/api';

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('Non-JSON response');
  return await response.json();
};

const handleResponse = async (response) => {
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await safeJson(response);
};

export const getProducts = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('id,name,brand,price,category,image,position,description').order('position', { ascending: true }).order('id');
      if (error) throw error;
      return { success: true, data, remote: true };
    } catch (e) { console.warn('Supabase getProducts fallback:', e.message); }
  }
  try { const data = await db.products.toArray(); return { success: true, data }; } catch (error) { console.error('Error reading products from DB:', error); return { success: false, message: error.message }; }
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

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, { headers:{'Accept':'application/json'} });
    const data = await handleResponse(response);
    return { success: true, data: data.product || data };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, message: error.message };
  }
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
      const { data, error } = await supabase.from('products').insert(toInsert).select();
      if (error) throw error;
      const all = await getProducts();
      return { success: true, data: data[0], all: all.data };
    } catch (e) { console.warn('Supabase addProduct fallback:', e.message); }
  }
  try { const id = await db.products.add(product); const data = await db.products.get(id); return { success: true, data }; } catch (error) { console.error('Error adding product to DB:', error); return { success: false, message: error.message }; }
};

export const updateProduct = async (id, product) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
      if (error) throw error;
      const all = await getProducts();
      return { success: true, data: data[0], all: all.data };
    } catch (e) { console.warn('Supabase updateProduct fallback:', e.message); }
  }
  try { await db.products.update(id, product); const data = await db.products.get(id); return { success: true, data }; } catch (error) { console.error('Error updating product in DB:', error); return { success: false, message: error.message }; }
};

export const deleteProduct = async (id) => {
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      const all = await getProducts();
      return { success: true, data: all.data };
    } catch (e) { console.warn('Supabase deleteProduct fallback:', e.message); }
  }
  try { await db.products.delete(id); return { success: true, message: 'Product deleted successfully' }; } catch (error) { console.error('Error deleting product from DB:', error); return { success: false, message: error.message }; }
};

export const getCategories = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('id,name,slug');
      if (error) throw error;
      return { success: true, data: data || [], remote: true };
    } catch (e) { console.warn('Supabase categories fallback:', e.message); }
  }
  try {
    const response = await fetch(`${API_BASE}/categories`, { headers:{'Accept':'application/json'} });
    const data = await handleResponse(response);
    return { success: true, data: data.categories || data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: true, data: [], fallback:true };
  }
};

export const refreshProducts = async () => { return await getProducts(); };
