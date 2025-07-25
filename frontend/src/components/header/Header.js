// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/busca?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = (e) => {
    e?.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      const menu = document.querySelector('.main-nav');
      const button = document.querySelector('.mobile-menu-toggle');

      if (isMobileMenuOpen &&
        menu &&
        button &&
        !menu.contains(e.target) &&
        !button.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    // Adiciona o evento de clique no documento
    document.addEventListener('mousedown', handleClickOutside);

    // Remove o evento quando o componente é desmontado
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Adiciona scroll suave para os links de navegação
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Verifica se o clique foi em um link de âncora
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Fecha o menu móvel se estiver aberto
          if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }
      }
    };

    // Adiciona o manipulador de eventos ao menu de navegação
    const nav = document.querySelector('.main-nav');
    if (nav) {
      nav.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (nav) {
        nav.removeEventListener('click', handleLinkClick);
      }
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Detecta tema para trocar logo
  const [logoSrc, setLogoSrc] = useState('/images/minha-biblioteca-white.png');
  useEffect(() => {
    const updateLogo = () => {
      const isDark = document.body.classList.contains('dark');
      setLogoSrc(isDark ? '/images/minha-biblioteca-dark.png' : '/images/minha-biblioteca-white.png');
    };
    updateLogo();
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Overlay para o menu móvel */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/">
              <img
                src={logoSrc}
                alt="Logo Minha Biblioteca"
                className="header-logo"
              />
            </Link>
          </div>
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul>
              <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
              <li><NavLink to="/sermoes" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sermões</NavLink></li>
              <li><NavLink to="/estudos" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Estudos</NavLink></li>
              <li><NavLink to="/livros" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Livros</NavLink></li>
              <li><NavLink to="/biblia" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Bíblia</NavLink></li>
              <li><NavLink to="/agenda" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Agenda</NavLink></li>
              <li><NavLink to="/sobre" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sobre</NavLink></li>
              <li><NavLink to="/contato" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Contato</NavLink></li>
              <li><NavLink to="/apoie" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Apoie</NavLink></li>
              <li><NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink></li>
            </ul>
            <form onSubmit={handleSearchSubmit} className="search-form-mobile">
              <input
                type="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="header-search-input"
                aria-label="Buscar no site"
              />
              <button type="submit" className="header-search-button" aria-label="Buscar">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          </nav>

          <form onSubmit={handleSearchSubmit} className="search-form desktop-search">
            <input
              type="search"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="header-search-input"
              aria-label="Buscar no site"
            />
            <button type="submit" className="header-search-button" aria-label="Buscar">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
          <ThemeToggle />
        </div>
      </header>
    </>
  );
};

export default Header;