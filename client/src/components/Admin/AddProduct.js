import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { addProduct, getCategories } from '../../services/productService';

const AddProduct = ({ onProductAdded }) => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    code: '',
    category: '',
    in_stock: true,
    badge: '',
    image_url: '',
    is_special_offer: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear original price if not special offer
    if (name === 'is_special_offer' && !checked) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        original_price: ''
      }));
    }

    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Find category info
      const selectedCategory = categories.find(cat => cat.slug === formData.category);
      
      let imageUrl = formData.image_url;
      
      // If user uploaded a file, convert to base64 for localStorage
      if (imageFile) {
        imageUrl = imagePreview; // Use the base64 data URL
      }

      const productData = {
        ...formData,
        category_name: selectedCategory ? selectedCategory.name : formData.category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: imageUrl
      };

      const response = await addProduct(productData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Produto adicionado com sucesso!' : 'Product added successfully!'
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          original_price: '',
          code: '',
          category: '',
          in_stock: true,
          badge: '',
          image_url: '',
          is_special_offer: false
        });
        setImageFile(null);
        setImagePreview('');
        
        if (onProductAdded) onProductAdded();
      } else {
        setMessage({
          type: 'error',
          text: response.message || (language === 'pt' ? 'Erro ao adicionar produto' : 'Error adding product')
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Erro de conexão' : 'Connection error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '24px' }}>
        {language === 'pt' ? 'Adicionar Produto' : 'Add Product'}
      </h2>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
          color: message.type === 'success' ? '#4caf50' : '#f44336'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Product Name */}
        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
            {language === 'pt' ? 'Nome do Produto *' : 'Product Name *'}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(211, 47, 47, 0.3)',
              backgroundColor: '#2a2a2a',
              color: '#fff',
              fontSize: '16px'
            }}
            placeholder={language === 'pt' ? 'Digite o nome do produto' : 'Enter product name'}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
            {language === 'pt' ? 'Descrição *' : 'Description *'}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(211, 47, 47, 0.3)',
              backgroundColor: '#2a2a2a',
              color: '#fff',
              fontSize: '16px',
              resize: 'vertical'
            }}
            placeholder={language === 'pt' ? 'Descreva o produto' : 'Describe the product'}
          />
        </div>

        {/* Special Offer Toggle */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(211, 47, 47, 0.1)', 
          border: '2px solid rgba(211, 47, 47, 0.3)', 
          borderRadius: '8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              name="is_special_offer"
              checked={formData.is_special_offer}
              onChange={handleChange}
              disabled={loading}
              style={{ transform: 'scale(1.2)' }}
            />
            <label style={{ color: '#fff', fontWeight: 'bold' }}>
              {language === 'pt' ? '🏷️ Este produto está em OFERTA ESPECIAL' : '🏷️ This product is a SPECIAL OFFER'}
            </label>
          </div>
          <p style={{ color: '#ccc', fontSize: '14px', margin: 0 }}>
            {language === 'pt' 
              ? 'Produtos em oferta especial aparecem na página inicial e podem ter preço original.' 
              : 'Special offer products appear on the homepage and can have an original price.'
            }
          </p>
        </div>

        {/* Price and Original Price */}
        <div style={{ display: 'grid', gridTemplateColumns: formData.is_special_offer ? '1fr 1fr' : '1fr', gap: '16px' }}>
          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              {formData.is_special_offer 
                ? (language === 'pt' ? 'Preço Promocional *' : 'Sale Price *')
                : (language === 'pt' ? 'Preço *' : 'Price *')
              } (R$)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(211, 47, 47, 0.3)',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
              placeholder="0.00"
            />
          </div>

          {formData.is_special_offer && (
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                {language === 'pt' ? 'Preço Original' : 'Original Price'} (R$)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(211, 47, 47, 0.3)',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  fontSize: '16px'
                }}
                placeholder="0.00"
              />
              {formData.price && formData.original_price && formData.original_price > formData.price && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '4px',
                  color: '#4caf50',
                  fontSize: '14px'
                }}>
                  💰 {language === 'pt' ? 'Desconto: ' : 'Discount: '}
                  <strong>
                    {(((formData.original_price - formData.price) / formData.original_price) * 100).toFixed(0)}%
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code and Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              {language === 'pt' ? 'Código' : 'Code'}
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(211, 47, 47, 0.3)',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
              placeholder="123456"
            />
          </div>

          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              {language === 'pt' ? 'Categoria *' : 'Category *'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(211, 47, 47, 0.3)',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
            >
              <option value="">
                {language === 'pt' ? 'Selecione uma categoria' : 'Select a category'}
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
            {language === 'pt' ? 'Imagem do Produto' : 'Product Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(211, 47, 47, 0.3)',
              backgroundColor: '#2a2a2a',
              color: '#fff',
              fontSize: '16px'
            }}
          />
          {imagePreview && (
            <div style={{ marginTop: '12px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  border: '2px solid rgba(211, 47, 47, 0.3)'
                }} 
              />
            </div>
          )}
        </div>

        {/* Badge and Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              {language === 'pt' ? 'Badge/Selo' : 'Badge'}
            </label>
            <input
              type="text"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(211, 47, 47, 0.3)',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
              placeholder={language === 'pt' ? 'Ex: OFERTA, MAIS PAIR' : 'Ex: OFFER, BEST SELLER'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              name="in_stock"
              checked={formData.in_stock}
              onChange={handleChange}
              disabled={loading}
              style={{ transform: 'scale(1.2)' }}
            />
            <label style={{ color: '#fff' }}>
              {language === 'pt' ? 'Em estoque' : 'In stock'}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '16px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#666' : 'linear-gradient(145deg, #d32f2f 0%, #b71c1c 100%)',
            background: loading ? '#666' : 'linear-gradient(145deg, #d32f2f 0%, #b71c1c 100%)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '20px'
          }}
        >
          {loading 
            ? (language === 'pt' ? 'Adicionando...' : 'Adding...') 
            : (language === 'pt' ? 'Adicionar Produto' : 'Add Product')
          }
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
