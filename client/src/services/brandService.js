// Brand service using Mirage.js backend
import { saveLogo, ensureLogosCached } from './brandImageStore';

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
    let list = data.brands || data;
    // Apply custom order if exists
    try {
      const orderRaw = localStorage.getItem('brands_order');
      if (orderRaw) {
        const order = JSON.parse(orderRaw); // array of ids
        const map = new Map(list.map(b => [b.id, b]));
        const ordered = order.map(id => map.get(id)).filter(Boolean);
        // append any new ones not in order
        list.forEach(b => { if (!order.includes(b.id)) ordered.push(b); });
        if (ordered.length) list = ordered;
      }
    } catch { /* ignore */ }
    list = await ensureLogosCached(list);
    try {
      const index = list.map(({ id, name, slug }) => ({ id, name, slug }));
      localStorage.setItem('brands_index', JSON.stringify(index));
      localStorage.setItem('brands', JSON.stringify(list)); // keep full compressed list for reload persistence
    } catch (e) { /* ignore */ }
    return { success: true, data: list };
  } catch (error) {
    console.error('Error fetching brands:', error);
    try {
      let fallback = JSON.parse(localStorage.getItem('brands') || '[]');
      if (!fallback.length) fallback = JSON.parse(localStorage.getItem('brands_index') || '[]');
      return { success: true, data: fallback };
    } catch { /* ignore */ }
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
    // cache logo if data URL
    if (newBrand.logo && newBrand.logo.startsWith('data:')) saveLogo(newBrand.id || newBrand.slug, newBrand.logo);
    const all = await getBrands();
    return { success: true, data: newBrand, all: all.data };
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
    const updated = data.brand || data;
    if (updated.logo && updated.logo.startsWith('data:')) saveLogo(updated.id || updated.slug, updated.logo);
    const all = await getBrands();
    return { success: true, data: updated, all: all.data };
  } catch (error) {
    console.error('Error updating brand:', error);
    return { success: false, message: error.message };
  }
};

export const deleteBrand = async (idOrSlug) => {
  try {
    let targetId = idOrSlug;
    // If no id or looks like slug (contains letters or dashes) try to resolve
    if (!targetId || /[a-zA-Z-]/.test(String(targetId))) {
      const current = await getBrands();
      if (current.success) {
        const match = current.data.find(b => b.id === idOrSlug || b.slug === idOrSlug);
        if (match && match.id) targetId = match.id;
      }
    }
    if (targetId == null) throw new Error('Brand id not found');

    const response = await fetch(`${API_BASE}/brands/${targetId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Delete failed (${response.status})`);

    // Refresh list
    const all = await getBrands();
    // Also prune localStorage immediately (safety if server list stale)
    try {
      const raw = JSON.parse(localStorage.getItem('brands') || '[]');
      const filtered = raw.filter(b => b.id !== targetId && b.slug !== idOrSlug);
      localStorage.setItem('brands', JSON.stringify(filtered));
      const idx = filtered.map(({ id, name, slug }) => ({ id, name, slug }));
      localStorage.setItem('brands_index', JSON.stringify(idx));
    } catch { /* ignore */ }

    return { success: true, all: all.data };
  } catch (error) {
    console.error('Error deleting brand:', error);
    // Attempt local fallback deletion if we at least have slug/id
    try {
      const raw = JSON.parse(localStorage.getItem('brands') || '[]');
      const filtered = raw.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug);
      if (filtered.length !== raw.length) {
        localStorage.setItem('brands', JSON.stringify(filtered));
        const idx = filtered.map(({ id, name, slug }) => ({ id, name, slug }));
        localStorage.setItem('brands_index', JSON.stringify(idx));
        return { success: true, all: filtered, localOnly: true };
      }
    } catch { /* ignore */ }
    return { success: false, message: error.message };
  }
};

export const reorderBrands = async (orderedIds) => {
  try {
    const current = await getBrands();
    if (!current.success) throw new Error('Cannot load brands for reorder');
    const map = new Map(current.data.map(b => [b.id, b]));
    const reordered = orderedIds.map(id => map.get(id)).filter(Boolean);
    current.data.forEach(b => { if (!orderedIds.includes(b.id)) reordered.push(b); });
    localStorage.setItem('brands', JSON.stringify(reordered));
    localStorage.setItem('brands_order', JSON.stringify(reordered.map(b => b.id)));
    const idx = reordered.map(({ id, name, slug }) => ({ id, name, slug }));
    localStorage.setItem('brands_index', JSON.stringify(idx));
    return { success: true, data: reordered };
  } catch (e) {
    return { success: false, message: e.message };
  }
};
