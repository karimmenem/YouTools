import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { updateProduct } from '../../services/productService';
import { getBrands } from '../../services/brandService';
import { getCategories } from '../../services/categoryService';
import './EditProductModal.css';

const EditProductModal = ({ product, isOpen, onClose, onUpdate }) => {
  const { language } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    description: ''
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      // Load brands and categories
      (async () => {
        const [brandsRes, categoriesRes] = await Promise.all([
          getBrands(),
          getCategories()
        ]);
        if (brandsRes.success) setBrands(brandsRes.data || []);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
      })();

      // Populate form with product data
      const images = product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image_url || product.image
          ? [product.image_url || product.image]
          : [];

      setFormData({
        name: product.name || '',
        price: product.price != null ? product.price : '',
        brand: product.brand || '',
        category: product.category != null ? String(product.category) : '',
        description: product.description || ''
      });
      setImagePreviews(images);
      setImageFiles([]);
      setMessage({ type: '', text: '' });
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price || !formData.category) {
      setMessage({
        type: 'error',
        text: language === 'pt' ? 'Por favor, preencha todos os campos obrigatórios' : 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Build images array: uploaded files take precedence, then existing images
      let images = [];
      if (imagePreviews.length > 0) {
        images = imagePreviews;
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        brand: formData.brand,
        category: formData.category,
        description: formData.description || '',
        images: images.length > 0 ? images : undefined
      };

      const response = await updateProduct(product.id, productData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: language === 'pt' ? 'Produto atualizado!' : 'Product updated!'
        });
        
        setTimeout(() => {
          onUpdate && onUpdate();
          onClose();
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: response.message || (language === 'pt' ? 'Erro ao atualizar' : 'Error updating product')
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

  if (!isOpen || !product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="edit-product-modal" onClick={handleBackdropClick}>
      <div className="edit-product-modal-content">
        <button 
          className="edit-product-modal-close" 
          onClick={onClose}
          aria-label={language === 'pt' ? 'Fechar' : 'Close'}
        >
          ×
        </button>

        <div className="edit-product-modal-header">
          <h2>{language === 'pt' ? 'Editar Produto' : 'Edit Product'}</h2>
        </div>

        {message.text && (
          <div className={`edit-product-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-group">
            <label className="form-label required">
              {language === 'pt' ? 'Nome do Produto' : 'Product Name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">
                {language === 'pt' ? 'Preço' : 'Price'}
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                {language === 'pt' ? 'Marca' : 'Brand'}
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">{language === 'pt' ? 'Selecione a marca' : 'Select brand'}</option>
                {brands.map(b => (
                  <option key={b.id} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">
                {language === 'pt' ? 'Categoria' : 'Category'}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">{language === 'pt' ? 'Selecione a categoria' : 'Select category'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'pt' ? 'Descrição' : 'Description'}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'pt' ? 'Imagens (máximo 5)' : 'Images (maximum 5)'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="file-input"
              id="edit-product-images"
              disabled={imagePreviews.length >= 5}
            />
            <label htmlFor="edit-product-images" className="file-input-label">
              <span className="file-input-text">
                {language === 'pt' ? 'Clique para adicionar imagens' : 'Click to add images'}
              </span>
              <span className="file-input-hint">
                {language === 'pt' 
                  ? `${imagePreviews.length}/5 imagens adicionadas`
                  : `${imagePreviews.length}/5 images added`}
              </span>
            </label>

            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-wrapper">
                    <img src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                      aria-label={language === 'pt' ? 'Remover imagem' : 'Remove image'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  {language === 'pt' ? 'Salvando...' : 'Saving...'}
                </>
              ) : (
                language === 'pt' ? 'Salvar' : 'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;

