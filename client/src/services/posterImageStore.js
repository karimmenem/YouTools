// IndexedDB store for poster images (compressed)
const DB_NAME = 'youtoolsPosterImages';
const STORE = 'posters';
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePoster(key, dataUrl) {
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
    console.warn('savePoster failed', e);
  }
}

export async function getPoster(key) {
  if (!key) return null;
  try {
    const db = await openDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  } catch (e) { return null; }
}

export async function ensurePostersCached(posters) {
  if (!Array.isArray(posters)) return posters;
  return Promise.all(posters.map(async p => {
    const key = p.id;
    const cached = await getPoster(key);
    if (cached) return { ...p, image_url: cached };
    if (p.image_url && p.image_url.startsWith('data:')) savePoster(key, p.image_url);
    return p;
  }));
}
