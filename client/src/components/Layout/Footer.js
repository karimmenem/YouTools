import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>YouTools</h4>
            <p>{t('companyDescription')}</p>
              <p>Paraguai — Salto del Guaíra</p>

          </div>
          <div className="footer-section">
            <h4>{t('customerServiceTitle')}</h4>
            <p>{t('mondayFriday')}</p>
            <p>{t('saturday')}</p>
          </div>
          <div className="footer-section">
            <h4>{t('contact')}</h4>
            <p>you_tools@hotmail.com</p>
            <p>+55 45 99994-04004</p>
            <p>+55 67 98198-0980</p>
            <p>+595 986 658 616</p>
            <p>+595 983 730 590</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 YouTools. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
