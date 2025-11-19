import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCategories } from '../services/categoryService';
import { getProductById } from '../services/productService';
import ImageGallery from '../components/Product/ImageGallery';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await getProductById(id);
        if (response.success) {
          setProduct(response.data);
        } else {
          // If fetch failed, set error but keep loading state
          setFetchError(response.message || 'Failed to load product');
          console.error('Failed to load product:', response);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setFetchError(error.message || 'Error loading product');
      } finally {
        // Only set loading to false after fetch completes (success or failure)
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    // load available categories
    (async () => {
      const res = await getCategories();
      if (res.success) setCategories(res.data || []);
    })();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="loading-spinner"></div>
          <p>{language === 'pt' ? 'Carregando produto...' : 'Loading product...'}</p>
        </div>
      </div>
    );
  }

  // Show error if fetch failed
  if (fetchError) {
    return (
      <div className="container">
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="empty-icon">⚠️</div>
          <h3>{language === 'pt' ? 'Erro ao carregar produto' : 'Error loading product'}</h3>
          <p>{fetchError}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            {language === 'pt' ? 'Tentar novamente' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  // Only show "not found" if fetch completed successfully but no product was returned
  if (!product) {
    return (
      <div className="container">
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="empty-icon">🔧</div>
          <h3>{language === 'pt' ? 'Produto não encontrado' : 'Product not found'}</h3>
          <p>{language === 'pt' ? 'O produto que você está procurando não existe.' : 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  // Compute category only after product is loaded
  const category = product?.category 
    ? categories.find(cat => cat && String(cat.id) === String(product.category))
    : null;

  // Get all images for the product
  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product?.image_url || product?.image
      ? [product.image_url || product.image]
      : [];

  const hasMultipleImages = productImages.length > 1;

  const handleImageClick = () => {
    if (productImages.length > 0) {
      setIsGalleryOpen(true);
    }
  };

  return (
    <div className="container">
      <div className="product-detail-container">
        <div className="product-detail-image" style={{ position: 'relative' }}>
          <img 
            src={productImages[0] || '/placeholder-product.jpg'} 
            alt={product?.name} 
            onError={e => { e.target.src = '/placeholder-product.jpg'; }}
            onClick={handleImageClick}
            style={{ cursor: productImages.length > 0 ? 'pointer' : 'default' }}
          />
          {hasMultipleImages && (
            <div 
              className="multiple-images-indicator"
              onClick={handleImageClick}
            >
              <span>📷</span>
              <span>{productImages.length} {language === 'pt' ? 'imagens' : 'images'}</span>
            </div>
          )}
        </div>
        <div className="product-detail-info-grid">
  <div className="info-row">
    <b>{language === 'pt' ? 'Marca:' : 'Brand:'}</b>
    <span>{product.brand || '-'}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Categoria:' : 'Category:'}</b>
    <span>{category?.name || (product?.category ? String(product.category) : '-')}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Nome:' : 'Name:'}</b>
    <span>{product?.name || '-'}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Preço:' : 'Price:'}</b>
    <span>$ {product?.price != null ? product.price : '0.00'}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Descrição:' : 'Description:'}</b>
    <span>{product?.description ? product?.description : "Empty"}</span>
  </div>
</div>


      </div>
      
      <ImageGallery
        images={productImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={0}
      />
    </div>
  );
};

export default ProductDetail;
