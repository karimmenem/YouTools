import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { addProduct } from '../../services/productService';
import { getBrands } from '../../services/brandService';

const AddProduct = ({ onProductAdded }) => {
  const { language } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load available brands
    (async () => {
      const res = await getBrands();
      if (res.success) setBrands(res.data);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

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
      let imageUrl = formData.image_url;
      if (imageFile) imageUrl = imagePreview;
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        brand: formData.brand,
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
          price: '',
          brand: '',
          image_url: ''
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
        {/* Brand selection */}
        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
            {language === 'pt' ? 'Marca *' : 'Brand *'}
          </label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid rgba(211, 47, 47, 0.3)', backgroundColor: '#2a2a2a', color: '#fff', fontSize: '16px'
            }}
          >
            <option value="">{language === 'pt' ? 'Selecione a marca' : 'Select brand'}</option>
            {brands.map(b => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>

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

        {/* Price and Original Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              {language === 'pt' ? 'Preço *' : 'Price *'} (R$)
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
