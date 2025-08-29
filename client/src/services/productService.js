// Product service using Mirage.js backend

const API_BASE = '/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Get all products
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const data = await handleResponse(response);
    
    return {
      success: true,
      data: data.products || data // Mirage returns { products: [...] }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Get special offers
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

// Get product by ID
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

// Add new product
export const addProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    const data = await handleResponse(response);
    
    return {
      success: true,
      data: data.product || data
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    const data = await handleResponse(response);
    
    return {
      success: true,
      data: data.product || data
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    
    await handleResponse(response);
    
    return {
      success: true,
      message: 'Product deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Get categories
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
