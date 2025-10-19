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
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price || !formData.category) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        brand: formData.brand,
        category: formData.category,
        image_url: imageFile ? imagePreview : formData.image_url
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
        setImageFile(null);
        setImagePreview('');
        
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
              <label className="form-label required">{language === 'pt' ? 'Preço' : 'Price'} (R$)</label>
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
            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="form-input" placeholder="https://..." disabled={!!imageFile || loading} />
          </div>

          <div className="form-group">
            <label className="form-label">{language === 'pt' ? 'Upload de Imagem' : 'Upload Image'}</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="form-input upload-image" />
            {imagePreview && (
              <div className="image-preview" style={{ marginTop: '12px' }}>
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="remove-image-btn" onClick={() => { setImageFile(null); setImagePreview(''); }}>×</button>
              </div>
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
