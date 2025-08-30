// Product service using IndexedDB (Dexie)
import db from '../db';
// Base URL for Mirage endpoints
const API_BASE = '/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Get all products from IndexedDB
export const getProducts = async () => {
  try {
    const data = await db.products.toArray();
    return { success: true, data };
  } catch (error) {
    console.error('Error reading products from DB:', error);
    return { success: false, message: error.message };
  }
};

// Get special offers from Mirage
export const getSpecialOffers = async () => {
  try {
    // Fetch only special offers from Mirage special-offers route
    const response = await fetch(`${API_BASE}/products/special-offers`);
    const data = await handleResponse(response);
    // Mirage returns { products: [...] }
    return {
      success: true,
      data: data.products || data
    };
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Get product by ID from Mirage
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const data = await handleResponse(response);
    
    return {
      success: true,
      data: data.product || data
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Add new product to IndexedDB
export const addProduct = async (productData) => {
  try {
    const id = await db.products.add(productData);
    const data = await db.products.get(id);
    return { success: true, data };
  } catch (error) {
    console.error('Error adding product to DB:', error);
    return { success: false, message: error.message };
  }
};

// Update product in IndexedDB
export const updateProduct = async (id, productData) => {
  try {
    await db.products.update(id, productData);
    const data = await db.products.get(id);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating product in DB:', error);
    return { success: false, message: error.message };
  }
};

// Delete product from IndexedDB
export const deleteProduct = async (id) => {
  try {
    await db.products.delete(id);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product from DB:', error);
    return { success: false, message: error.message };
  }
};

// Get categories from Mirage
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await handleResponse(response);
    
    return {
      success: true,
      data: data.categories || data
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Force refresh (clear any caches)
export const refreshProducts = async () => {
  return await getProducts();
};
