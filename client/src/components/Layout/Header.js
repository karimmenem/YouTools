import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCategories } from "../../services/categoryService";
import { FiGlobe } from "react-icons/fi";
import { BiUser } from "react-icons/bi";
import { useLanguage } from "../../context/LanguageContext";
import "./Header.css";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    // load dynamic categories
    (async () => {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
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
              <div className="logo-subtitle">FERRAMIENTAS</div>
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
                to="/"
                className={`nav-item ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                {language === "pt" ? "Início" : "Home"}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/produtos/${c.id}`}
                  className={`nav-item ${
                    location.pathname === `/produtos/${c.id}` ? "active" : ""
                  }`}
                >
                  {c.name}
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
