// src/components/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterForm from '../NewsletterForm/NewsletterForm';
import './Footer.css';

const Footer = () => {
  return (
    <> {/* Fragmento para envolver múltiplos elementos */}
      <div className="newsletter-section-in-footer"> {/* Container para centralizar/limitar largura */}
        <NewsletterForm />
      </div>

      {/* NOVO: Link/Botão de Apoio no Footer */}
      <div className="footer-support-cta">
        <p>Gostou do conteúdo? Considere apoiar este ministério!</p>
        <Link to="/apoie" className="footer-support-button">Saiba Como Apoiar</Link>
      </div>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Pastor Presbiteriano. </p>
        <p>Desenvolvido por <a href="contato" target="_blank" rel="noopener noreferrer">Giovanni Guimarães</a>.</p>
        <p>Este site é uma obra de amor e dedicação, com o objetivo de compartilhar a Palavra de Deus e recursos para o crescimento espiritual.</p>
        <p>Todos os direitos reservados.</p>
      </footer>
    </>
  );
};
export default Footer;