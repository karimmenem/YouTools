import React from 'react';
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
          </div>
          <div className="footer-section">
            <h4>{t('customerServiceTitle')}</h4>
            <p>{t('mondayFriday')}</p>
            <p>{t('saturday')}</p>
          </div>
          <div className="footer-section">
            <h4>{t('contact')}</h4>
            <p>contato@youtools.com</p>
            <p>(11) 1234-5678</p>
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
