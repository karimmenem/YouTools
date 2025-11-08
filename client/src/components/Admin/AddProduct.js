import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { addProduct } from '../../services/productService';
import { getBrands } from '../../services/brandService';
import { getCategories } from '../../services/categoryService';
import './AddProduct.css';

const AddProduct = ({ onProductAdded }) => {
  const { language } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    image_url: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load available brands
    (async () => {
      const res = await getBrands();
      if (res.success) setBrands(res.data);
    })();
    // load available categories
    (async () => {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - imagePreviews.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Máximo de 5 imagens permitidas' : 'Maximum 5 images allowed'
      });
      return;
    }
    
    if (files.length > remainingSlots) {
      setMessage({
        type: 'error',
        text: language === 'pt' 
          ? `Apenas ${remainingSlots} imagem(ns) adicionada(s). Máximo de 5 imagens permitidas.`
          : `Only ${remainingSlots} image(s) added. Maximum 5 images allowed.`
      });
    }
    
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target.result]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price || !formData.category) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Build images array: uploaded files take precedence, then image_url if provided
      let images = [];
      if (imagePreviews.length > 0) {
        images = imagePreviews;
      } else if (formData.image_url) {
        images = [formData.image_url];
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        brand: formData.brand,
        category: formData.category,
        images: images.length > 0 ? images : undefined,
        image_url: images.length > 0 ? images[0] : formData.image_url || undefined
      };

      const response = await addProduct(productData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Produto adicionado!' : 'Product added!'
        });
        
        // Reset form
        setFormData({
          name: '',
          price: '',
          brand: '',
          category: '',
          image_url: ''
        });
        setImageFiles([]);
        setImagePreviews([]);
        
        if (onProductAdded) onProductAdded();
      } else {
        setMessage({
          type: 'error',
          text: response.message || (language === 'pt' ? 'Erro ao adicionar' : 'Error adding product')
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Erro de conexão' : 'Connection error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product">
      <div className="add-product-header">
        <h2>{language === 'pt' ? 'Adicionar Produto' : 'Add Product'}</h2>
        <p className="add-product-subtitle">{language === 'pt' ? 'Cadastre novos itens no catálogo' : 'Register new catalog items'}</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="product-form" noValidate>
        <div className="form-section">
          <h3 className="section-title">{language === 'pt' ? 'Detalhes' : 'Details'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">{language === 'pt' ? 'Marca' : 'Brand'}</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="form-select" required disabled={loading}>
                <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
                {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">{language === 'pt' ? 'Nome do Produto' : 'Product Name'}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required disabled={loading} placeholder={language === 'pt' ? 'Ex: Furadeira' : 'e.g. Drill'} />
            </div>
            <div className="form-group">
              <label className="form-label required">{language === 'pt' ? 'Preço' : 'Price'} ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" step="0.01" min="0" required disabled={loading} placeholder="0.00" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">{language === 'pt' ? 'Categoria' : 'Category'}</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select" required disabled={loading}>
              <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{language === 'pt' ? 'URL da Imagem (opcional)' : 'Image URL (optional)'}</label>
            <input 
              type="text" 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="https://..." 
              disabled={imagePreviews.length > 0 || loading} 
            />
            {imagePreviews.length > 0 && (
              <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                {language === 'pt' ? 'URL desabilitada quando há uploads de imagens' : 'URL disabled when images are uploaded'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'pt' ? 'Upload de Imagens' : 'Upload Images'} 
              <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '8px' }}>
                ({language === 'pt' ? 'Máximo 5' : 'Max 5'})
              </span>
            </label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              disabled={loading || imagePreviews.length >= 5} 
              className="form-input upload-image" 
            />
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '12px' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview" style={{ position: 'relative' }}>
                    <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      className="remove-image-btn" 
                      onClick={() => removeImage(index)}
                      style={{ position: 'absolute', top: '4px', right: '4px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length >= 5 && (
              <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                {language === 'pt' ? 'Limite máximo de 5 imagens atingido' : 'Maximum limit of 5 images reached'}
              </p>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="button-spinner" /> {language === 'pt' ? 'Salvando...' : 'Saving...'}
              </>
            ) : (language === 'pt' ? 'Adicionar Produto' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
