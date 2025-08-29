import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getBrands, addBrand, deleteBrand, updateBrand } from '../../services/brandService';
import './BrandManagement.css';

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
    if (!newBrand.name || !imageFile) return;
    const logoUrl = imagePreview;
    // auto-generate slug from name
    const slug = newBrand.name.toLowerCase().replace(/\s+/g, '-');
    const res = await addBrand({ name: newBrand.name, slug, logo: logoUrl });
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca adicionada!' : 'Brand added!' });
      setNewBrand({ name: '' });
      loadBrands();
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'pt' ? 'Excluir esta marca?' : 'Delete this brand?')) return;
    const res = await deleteBrand(id);
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca removida!' : 'Brand removed!' });
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
    // prepare updated data
    let logoUrl = editForm.logo;
    if (editFile) logoUrl = editPreview;
    const slug = editForm.name.toLowerCase().replace(/\s+/g, '-');
    const res = await updateBrand(id, { name: editForm.name, slug, logo: logoUrl });
    if (res.success) {
      setMessage({ type: 'success', text: language === 'pt' ? 'Marca atualizada!' : 'Brand updated!' });
      cancelEdit();
      loadBrands();
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '2rem' }}>{language === 'pt' ? 'Carregando marcas...' : 'Loading brands...'}</p>;

  return (
    <div className="brand-management">
      <h2 style={{ marginBottom: '1rem', color: '#fff' }}>{language === 'pt' ? 'Gerenciar Marcas' : 'Manage Brands'}</h2>
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
          onChange={e => setNewBrand({ name: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onload = ev => setImagePreview(ev.target.result);
              reader.readAsDataURL(file);
            }
          }}
        />
        <button onClick={handleAdd} style={{ backgroundColor: '#388e3c', color: '#fff', borderRadius: '6px', padding: '6px 12px', marginLeft: 'auto' }}>
          {language === 'pt' ? 'Adicionar' : 'Add'}
        </button>
      </div>
      {imagePreview && (
        <div style={{ marginBottom: '20px' }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
      <div className="brand-list">
        {brands.map(b => (
          <div key={b.id} className="brand-item" style={{ minHeight: '200px', paddingBottom: '16px' }}>
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
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditFile(file);
                      const reader = new FileReader();
                      reader.onload = ev => setEditPreview(ev.target.result);
                      reader.readAsDataURL(file);
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
