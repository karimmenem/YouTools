import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getBrands, addBrand, deleteBrand, updateBrand, reorderBrands } from '../../services/brandService';
import './BrandManagement.css';

// Helper to compress image to target dimensions/quality under size threshold
async function compressImage(file, options = {}) {
  const { maxWidth = 400, maxHeight = 400, quality = 0.7, mimeType = 'image/webp', maxBytes = 60 * 1024 } = options;
  const blobURL = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = blobURL; });
  const canvas = document.createElement('canvas');
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio); height = Math.round(height * ratio);
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(blobURL);

  // Try iterative reduction if needed
  let q = quality;
  let dataUrl = canvas.toDataURL(mimeType, q);
  let attempts = 0;
  while (dataUrl.length * 0.75 > maxBytes && q > 0.3 && attempts < 5) { // length*0.75 ~ bytes
    q -= 0.1;
    dataUrl = canvas.toDataURL(mimeType, q);
    attempts++;
  }
  // Fallback to jpeg if still large & mimeType webp
  if (dataUrl.length * 0.75 > maxBytes && mimeType === 'image/webp') {
    q = Math.max(q - 0.1, 0.3);
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}

const BrandManagement = () => {
  const { language } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', logo: '' });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    const res = await getBrands();
    if (res.success) setBrands(res.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newBrand.name || !imagePreview) return;
    const logoUrl = imagePreview;
    const slug = newBrand.name.toLowerCase().replace(/\s+/g, '-');
    const res = await addBrand({ name: newBrand.name, slug, logo: logoUrl });
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca adicionada!' : 'Brand added!' });
      setNewBrand({ name: '' });
      setImageFile(null); setImagePreview('');
      if (res.all) setBrands(res.all);
      else loadBrands();
    } else {
      let txt = res.message || '';
      if (/quota|setItem/i.test(txt)) {
        txt = language === 'pt' ? 'Limite de armazenamento local atingido. Remova marcas ou use imagens menores.' : 'Local storage quota reached. Remove some brands or use smaller images.';
      }
      setMessage({ type: 'error', text: txt });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'pt' ? 'Excluir esta marca?' : 'Delete this brand?')) return;
    // Optimistic removal
    setBrands(prev => prev.filter(b => b.id !== id));
    const res = await deleteBrand(id);
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca removida!' : 'Brand removed!' });
      if (res.all) setBrands(res.all);
    } else {
      setMessage({ type: 'error', text: res.message || 'Delete failed' });
      // reload to revert if failure
      loadBrands();
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditForm({ name: brand.name, logo: brand.logo });
    setEditPreview(brand.logo);
    setEditFile(null);
    setMessage({ type: '', text: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', logo: '' });
    setEditPreview('');
    setEditFile(null);
  };

  const saveEdit = async (id) => {
    let logoUrl = editForm.logo;
    if (editFile) logoUrl = editPreview;
    const slug = editForm.name.toLowerCase().replace(/\s+/g, '-');
    const res = await updateBrand(id, { name: editForm.name, slug, logo: logoUrl });
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca atualizada!' : 'Brand updated!' });
      cancelEdit();
      if (res.all) setBrands(res.all); else loadBrands();
    } else {
      let txt = res.message || '';
      if (/quota|setItem/i.test(txt)) {
        txt = language === 'pt' ? 'Limite de armazenamento local atingido. Use imagem menor.' : 'Local storage quota reached. Use a smaller image.';
      }
      setMessage({ type: 'error', text: txt });
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '2rem' }}>{language === 'pt' ? 'Carregando marcas...' : 'Loading brands...'}</p>;

  return (
    <div className="brand-management">
      <h2 style={{ marginBottom: '1rem', color: 'black' }}>{language === 'pt' ? 'Gerenciar Marcas' : 'Manage Brands'}</h2>
      {message.text && (
        <div style={{ marginBottom: '1rem', color: message.type === 'success' ? '#4caf50' : '#f44336' }}>
          {message.text}
        </div>
      )}
      <div className="add-brand-form" style={{ alignItems: 'flex-start' }}>
        <input
          type="text"
          placeholder={language === 'pt' ? 'Digite nome da marca' : 'Enter brand name'}
          value={newBrand.name}
          style={{border: '1px solid #d32f2f', borderRadius: '6px', padding: '6px 10px'}}
          onChange={e => setNewBrand({ name: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          // style={{backgroundColor: '#d32f2f'}}
          onChange={async e => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              try {
                const compressed = await compressImage(file);
                setImagePreview(compressed);
              } catch (err) {
                console.warn('Compression failed, using original', err);
                const reader = new FileReader();
                reader.onload = ev => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              }
            }
          }}
        />
        <button onClick={handleAdd} style={{     backgroundColor: '#d32f2f', color: '#fff', borderRadius: '6px', padding: '6px 12px', border: 'none', cursor: 'pointer' }}>
          {language === 'pt' ? 'Adicionar' : 'Add'}
        </button>
      </div>
      {imagePreview && (
        <div style={{ marginBottom: '20px' }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
      <div className="brand-list" style={{ display: 'grid', gap: '16px' }}>
        {brands.map((b, index) => (
          <div
            key={b.id}
            className="brand-item"
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('text/plain', b.id);
              e.currentTarget.classList.add('dragging');
            }}
            onDragEnd={e => e.currentTarget.classList.remove('dragging')}
            onDragOver={e => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={async e => {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData('text/plain');
              if (!draggedId || draggedId === b.id) return;
              let newOrder;
              setBrands(prev => {
                const fromIdx = prev.findIndex(x => String(x.id) === draggedId);
                const toIdx = prev.findIndex(x => x.id === b.id);
                if (fromIdx === -1 || toIdx === -1) return prev;
                const copy = [...prev];
                const [moved] = copy.splice(fromIdx, 1);
                copy.splice(toIdx, 0, moved);
                newOrder = copy.map(x => x.id);
                return copy;
              });
              // wait microtask for state update and then persist
              setTimeout(() => { if (newOrder) reorderBrands(newOrder); }, 0);
            }}
            data-id={b.id}
            style={{ minHeight: '200px', paddingBottom: '16px', border: '1px dashed #d32f2f' }}
            onDragEnter={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#666'; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
          >
            {editingId === b.id ? (
              <div className="edit-brand" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #555', width: '100%' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditFile(file);
                      try {
                        const compressed = await compressImage(file);
                        setEditPreview(compressed);
                      } catch (err) {
                        console.warn('Compression failed, using original', err);
                        const reader = new FileReader();
                        reader.onload = ev => setEditPreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
                {editPreview && <img src={editPreview} alt="Preview" className="brand-preview" />}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => saveEdit(b.id)} className="save-btn">{language === 'pt' ? 'Salvar' : 'Save'}</button>
                  <button onClick={cancelEdit} className="cancel-btn">{language === 'pt' ? 'Cancelar' : 'Cancel'}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <img src={b.logo} alt={b.name} style={{ maxHeight: '100px', objectFit: 'contain' }} />
                <span style={{ color: '#fff', fontWeight: '600' }}>{b.name}</span>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => startEdit(b)} className="edit-btn">{language === 'pt' ? 'Editar' : 'Edit'}</button>
                  <button onClick={() => handleDelete(b.id)} className="delete-btn">{language === 'pt' ? 'Excluir' : 'Delete'}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandManagement;
