import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './About.css';


const About = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.body.classList.add('page-about');
    return () => document.body.classList.remove('page-about');
  }, []);

  return (
    <div className="about-page container" style={{marginTop: '220px'}}>
      <div className="about-content">
        <div className="youtools-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}>
              <div className="logo-main">
                <span className="you-text">YOU</span>
                <span className="tools-text">TOOLS</span>
              </div>
              <div className="logo-subtitle">FERRAMIENTAS</div>
            </div>
        <p className="company-desc">{t('companyDescription')}</p>

        <div className="info-columns">
          <div className="info-block">
            <h4>{t('customerServiceTitle')}</h4>
            <p>{t('mondayFriday')}</p>
            <p>{t('saturday')}</p>
          </div>

          <div className="info-block">
            <h4>{t('contact')}</h4>
            <p>you_tools@hotmail.com</p>
            <p><a href="tel:+5545999404004">+55 45 99994-04004</a></p>
            <p><a href="tel:+5567981980980">+55 67 98198-0980</a></p>
            <p><a href="tel:+595986658616">+595 986 658 616</a></p>
            <p><a href="tel:+595983730590">+595 983 730 590</a></p>
          </div>

          <div className="info-block">
            <h4>{t('location') || 'Location'}</h4>
            <p>Paraguai — Salto del Guaíra</p>
         
          </div>
        </div>

        <div className="map-section">
          <h4>{t('ourLocation') || 'Our Location'}</h4>

          <div className="map-wrapper contact-area-map">
            <iframe
              src="https://www.google.com/maps?q=-24.059061,-54.307156&output=embed"
              height="550"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
