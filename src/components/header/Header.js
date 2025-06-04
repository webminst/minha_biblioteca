// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar
import { faSearch } from '@fortawesome/free-solid-svg-icons';   // Importar ícone específico

import './Header.css';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para o menu móvel

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/busca?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false); // Fecha o menu móvel ao buscar
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Opcional: Fechar menu móvel se a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && isMobileMenuOpen) { // 992px é o breakpoint que usaremos
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);


  return (
    <header className="app-header">
      <div className="logo-container"> {/* Container para o logo */}
        <Link to="/">
          <img
            src="/images/minha-biblioteca-white.png" // Caminho para a imagem na pasta public
            alt="Logo Minha Biblioteca" // Texto alternativo importante!
            className="header-logo"
          />
          {/* Você pode remover o texto "Nome do Pastor / Logo" se o logo for suficiente,
              ou mantê-lo ao lado/abaixo do logo dependendo do design. */}
          {/* <span className="logo-text">Nome do Pastor</span> */}
        </Link>
      </div>
      {/* Ícone do Menu Hambúrguer (visível apenas em mobile) */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Abrir menu" aria-expanded={isMobileMenuOpen}>
        {/* Ícone simples de hambúrguer (3 barras). Pode usar um SVG mais elaborado. */}
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Navegação Principal (com classe condicional para mobile) */}
      <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          {/* Fechar menu ao clicar em um link */}
          <li><NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/sermoes" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sermões</NavLink></li>
          <li><NavLink to="/estudos" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Estudos</NavLink></li>
          <li><NavLink to="/livros" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Livros</NavLink></li>
          <li><NavLink to="/agenda" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Agenda</NavLink></li>
          <li><NavLink to="/sobre" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Sobre</NavLink></li>
          <li><NavLink to="/contato" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Contato</NavLink></li>
          <li><NavLink to="/apoie" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Apoie</NavLink></li>
        </ul>
         {/* Adicionar a busca dentro do menu mobile também (opcional) */}
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
                <FontAwesomeIcon icon={faSearch} /> {/* ÍCONE AQUI */}
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
            <FontAwesomeIcon icon={faSearch} /> {/* ÍCONE AQUI */}
        </button>
      </form>
    </header>
  );
};

export default Header;