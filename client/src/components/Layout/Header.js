import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCategories } from "../../services/categoryService";
import { getBrands } from "../../services/brandService";
import { getProducts } from "../../services/productService";
import { FiGlobe, FiSearch } from "react-icons/fi";
import { BiUser } from "react-icons/bi";
import { useLanguage } from "../../context/LanguageContext";
import "./Header.css";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith("/admin");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null); // ✅ new ref for search icon button

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const scrollTimer = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [showSearch, setShowSearch] = useState(window.innerWidth > 767);

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const b = await getBrands();
        if (mounted && b?.success) setBrands(b.data || []);
      } catch {}
      try {
        const p = await getProducts();
        if (mounted && p?.success) setProducts(p.data || []);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      if (!mobile) setShowSearch(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const q = (query || "").trim().toLowerCase();
      if (!q) return setResults([]);

      const prodMatches = (products || [])
        .filter((p) => p?.name?.toLowerCase().includes(q))
        .map((p) => ({ type: "product", data: p }));

      const brandMatches = (brands || [])
        .filter((b) => b?.name?.toLowerCase().includes(q))
        .map((b) => ({ type: "brand", data: b }));

      const categoryMatches = (categories || [])
        .filter((c) => c?.name?.toLowerCase().includes(q))
        .map((c) => ({ type: "category", data: c }));

      const combined = [
        ...prodMatches.slice(0, 6),
        ...brandMatches.slice(0, 6),
        ...categoryMatches.slice(0, 6),
      ];
      setResults(combined.slice(0, 8));
    }, 200);
    return () => clearTimeout(id);
  }, [query, products, brands, categories]);

  // ✅ FIX: prevent the search from closing when clicking the icon
  useEffect(() => {
    const onDocClick = (e) => {
      // ignore clicks on the search button or search box
      if (
        searchRef.current?.contains(e.target) ||
        searchButtonRef.current?.contains(e.target)
      ) {
        return;
      }
      setResults([]);
      if (isMobile) setShowSearch(false); // also close mobile search only when clicked outside
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isMobile]);

  const onSelect = (item) => {
    if (!item) return;
    if (item.type === "product") navigate(`/produto/${item.data.id}`);
    else if (item.type === "brand")
      navigate(`/${item.data.slug || item.data.id}`);
    else if (item.type === "category") navigate(`/produtos/${item.data.id}`);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
        scrollTimer.current = null;
      }

      if (current <= 10) {
        setHidden(false);
      } else if (current > lastScrollY.current && current > 50) {
        setHidden(true);
      } else if (current < lastScrollY.current) {
        setHidden(false);
        scrollTimer.current = setTimeout(() => {
          setHidden(true);
        }, 1200);
      }
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  const placeholder = language === "pt" ? "Pesquisar..." : "Search...";

  return (
    <header className={`header ${hidden ? "header--hidden" : ""}`}>
      <div className="header-main">
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

        <div
          className="search-container"
          ref={searchRef}
          style={{ gap: "30px" }}
        >
          {isMobile && (
            <button
              ref={searchButtonRef}
              className="search-icon-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setShowSearch((prev) => !prev);
              }}
            >
              <FiSearch size={20} />
            </button>
          )}

          {showSearch && (
            <input
              className={`search-input ${isMobile ? "mobile" : ""}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="search"
              autoFocus={isMobile && showSearch}
            />
          )}

          {results?.length > 0 && (
            <div className="search-results">
              {results.map((r, idx) => (
                <div
                  className="search-item"
                  key={`${r.type}-${r.data.id || r.data.slug || idx}`}
                  onClick={() => onSelect(r)}
                >
                  {r.data.image || r.data.logo ? (
                    <img
                      src={r.data.image || r.data.logo}
                      alt={r.data.name}
                      onError={(e) => {
                        e.target.src = "/placeholder-product.jpg";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        background: "#f0f0f0",
                        borderRadius: 6,
                      }}
                    />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.data.name || r.data.slug || r.data.title}
                    </div>
                    {r.type === "product" && r.data.brand && (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {r.data.brand}
                      </div>
                    )}
                  </div>
                  <div className="kind">{r.type}</div>
                </div>
              ))}
            </div>
          )}

          <div className="lang-admin-container">
            <div className="top-right">
              <button className="language-toggle" onClick={toggleLanguage}>
                <FiGlobe className="icon" />
                <span>{language === "pt" ? "EN" : "PT"}</span>
              </button>
            </div>

            {!isAdminPage && (
              <div className="header-actions">
                <Link to="/admin" className="action-btn admin-btn">
                  <BiUser className="icon" />
                  <span className="admin-text">{t("admin")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isAdminPage && (
        <nav className="navigation">
          <div className="container">
            <div className="nav-menu">
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
