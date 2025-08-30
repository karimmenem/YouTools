import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getProducts, updateProduct, deleteProduct } from '../../services/productService';
import './ProductList.css';

const ProductList = ({ onStatsUpdate }) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (e) {
      console.error('Error loading products', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteProductHandler = async (id) => {
    if (!window.confirm(language === 'pt' ? 'Excluir este produto?' : 'Delete this product?')) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) { setMessage({ type: 'success', text: language === 'pt' ? 'Excluído!' : 'Deleted!' }); loadProducts(); onStatsUpdate && onStatsUpdate(); }
      else setMessage({ type: 'error', text: res.message || (language === 'pt' ? 'Erro ao excluir' : 'Delete failed') });
    } catch { setMessage({ type: 'error', text: language === 'pt' ? 'Erro de conexão' : 'Connection error' }); }
  };

  const toggleStock = async (id, inStock) => {
    try {
      const res = await updateProduct(id, { in_stock: !inStock });
      if (res.success) { loadProducts(); setMessage({ type: 'success', text: language === 'pt' ? 'Estoque atualizado!' : 'Stock updated!' }); }
    } catch { setMessage({ type: 'error', text: language === 'pt' ? 'Erro' : 'Error' }); }
  };

  const startEdit = (p) => {
    setEditingProduct(p.id);
    setEditFormData({ name: p.name, price: p.price, description: p.description || '' });
  };
  const cancelEdit = () => { setEditingProduct(null); setEditFormData({}); };
  const saveEdit = async (id) => {
    try {
      const res = await updateProduct(id, { ...editFormData, price: parseFloat(editFormData.price) });
      if (res.success) { setMessage({ type: 'success', text: language === 'pt' ? 'Atualizado!' : 'Updated!' }); cancelEdit(); loadProducts(); }
      else setMessage({ type: 'error', text: res.message || (language === 'pt' ? 'Falha ao atualizar' : 'Update failed') });
    } catch { setMessage({ type: 'error', text: language === 'pt' ? 'Erro de conexão' : 'Connection error' }); }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="loading" style={{ color: '#fff', textAlign: 'center', marginTop: '2rem' }}>{language === 'pt' ? 'Carregando...' : 'Loading...'}</div>;

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h2 className="product-list-title">{language === 'pt' ? 'Gerenciar Produtos' : 'Manage Products'}</h2>
        <p style={{ color: '#ccc', fontSize: '14px', marginTop: '8px' }}>{language === 'pt' ? `Total: ${products.length} produtos` : `Total: ${products.length} products`}</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`} style={{ margin: '20px 30px', padding: '12px 16px', borderRadius: '8px', background: message.type === 'success' ? 'rgba(76,175,80,.1)' : 'rgba(244,67,54,.1)', border: `1px solid ${message.type === 'success' ? 'rgba(76,175,80,.3)' : 'rgba(244,67,54,.3)'}`, color: message.type === 'success' ? '#4caf50' : '#f44336' }}>{message.text}</div>
      )}

      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="admin-product-card">
            <div className="admin-product-image">{p.image_url ? <img src={p.image_url} alt={p.name} /> : <div style={{ color:'#666', fontSize:'48px' }}>📦</div>}</div>
            <div className="admin-product-info">
              {editingProduct === p.id ? (
                <div className="edit-form" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <input className="form-input" name="name" value={editFormData.name} onChange={handleEditChange} />
                  <input className="form-input" type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} />
                  <textarea className="form-textarea" name="description" value={editFormData.description} onChange={handleEditChange} />
                  <div className="admin-product-actions">
                    <button onClick={() => saveEdit(p.id)} className="action-btn btn-edit">{language === 'pt' ? 'Salvar' : 'Save'}</button>
                    <button onClick={cancelEdit} className="action-btn btn-delete" style={{ background:'#757575', backgroundImage:'none' }}>{language === 'pt' ? 'Cancelar' : 'Cancel'}</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ color: '#d32f2f' }}>{p.name}</h3>
                  <p style={{ color:'#ccc' }}>{p.description}</p>
                  <p style={{ color:'#fff', fontWeight:'bold' }}>{p.price != null ? `$${p.price.toFixed(2)}` : 'N/A'}</p>
                  <div className="admin-product-actions">
                    <button onClick={() => startEdit(p)} className="action-btn btn-edit">{language === 'pt' ? 'Editar' : 'Edit'}</button>
                    <button onClick={() => deleteProductHandler(p.id)} className="action-btn btn-delete">{language === 'pt' ? 'Excluir' : 'Delete'}</button>
                    <button onClick={() => toggleStock(p.id, p.in_stock)} className="action-btn btn-toggle">{p.in_stock ? (language === 'pt' ? 'Desativar' : 'Disable') : (language === 'pt' ? 'Ativar' : 'Enable')}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3 className="empty-state-title">{language === 'pt' ? 'Nenhum produto encontrado' : 'No products found'}</h3>
          <p className="empty-state-description">{language === 'pt' ? 'Adicione seu primeiro produto.' : 'Add your first product.'}</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
