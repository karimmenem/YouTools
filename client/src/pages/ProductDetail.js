import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="container">
      <h1>Detalhes do Produto {id}</h1>
      <p>Esta página será implementada em breve.</p>
    </div>
  );
};

export default ProductDetail;
