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
            <a
              href="https://www.google.com/maps/place/24%C2%B003'32.6%22S+54%C2%B018'25.8%22W/@-24.059061,-54.3097309,796m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d-24.059061!4d-54.307156?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              Paraguai — Salto del Guaíra
            </a>



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
          <div className="footer-bottom-inner" style={{display: 'flex',justifyContent: 'center' ,textAlign: 'center', width: '100%' }}>
            <p>&copy; 2025 YouTools. {t('allRightsReserved')}</p>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
