import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getBrands } from "../../services/brandService";
import { FiPhone, FiGlobe, FiUser } from "react-icons/fi";
import { BiUser } from "react-icons/bi";
import { useLanguage } from "../../context/LanguageContext";
import "./Header.css";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    // load dynamic brands
    (async () => {
      const res = await getBrands();
      if (res.success) setBrands(res.data);
    })();
  }, []);

  return (
    <header className="header">
      {/* Top bar with contact info */}

      {/* Main header */}
      <div className="header-main">
        {/* Logo */}
        <div>
          <Link to="/" className="logo">
            <div className="youtools-logo">
              <div className="logo-main">
                <span className="you-text">YOU</span>
                <span className="tools-text">TOOLS</span>
              </div>
              <div className="logo-subtitle">HERRAMIENTAS</div>
            </div>
          </Link>
        </div>
        <div className="lang-admin-container">
          <div className="top-right">
            <button className="language-toggle" onClick={toggleLanguage}>
              <FiGlobe className="icon" />
              <span>{language === "pt" ? "EN" : "PT"}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {!isAdminPage && (
              <Link to="/admin" className="action-btn admin-btn">
                <BiUser className="icon" />
                <span className="admin-text">{t("admin")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - only show on customer pages */}
      {!isAdminPage && (
        <nav className="navigation">
          <div className="container">
            <div className="nav-menu">
              {/* Home link */}
              <Link
                end
                to="/"
                className={`nav-item ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                {language === "pt" ? "Início" : "Home"}
              </Link>
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  to={`/${b.slug}`}
                  className={`nav-item ${
                    location.pathname.startsWith(`/${b.slug}`) ? "active" : ""
                  }`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
