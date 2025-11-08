import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ImageGallery.css';

const ImageGallery = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    if (!isOpen || !images || images.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, images, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-gallery-modal" onClick={handleBackdropClick}>
      <div className="image-gallery-container">
        <button 
          className="image-gallery-close" 
          onClick={onClose}
          aria-label={language === 'pt' ? 'Fechar' : 'Close'}
        >
          ×
        </button>

        {images.length > 1 && (
          <>
            <button 
              className="image-gallery-nav image-gallery-prev" 
              onClick={goToPrevious}
              aria-label={language === 'pt' ? 'Imagem anterior' : 'Previous image'}
            >
              ‹
            </button>
            <button 
              className="image-gallery-nav image-gallery-next" 
              onClick={goToNext}
              aria-label={language === 'pt' ? 'Próxima imagem' : 'Next image'}
            >
              ›
            </button>
          </>
        )}

        <div 
          className="image-gallery-content"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="image-gallery-slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="image-gallery-slide">
                <img 
                  src={image || '/placeholder-product.jpg'} 
                  alt={`${language === 'pt' ? 'Imagem do produto' : 'Product image'} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <div className="image-gallery-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`image-gallery-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
                aria-label={language === 'pt' ? `Ir para imagem ${index + 1}` : `Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="image-gallery-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;

