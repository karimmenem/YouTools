import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { getCategories } from '../services/categoryService';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {

    // load available categories
    (async () => {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    })();

  }, []);

const category = categories.find(cat => String(cat.id) === String(product?.category));

  if (loading) return <div>Carregando...</div>;
  if (!product) return <div>Produto não encontrado.</div>;

  return (
    <div className="container">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <img src={product.image_url || product.image || '/placeholder-product.jpg'} alt={product.name} onError={e => { e.target.src = '/placeholder-product.jpg'; }} />
        </div>
        <div className="product-detail-info-grid">
  <div className="info-row">
    <b>{language === 'pt' ? 'Marca:' : 'Brand:'}</b>
    <span>{product.brand || '-'}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Categoria:' : 'Category:'}</b>
    <span>{category.name || (typeof product.category === 'string' ? product.category : '-')}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Nome:' : 'Name:'}</b>
    <span>{product.name}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Preço:' : 'Price:'}</b>
    <span>R$ {product.price}</span>
  </div>
  <div className="info-row">
    <b>{language === 'pt' ? 'Descrição:' : 'Description:'}</b>
    <span>{language === 'pt' ? 'Descrição do produto em breve.' : 'Product description coming soon.'}</span>
  </div>
</div>


      </div>
    </div>
  );
};

export default ProductDetail;
