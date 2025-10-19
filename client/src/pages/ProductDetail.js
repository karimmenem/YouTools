import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Carregando...</div>;
  if (!product) return <div>Produto não encontrado.</div>;

  return (
    <div className="container">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <img src={product.image_url || product.image || '/placeholder-product.jpg'} alt={product.name} onError={e => { e.target.src = '/placeholder-product.jpg'; }} />
        </div>
        <div className="product-detail-info">
          <div className="product-detail-brand">{product.brand}</div>
          <div className="product-detail-name">{product.name}</div>
          <div className="product-detail-price">R$ {product.price}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
