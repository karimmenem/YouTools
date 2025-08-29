import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export { LanguageContext };

export const translations = {
  pt: {
    // Header
    customerService: 'Central de Atendimento',
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
    
    // Footer
    companyDescription: 'Sua loja especializada em ferramentas e equipamentos de qualidade.',
    customerServiceTitle: 'Atendimento',
    mondayFriday: 'Segunda a Sexta: 8h às 18h',
    saturday: 'Sábado: 8h às 12h',
    allRightsReserved: 'Todos os direitos reservados.'
  },
  en: {
    // Header
    customerService: 'Customer Service',
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
    
    // Footer
    companyDescription: 'Your specialized store for quality tools and equipment.',
    customerServiceTitle: 'Customer Service',
    mondayFriday: 'Monday to Friday: 8am to 6pm',
    saturday: 'Saturday: 8am to 12pm',
    allRightsReserved: 'All rights reserved.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const t = (key) => {
    return translations[language][key] || key;
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
