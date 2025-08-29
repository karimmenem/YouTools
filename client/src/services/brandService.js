// Brand service using Mirage.js backend

const API_BASE = '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const getBrands = async () => {
  try {
    const response = await fetch(`${API_BASE}/brands`);
    const data = await handleResponse(response);
    return { success: true, data: data.brands || data };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { success: false, message: error.message };
  }
};

export const addBrand = async (brandData) => {
  try {
    const response = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData)
    });
    const data = await handleResponse(response);
    const newBrand = data.brand || data;
    // refresh full list and persist to localStorage
    const all = await getBrands();
    if (all.success) {
      localStorage.setItem('brands', JSON.stringify(all.data));
    }
    return { success: true, data: newBrand };
  } catch (error) {
    console.error('Error adding brand:', error);
    return { success: false, message: error.message };
  }
};

export const updateBrand = async (id, brandData) => {
  try {
    const response = await fetch(`${API_BASE}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData)
    });
    const data = await handleResponse(response);
    const updatedBrand = data.brand || data;
    // refresh full list and persist to localStorage
    const all = await getBrands();
    if (all.success) {
      localStorage.setItem('brands', JSON.stringify(all.data));
    }
    return { success: true, data: updatedBrand };
  } catch (error) {
    console.error('Error updating brand:', error);
    return { success: false, message: error.message };
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/brands/${id}`, { method: 'DELETE' });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error deleting brand:', error);
    return { success: false, message: error.message };
  }
};
