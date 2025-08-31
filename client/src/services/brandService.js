// Brand service using Mirage.js backend
import { saveLogo, ensureLogosCached } from './brandImageStore';
import { supabase } from './supabaseClient';

const API_BASE = '/api';

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response');
  }
  return await response.json();
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await safeJson(response);
};

const fallbackBrands = () => {
  try {
    let list = JSON.parse(localStorage.getItem('brands') || '[]');
    if (!list.length) list = JSON.parse(localStorage.getItem('brands_index') || '[]');
    return list;
  } catch { return []; }
};

export const getBrands = async () => {
  // Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase.from('brands').select('id,name,slug,logo').order('id');
      if (error) throw error;
      let list = data || [];
      // Apply order from brands_order if present locally (optional)
      try {
        const orderRaw = localStorage.getItem('brands_order');
        if (orderRaw) {
          const order = JSON.parse(orderRaw);
            const map = new Map(list.map(b => [b.id, b]));
            const ordered = order.map(id => map.get(id)).filter(Boolean);
            list.forEach(b => { if (!order.includes(b.id)) ordered.push(b); });
            if (ordered.length) list = ordered;
        }
      } catch {}
      list = await ensureLogosCached(list);
      try { localStorage.setItem('brands', JSON.stringify(list)); localStorage.setItem('brands_index', JSON.stringify(list.map(({id,name,slug})=>({id,name,slug})))); } catch {}
      return { success: true, data: list, remote: true };
    } catch (e) { console.warn('Supabase brands fallback:', e.message); }
  }
  try {
    const response = await fetch(`${API_BASE}/brands`, { headers: { 'Accept':'application/json' } });
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
    const fb = fallbackBrands();
    return { success: true, data: fb, fallback: true };
  }
};

export const addBrand = async (brandData) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('brands').insert(brandData).select();
      if (error) throw error;
      const newBrand = data[0];
      if (newBrand.logo && newBrand.logo.startsWith('data:')) saveLogo(newBrand.id || newBrand.slug, newBrand.logo);
      const all = await getBrands();
      return { success: true, data: newBrand, all: all.data };
    } catch (e) { console.warn('Supabase addBrand fallback:', e.message); }
  }
  try {
    const response = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
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
    // Local append fallback
    try {
      const existing = fallbackBrands();
      const id = Date.now();
      const slug = (brandData.name || 'brand').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + id;
      const localBrand = { id, slug, ...brandData };
      existing.push(localBrand);
      localStorage.setItem('brands', JSON.stringify(existing));
      localStorage.setItem('brands_index', JSON.stringify(existing.map(({ id, name, slug }) => ({ id, name, slug }))));
      return { success: true, data: localBrand, all: existing, localOnly: true };
    } catch {}
    return { success: false, message: error.message };
  }
};

export const updateBrand = async (id, brandData) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('brands').update(brandData).eq('id', id).select();
      if (error) throw error;
      const updated = data[0];
      if (updated.logo && updated.logo.startsWith('data:')) saveLogo(updated.id || updated.slug, updated.logo);
      const all = await getBrands();
      return { success: true, data: updated, all: all.data };
    } catch (e) { console.warn('Supabase updateBrand fallback:', e.message); }
  }
  try {
    const response = await fetch(`${API_BASE}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify(brandData)
    });
    const data = await handleResponse(response);
    const updated = data.brand || data;
    if (updated.logo && updated.logo.startsWith('data:')) saveLogo(updated.id || updated.slug, updated.logo);
    const all = await getBrands();
    return { success: true, data: updated, all: all.data };
  } catch (error) {
    console.error('Error updating brand:', error);
    // Local update fallback
    try {
      const list = fallbackBrands();
      const idx = list.findIndex(b => b.id === id || b.slug === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...brandData };
        localStorage.setItem('brands', JSON.stringify(list));
        localStorage.setItem('brands_index', JSON.stringify(list.map(({ id, name, slug }) => ({ id, name, slug }))));
        return { success: true, data: list[idx], all: list, localOnly: true };
      }
    } catch {}
    return { success: false, message: error.message };
  }
};

export const deleteBrand = async (idOrSlug) => {
  if (supabase) {
    try {
      // Resolve id if slug passed
      let targetId = idOrSlug;
      if (/[a-zA-Z-]/.test(String(idOrSlug))) {
        const { data } = await supabase.from('brands').select('id,slug').ilike('slug', idOrSlug).limit(1);
        if (data && data.length) targetId = data[0].id;
      }
      const { error } = await supabase.from('brands').delete().eq('id', targetId);
      if (error) throw error;
      const all = await getBrands();
      return { success: true, all: all.data };
    } catch (e) { console.warn('Supabase deleteBrand fallback:', e.message); }
  }
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

    const response = await fetch(`${API_BASE}/brands/${targetId}`, { method: 'DELETE', headers:{'Accept':'application/json'} });
    if (!response.ok) throw new Error(`Delete failed (${response.status})`);

    // Refresh list
    const all = await getBrands();
    // Also prune localStorage immediately (safety if server list stale)
    try {
      const raw = fallbackBrands();
      const filtered = raw.filter(b => b.id !== targetId && b.slug !== idOrSlug);
      localStorage.setItem('brands', JSON.stringify(filtered));
      localStorage.setItem('brands_index', JSON.stringify(filtered.map(({ id, name, slug }) => ({ id, name, slug }))));
    } catch { /* ignore */ }

    return { success: true, all: all.data };
  } catch (error) {
    console.error('Error deleting brand:', error);
    // Attempt local fallback deletion if we at least have slug/id
    try {
      const raw = fallbackBrands();
      const filtered = raw.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug);
      if (filtered.length !== raw.length) {
        localStorage.setItem('brands', JSON.stringify(filtered));
        localStorage.setItem('brands_index', JSON.stringify(filtered.map(({ id, name, slug }) => ({ id, name, slug }))));
        return { success: true, all: filtered, localOnly: true };
      }
    } catch { /* ignore */ }
    return { success: false, message: error.message };
  }
};

export const reorderBrands = async (orderedIds) => {
  if (supabase) {
    try { localStorage.setItem('brands_order', JSON.stringify(orderedIds)); } catch {}
  }
  try {
    const current = await getBrands();
    if (!current.success) throw new Error('Cannot load brands for reorder');
    const map = new Map(current.data.map(b => [b.id, b]));
    const reordered = orderedIds.map(id => map.get(id)).filter(Boolean);
    current.data.forEach(b => { if (!orderedIds.includes(b.id)) reordered.push(b); });
    localStorage.setItem('brands', JSON.stringify(reordered));
    localStorage.setItem('brands_order', JSON.stringify(reordered.map(b => b.id)));
    localStorage.setItem('brands_index', JSON.stringify(reordered.map(({ id, name, slug }) => ({ id, name, slug }))));
    return { success: true, data: reordered };
  } catch (e) {
    return { success: false, message: e.message };
  }
};
