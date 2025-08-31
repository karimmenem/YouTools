// Poster service using Mirage.js backend
import { savePoster, ensurePostersCached } from './posterImageStore';
import { supabase } from './supabaseClient';

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
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posters').select('id,title,image,position,active').order('position', { ascending: true }).order('id');
      if (error) throw error;
      const normalized = (data || []).map(p => ({ ...p, image_url: p.image || p.image_url }));
      const posters = await ensurePostersCached(normalized);
      try { localStorage.setItem('posters', JSON.stringify(posters)); } catch {}
      return { success: true, data: posters, remote: true };
    } catch (e) { console.warn('Supabase getPosters fallback:', e.message); }
  }
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
  if (supabase) {
    try {
      let nextPos = 1;
      try {
        const { data: posData } = await supabase.from('posters').select('position').order('position', { ascending: false }).limit(1);
        if (posData && posData.length && typeof posData[0].position === 'number') nextPos = posData[0].position + 1;
      } catch {}
      const toInsert = { ...posterData, image: posterData.image_url || posterData.image, position: nextPos };
      delete toInsert.image_url;
      const { data, error } = await supabase.from('posters').insert(toInsert).select();
      if (error) throw error;
      const created = { ...data[0], image_url: data[0].image };
      if (created.image_url && created.image_url.startsWith('data:')) savePoster(created.id || created.title, created.image_url);
      const all = await getPosters();
      return { success: true, data: created, all: all.data };
    } catch (e) { console.warn('Supabase addPoster fallback:', e.message); }
  }
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
  if (supabase) {
    try {
      const toUpdate = { ...posterData, image: posterData.image_url || posterData.image };
      delete toUpdate.image_url;
      const { data, error } = await supabase.from('posters').update(toUpdate).eq('id', id).select();
      if (error) throw error;
      const updated = { ...data[0], image_url: data[0].image };
      if (updated.image_url && updated.image_url.startsWith('data:')) savePoster(updated.id || updated.title, updated.image_url);
      const all = await getPosters();
      return { success: true, data: updated, all: all.data };
    } catch (e) { console.warn('Supabase updatePoster fallback:', e.message); }
  }
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
  if (supabase) {
    try {
      const { error } = await supabase.from('posters').delete().eq('id', id);
      if (error) throw error;
      const refreshed = await getPosters();
      return { success: true, all: refreshed.data };
    } catch (e) { console.warn('Supabase deletePoster fallback:', e.message); }
  }
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

export const reorderPosters = async (orderedIds) => {
  if (supabase) {
    try {
      const updates = orderedIds.map((id, idx) => ({ id, position: idx + 1 }));
      const { error } = await supabase.from('posters').upsert(updates, { onConflict: 'id' });
      if (error) throw error;
      const refreshed = await getPosters();
      try { localStorage.setItem('posters_order', JSON.stringify(orderedIds)); } catch {}
      return { success: true, data: refreshed.data };
    } catch (e) { console.warn('Supabase reorderPosters fallback:', e.message); }
  }
  try {
    const currentOrder = fallbackPosters();
    const ordered = orderedIds.map(id => currentOrder.find(p => p.id === id)).filter(Boolean);
    localStorage.setItem('posters', JSON.stringify(ordered));
    return { success: true, data: ordered, localOnly: true };
  } catch (e) {
    console.error('Error reordering posters:', e);
    return { success: false, message: e.message };
  }
};
