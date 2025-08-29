import productsData from '../data/products.json';

// Simple storage key for products
const PRODUCTS_STORAGE_KEY = 'youtools_products';

// Initialize products in localStorage if not exists
const initializeProducts = () => {
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsData));
    return productsData;
  }
  const products = JSON.parse(stored);
  // Ensure is_special_offer is properly converted to boolean
  const fixedProducts = products.map(product => ({
    ...product,
    is_special_offer: Boolean(product.is_special_offer)
  }));
  return fixedProducts;
};

// Get all products
export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = initializeProducts();
      resolve({
        success: true,
        data: products
      });
    }, 100); // Simulate API delay
  });
};

// Get product by ID
export const getProductById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = initializeProducts();
      const product = products.find(p => p.id === parseInt(id));
      resolve({
        success: !!product,
        data: product
      });
    }, 100);
  });
};

// Add new product
export const addProduct = (productData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = initializeProducts();
      const newId = Math.max(...products.map(p => p.id)) + 1;
      const newProduct = {
        ...productData,
        id: newId,
        price: parseFloat(productData.price),
        original_price: productData.original_price ? parseFloat(productData.original_price) : null,
        is_special_offer: Boolean(productData.is_special_offer)
      };
      
      products.push(newProduct);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      
      resolve({
        success: true,
        data: newProduct
      });
    }, 100);
  });
};

// Update product
export const updateProduct = (id, productData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = initializeProducts();
      const index = products.findIndex(p => p.id === parseInt(id));
      
      if (index === -1) {
        resolve({
          success: false,
          message: 'Product not found'
        });
        return;
      }
      
      products[index] = {
        ...products[index],
        ...productData,
        id: parseInt(id),
        price: parseFloat(productData.price),
        original_price: productData.original_price ? parseFloat(productData.original_price) : null,
        is_special_offer: Boolean(productData.is_special_offer)
      };
      
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      
      resolve({
        success: true,
        data: products[index]
      });
    }, 100);
  });
};

// Delete product
export const deleteProduct = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = initializeProducts();
      const index = products.findIndex(p => p.id === parseInt(id));
      
      if (index === -1) {
        resolve({
          success: false,
          message: 'Product not found'
        });
        return;
      }
      
      products.splice(index, 1);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      
      resolve({
        success: true,
        message: 'Product deleted successfully'
      });
    }, 100);
  });
};

// Get categories
export const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = [
        { id: 1, name: 'Ferramentas Manuais', slug: 'ferramentas-manuais' },
        { id: 2, name: 'Máquinas Elétricas', slug: 'maquinas-eletricas' },
        { id: 3, name: 'Movimentação de Carga', slug: 'movimentacao-carga' },
        { id: 4, name: 'Construção Civil', slug: 'construcao-civil' },
        { id: 5, name: 'Jardim e Agricultura', slug: 'jardim-agricultura' }
      ];
      
      resolve({
        success: true,
        data: categories
      });
    }, 100);
  });
};

// Force refresh products from JSON (clear localStorage and reload)
export const refreshProducts = () => {
  localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  return getProducts();
};
