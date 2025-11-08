import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getProducts, deleteProduct } from '../../services/productService';
import EditProductModal from './EditProductModal';
import './ProductList.css';

const ProductList = ({ onStatsUpdate }) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Clear cache to force fresh fetch
      const response = await getProducts(false); // Bypass cache for admin panel
      console.log('ProductList - getProducts response:', response);
      
      if (response.success) {
        console.log(`ProductList - Loaded ${response.data?.length || 0} products`);
        setProducts(response.data || []);
      } else {
        console.error('ProductList - Failed to load products:', response.message);
        setMessage({ 
          type: 'error', 
          text: response.message || (language === 'pt' ? 'Erro ao carregar produtos' : 'Error loading products') 
        });
        setProducts([]);
      }
    } catch (e) {
      console.error('Error loading products', e);
      setMessage({ 
        type: 'error', 
        text: language === 'pt' ? 'Erro ao carregar produtos' : 'Error loading products' 
      });
      setProducts([]);
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

  const startEdit = (product) => {
    setEditingProduct(product);
  };

  const closeEdit = () => {
    setEditingProduct(null);
  };

  const handleUpdate = () => {
    loadProducts();
    if (onStatsUpdate) onStatsUpdate();
    setMessage({ type: 'success', text: language === 'pt' ? 'Produto atualizado!' : 'Product updated!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
              <h3 style={{ color: '#d32f2f' }}>{p.name}</h3>
              <p style={{ color:'#ccc' }}>{p.description}</p>
              <p style={{ color:'#fff', fontWeight:'bold' }}>{p.price != null ? `$${p.price.toFixed(2)}` : 'N/A'}</p>
              <div className="admin-product-actions">
                <button onClick={() => startEdit(p)} className="action-btn btn-edit">{language === 'pt' ? 'Editar' : 'Edit'}</button>
                <button onClick={() => deleteProductHandler(p.id)} className="action-btn btn-delete">{language === 'pt' ? 'Excluir' : 'Delete'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={closeEdit}
          onUpdate={handleUpdate}
        />
      )}

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
