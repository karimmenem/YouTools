// Poster service using Mirage.js backend

const API_BASE = '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Get all posters
export const getPosters = async () => {
  try {
    const response = await fetch(`${API_BASE}/posters`);
    const data = await handleResponse(response);
    return {
      success: true,
      data: data.posters || data
    };
  } catch (error) {
    console.error('Error fetching posters:', error);
    return { success: false, message: error.message };
  }
};

// Add poster
export const addPoster = async (posterData) => {
  try {
    const response = await fetch(`${API_BASE}/posters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posterData)
    });
    const data = await handleResponse(response);
        const newPoster = data.poster || data;
        // update localStorage
        try {
          const stored = localStorage.getItem('posters');
          const arr = stored ? JSON.parse(stored) : [];
          localStorage.setItem('posters', JSON.stringify([...arr, newPoster]));
        } catch (_) {}
        return { success: true, data: newPoster };
  } catch (error) {
    console.error('Error adding poster:', error);
    return { success: false, message: error.message };
  }
};

// Update poster
export const updatePoster = async (id, posterData) => {
  try {
    const response = await fetch(`${API_BASE}/posters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posterData)
    });
    const data = await handleResponse(response);
    return { success: true, data: data.poster || data };
  } catch (error) {
    console.error('Error updating poster:', error);
    return { success: false, message: error.message };
  }
};

// Delete poster
export const deletePoster = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/posters/${id}`, { method: 'DELETE' });
    await handleResponse(response);
        // update localStorage
        try {
          const stored = localStorage.getItem('posters');
          let arr = stored ? JSON.parse(stored) : [];
          arr = arr.filter(p => p.id !== id);
          localStorage.setItem('posters', JSON.stringify(arr));
        } catch (_) {}
        return { success: true };
  } catch (error) {
    console.error('Error deleting poster:', error);
    return { success: false, message: error.message };
  }
};
