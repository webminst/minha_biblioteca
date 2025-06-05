// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <header className="app-header">
      <div className="logo-container">
        <Link to="/">
          <img
            src="/images/minha-biblioteca-white.png"
            alt="Logo Minha Biblioteca"
            className="header-logo"
          />
        </Link>
      </div>
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Abrir menu" aria-expanded={isMobileMenuOpen}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li><NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/sermoes" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sermões</NavLink></li>
          <li><NavLink to="/estudos" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Estudos</NavLink></li>
          <li><NavLink to="/livros" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Livros</NavLink></li>
          <li><NavLink to="/agenda" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Agenda</NavLink></li>
          <li><NavLink to="/sobre" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sobre</NavLink></li>
          <li><NavLink to="/contato" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Contato</NavLink></li>
          <li><NavLink to="/apoie" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Apoie</NavLink></li>
        </ul>
        <form onSubmit={handleSearchSubmit} className="search-form-mobile">
          <input
            type="search"
            placeholder="Buscar no site..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Buscar no site"
          />
          <button type="submit" className="search-button" aria-label="Buscar">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
      </nav>

      <form onSubmit={handleSearchSubmit} className="search-form desktop-search">
        <input
          type="search"
          placeholder="Buscar no site..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Buscar no site"
        />
        <button type="submit" className="search-button" aria-label="Buscar">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
    </header>
  );
};

export default Header;