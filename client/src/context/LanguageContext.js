import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export { LanguageContext };

export const translations = {
  pt: {
    // Header
    customerService: 'Central de Atendimento',
    about: 'Sobre',
    ourLocation: 'Nossa Localização',
    freeShipping: '🚚 Frete Grátis para Todo Brasil',
    admin: 'Admin',
    allCategories: '📋 Todas as Categorias',
    manualTools: 'Ferramentas Manuais',
    electricMachines: 'Máquinas Elétricas',
    cargoMovement: 'Movimentação de Carga',
    civilConstruction: 'Construção Civil',
    gardenAgriculture: 'Jardim & Agricultura',
    
    // Products
    ourProducts: 'Nossos Produtos',
    specialOffers: 'Ofertas Especiais',
    products: 'Produtos',
    productsOnSale: 'Produtos em Promoção',
    orderBy: 'Ordenar por',
    relevance: 'Relevância',
    lowestPrice: 'Menor Preço',
    highestPrice: 'Maior Preço',
    biggestDiscount: 'Maior Desconto',
    nameAZ: 'Nome A-Z',
    rating: 'Avaliação',
    loadingProducts: 'Carregando produtos...',
    contact: 'Entrar em Contato',
    viewDetails: 'Ver Detalhes',
    noProductsFound: 'Nenhum produto encontrado para {name}',
    
    // Footer
    companyDescription: 'Sua loja especializada em ferramentas e equipamentos de qualidade.',
    customerServiceTitle: 'Atendimento',
    // Updated opening times: Mon–Sat 7:00–17:00, Sunday 7:00–12:00
    mondayFriday: 'Segunda a Sábado: 7h às 17h',
    saturday: 'Domingo: 7h às 12h',
    location: 'Localização',
    allRightsReserved: 'Todos os direitos reservados.'
  },
  en: {
    // Header
    customerService: 'Customer Service',
    about: 'About',
    ourLocation: 'Our Location',
    freeShipping: '�� Free Shipping Nationwide',
    admin: 'Admin',
    allCategories: '📋 All Categories',
    manualTools: 'Manual Tools',
    electricMachines: 'Electric Machines',
    cargoMovement: 'Cargo Movement',
    civilConstruction: 'Civil Construction',
    gardenAgriculture: 'Garden & Agriculture',
    
    // Products
    ourProducts: 'Our Products',
    specialOffers: 'Special Offers',
    products: 'Products',
    productsOnSale: 'Products on Sale',
    orderBy: 'Order by',
    relevance: 'Relevance',
    lowestPrice: 'Lowest Price',
    highestPrice: 'Highest Price',
    biggestDiscount: 'Biggest Discount',
    nameAZ: 'Name A-Z',
    rating: 'Rating',
    loadingProducts: 'Loading products...',
    contact: 'Contact Us',
    viewDetails: 'View Details',
    noProductsFound: 'No products found for {name}',
    
    // Footer
    companyDescription: 'Your specialized store for quality tools and equipment.',
    customerServiceTitle: 'Customer Service',
    // Updated opening times: Mon–Sat 7:00–17:00, Sunday 7:00–12:00
    mondayFriday: 'Mon–Sat: 7am to 5pm',
    saturday: 'Sunday: 7am to 12pm',
    allRightsReserved: 'All rights reserved.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const t = (key, params) => {
    let str = translations[language][key] || key;
    if (params && typeof str === 'string') {
      Object.keys(params).forEach(k => {
        const re = new RegExp(`\\{${k}\\}`, 'g');
        str = str.replace(re, params[k]);
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
