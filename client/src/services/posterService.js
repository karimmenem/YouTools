// Poster service using Mirage.js backend
import { savePoster, ensurePostersCached } from './posterImageStore';

const API_BASE = '/api';

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('Non-JSON response');
  return await response.json();
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await safeJson(response);
};

const fallbackPosters = () => {
  try { return JSON.parse(localStorage.getItem('posters') || '[]'); } catch { return []; }
};

async function compressImageDataUrl(file, { maxWidth = 900, maxHeight = 900, quality = 0.75, maxBytes = 120 * 1024 } = {}) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio); height = Math.round(height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);
  let q = quality;
  let dataUrl = canvas.toDataURL('image/webp', q);
  let attempts = 0;
  while (dataUrl.length * 0.75 > maxBytes && q > 0.35 && attempts < 6) {
    q -= 0.1; attempts++; dataUrl = canvas.toDataURL('image/webp', q);
  }
  if (dataUrl.length * 0.75 > maxBytes) {
    q = Math.max(q - 0.05, 0.35);
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
};

export const getPosters = async () => {
  try {
    const response = await fetch(`${API_BASE}/posters`, { headers:{'Accept':'application/json'} });
    const data = await handleResponse(response);
    let list = data.posters || data;
    list = await ensurePostersCached(list);
    try { localStorage.setItem('posters', JSON.stringify(list)); } catch {}
    return { success: true, data: list };
  } catch (error) {
    console.error('Error fetching posters:', error);
    const fb = fallbackPosters();
    return { success: true, data: fb, fallback: true };
  }
};

export const addPoster = async (posterData) => {
  try {
    let payload = { ...posterData };
    if (payload.imageFile) {
      payload.image_url = await compressImageDataUrl(payload.imageFile);
      delete payload.imageFile;
    }
    const response = await fetch(`${API_BASE}/posters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(response);
    const newPoster = data.poster || data;
    if (newPoster.image_url && newPoster.image_url.startsWith('data:')) savePoster(newPoster.id, newPoster.image_url);
    const refreshed = await getPosters();
    return { success: true, data: newPoster, all: refreshed.data };
  } catch (error) {
    console.error('Error adding poster:', error);
    try {
      const existing = fallbackPosters();
      const id = Date.now();
      const localPoster = { id, ...posterData };
      existing.push(localPoster);
      localStorage.setItem('posters', JSON.stringify(existing));
      return { success: true, data: localPoster, all: existing, localOnly: true };
    } catch {}
    return { success: false, message: error.message };
  }
};

export const updatePoster = async (id, posterData) => {
  try {
    let payload = { ...posterData };
    if (payload.imageFile) {
      payload.image_url = await compressImageDataUrl(payload.imageFile);
      delete payload.imageFile;
    }
    const response = await fetch(`${API_BASE}/posters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(response);
    const updated = data.poster || data;
    if (updated.image_url && updated.image_url.startsWith('data:')) savePoster(updated.id, updated.image_url);
    const refreshed = await getPosters();
    return { success: true, data: updated, all: refreshed.data };
  } catch (error) {
    console.error('Error updating poster:', error);
    try {
      const list = fallbackPosters();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...posterData };
        localStorage.setItem('posters', JSON.stringify(list));
        return { success: true, data: list[idx], all: list, localOnly: true };
      }
    } catch {}
    return { success: false, message: error.message };
  }
};

export const deletePoster = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/posters/${id}`, { method: 'DELETE', headers:{'Accept':'application/json'} });
    await handleResponse(response);
    const refreshed = await getPosters();
    return { success: true, all: refreshed.data };
  } catch (error) {
    console.error('Error deleting poster:', error);
    try {
      const list = fallbackPosters();
      const filtered = list.filter(p => p.id !== id);
      localStorage.setItem('posters', JSON.stringify(filtered));
      return { success: true, all: filtered, localOnly: true };
    } catch {}
    return { success: false, message: error.message };
  }
};
