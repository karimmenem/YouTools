// Lightweight IndexedDB wrapper for brand logos
// Stores compressed data URLs by brand id (fallback to slug)

const DB_NAME = 'youtoolsBrandLogos';
const STORE = 'logos';
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLogo(key, dataUrl) {
  if (!key || !dataUrl) return;
  try {
    const db = await openDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(dataUrl, key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    console.warn('saveLogo failed', e);
  }
}

export async function getLogo(key) {
  if (!key) return null;
  try {
    const db = await openDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  } catch (e) {
    return null;
  }
}

export async function ensureLogosCached(brands) {
  // For each brand, ensure logo cached and if cache exists, replace reference
  if (!Array.isArray(brands)) return brands;
  const updated = await Promise.all(brands.map(async b => {
    const key = b.id || b.slug;
    const cached = await getLogo(key);
    if (cached) {
      return { ...b, logo: cached };
    } else if (b.logo && b.logo.startsWith('data:')) {
      // store original compressed (already compressed upstream in UI)
      saveLogo(key, b.logo);
    }
    return b;
  }));
  return updated;
}
