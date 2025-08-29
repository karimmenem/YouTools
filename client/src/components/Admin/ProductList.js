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
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProductHandler = async (productId) => {
    if (!window.confirm(language === 'pt' ? 'Tem certeza que deseja excluir este produto?' : 'Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Produto excluído com sucesso!' : 'Product deleted successfully!'
        });
        loadProducts();
        if (onStatsUpdate) onStatsUpdate();
      } else {
        setMessage({
          type: 'error',
          text: response.message || (language === 'pt' ? 'Erro ao excluir produto' : 'Error deleting product')
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Erro de conexão' : 'Connection error'
      });
    }
  };

  const toggleStock = async (productId, currentStock) => {
    try {
      const response = await updateProduct(productId, {
        in_stock: !currentStock
      });

      if (response.success) {
        loadProducts();
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Status do estoque atualizado!' : 'Stock status updated!'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Erro ao atualizar estoque' : 'Error updating stock'
      });
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price || '',
      code: product.code || '',
      badge: product.badge || '',
      in_stock: product.in_stock
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({});
  };

  const saveEdit = async (productId) => {
    try {
      const response = await updateProduct(productId, {
        ...editFormData,
        price: parseFloat(editFormData.price),
        original_price: editFormData.original_price ? parseFloat(editFormData.original_price) : null
      });

      if (response.success) {
        loadProducts();
        setEditingProduct(null);
        setEditFormData({});
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Produto atualizado com sucesso!' : 'Product updated successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: response.message || (language === 'pt' ? 'Erro ao atualizar produto' : 'Error updating product')
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Erro de conexão' : 'Connection error'
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) {
    return (
      <div className="loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#fff'
      }}>
        {language === 'pt' ? 'Carregando produtos...' : 'Loading products...'}
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h2 className="product-list-title">{language === 'pt' ? 'Gerenciar Produtos' : 'Manage Products'}</h2>
        <p style={{ color: '#ccc', fontSize: '14px', marginTop: '8px' }}>
          {language === 'pt' ? `Total: ${products.length} produtos` : `Total: ${products.length} products`}
        </p>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`} style={{
          margin: '20px 30px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          color: message.type === 'success' ? '#4caf50' : '#f44336'
        }}>
          {message.text}
        </div>
      )}

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="admin-product-card">
            <div className="admin-product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div style={{ color: '#666', fontSize: '48px' }}>📦</div>
              )}
            </div>
            
            {editingProduct === product.id ? (
              <div className="admin-product-info">
                <div className="edit-form" style={{
                  background: 'linear-gradient(145deg, #1e1e1e 0%, #0d0d0d 100%)',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '2px solid rgba(211, 47, 47, 0.3)'
                }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>
                    {language === 'pt' ? 'Editar Produto' : 'Edit Product'}
                  </h4>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                      {language === 'pt' ? 'Nome' : 'Name'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid rgba(211, 47, 47, 0.3)',
                        borderRadius: '4px',
                        background: '#2a2a2a',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                      {language === 'pt' ? 'Preço' : 'Price'}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid rgba(211, 47, 47, 0.3)',
                        borderRadius: '4px',
                        background: '#2a2a2a',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div className="edit-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button onClick={() => saveEdit(product.id)} className="action-btn btn-edit">
                      {language === 'pt' ? 'Salvar' : 'Save'}
                    </button>
                    <button onClick={cancelEdit} className="action-btn" style={{
                      background: 'linear-gradient(145deg, #666666 0%, #444444 100%)',
                      color: '#ffffff'
                    }}>
                      {language === 'pt' ? 'Cancelar' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-product-info">
                <h3 className="admin-product-title">{product.name}</h3>
                
                <div className="admin-product-price">
                  R$ {parseFloat(product.price).toFixed(2)}
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#999', 
                      textDecoration: 'line-through',
                      marginLeft: '8px'
                    }}>
                      R$ {parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="admin-product-stock">
                  <div className={`stock-indicator ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}></div>
                  <span className="stock-text">
                    {product.in_stock 
                      ? (language === 'pt' ? 'Em estoque' : 'In stock')
                      : (language === 'pt' ? 'Fora de estoque' : 'Out of stock')
                    }
                  </span>
                </div>

                <div className="admin-product-actions">
                  <button
                    onClick={() => startEdit(product)}
                    className="action-btn btn-edit"
                    title={language === 'pt' ? 'Editar produto' : 'Edit product'}
                  >
                    {language === 'pt' ? 'Editar' : 'Edit'}
                  </button>
                  <button
                    onClick={() => toggleStock(product.id, product.in_stock)}
                    className="action-btn btn-toggle"
                    title={language === 'pt' ? 'Alternar estoque' : 'Toggle stock'}
                  >
                    {product.in_stock ? (language === 'pt' ? 'Desativar' : 'Disable') : (language === 'pt' ? 'Ativar' : 'Enable')}
                  </button>
                  <button
                    onClick={() => deleteProductHandler(product.id)}
                    className="action-btn btn-delete"
                    title={language === 'pt' ? 'Excluir produto' : 'Delete product'}
                  >
                    {language === 'pt' ? 'Excluir' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3 className="empty-state-title">
            {language === 'pt' ? 'Nenhum produto encontrado' : 'No products found'}
          </h3>
          <p className="empty-state-description">
            {language === 'pt' 
              ? 'Adicione seu primeiro produto para começar a gerenciar seu catálogo.'
              : 'Add your first product to start managing your catalog.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
