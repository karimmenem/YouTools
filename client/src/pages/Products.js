import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { getProducts, getCategories } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import './Home.css'; // Reuse the same styles

const Products = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { categoryId } = useParams(); // ✅ get category from URL (e.g., /4)
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const filterProductsByCategory = useCallback((categoryId) => {
    const filtered = allProducts.filter(
      (product) => String(product.category) === String(categoryId)
    );
    setProducts(filtered);
  }, [allProducts]);

  useEffect(() => {
    if (categoryId && allProducts.length > 0) {
      filterProductsByCategory(categoryId);
    } else if (allProducts.length > 0) {
      setProducts(allProducts);
    }
  }, [categoryId, allProducts, filterProductsByCategory]);

  const loadData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      if (productsResponse.success) {
        setAllProducts(productsResponse.data);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryObject = () => {
    if (!categoryId) return null;
    return categories.find((cat) => String(cat.id) === String(categoryId));
  };

  const getCategoryTitle = () => {
    const categoryObj = getCategoryObject();
    if (categoryObj) return categoryObj.name;
    return t('allProducts') || 'Todos os Produtos';
  };

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <div className="home-header">
          <h1 className="page-title" style={{ marginLeft: '50px' }}>
            {getCategoryTitle()}
          </h1>
          
        </div>

        <div className="products-grid products-grid-compact">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="empty-state" style={{
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}}>
            <div className="empty-icon" >🔧</div>
            <h3>
              {categoryId
                ? `Nenhum produto encontrado na categoria ${getCategoryTitle()}`
                : 'Nenhum produto disponível no momento'}
            </h3>
            <p>
              {categoryId
                ? 'Estamos trabalhando para adicionar mais produtos nesta categoria.'
                : 'Verifique novamente em breve!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
