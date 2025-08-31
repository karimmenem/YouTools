import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { getProducts, getCategories } from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import './Home.css'; // Reuse the same styles

const Products = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { t } = useLanguage();

  // Get category from URL path
  const getCurrentCategory = () => {
    const path = location.pathname.replace('/', '');
    return path === 'produtos' ? null : path;
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update products when path or products change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const category = getCurrentCategory();
    if (category && allProducts.length > 0) {
      filterProductsByCategory(category);
    } else if (allProducts.length > 0) {
      setProducts(allProducts);
    }
  }, [location.pathname, allProducts]);

  const loadData = async () => {
    try {
      // Load products and categories
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

  const filterProductsByCategory = (categorySlug) => {
    const filtered = allProducts.filter(product => product.category === categorySlug);
    setProducts(filtered);
    
    // Find category name for display
    const categoryData = categories.find(cat => cat.slug === categorySlug);
  };

  const getCategoryTitle = () => {
    const category = getCurrentCategory();
    
    if (!category) {
      return t('allProducts') || 'Todos os Produtos';
    }
    
    const categoryNames = {
      'ferramentas-manuais': t('manualTools') || 'Ferramentas Manuais',
      'maquinas-eletricas': t('electricMachines') || 'Máquinas Elétricas',
      'movimentacao-carga': t('cargoMovement') || 'Movimentação de Carga',
      'construcao-civil': t('civilConstruction') || 'Construção Civil',
      'jardim-agricultura': t('gardenAgriculture') || 'Jardim e Agricultura'
    };
    
    return categoryNames[category] || category;
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

  const category = getCurrentCategory();

  return (
    <div className="home">
      <div className="container">
        <div className="home-header">
          <h1 className="page-title">{getCategoryTitle()}</h1>
          <p className="page-subtitle">
            {category 
              ? `Produtos profissionais da categoria ${getCategoryTitle().toLowerCase()}`
              : 'Explore toda nossa linha de ferramentas e equipamentos profissionais'
            }
          </p>
        </div>

        <div className="products-grid products-grid-compact">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h3>
              {category 
                ? `Nenhum produto encontrado na categoria ${getCategoryTitle()}`
                : 'Nenhum produto disponível no momento'
              }
            </h3>
            <p>
              {category 
                ? 'Estamos trabalhando para adicionar mais produtos nesta categoria.'
                : 'Verifique novamente em breve!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
