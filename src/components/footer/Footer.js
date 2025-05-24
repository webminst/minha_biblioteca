// src/components/Footer/Footer.js
import React from 'react';
import NewsletterForm from '../NewsletterForm/NewsletterForm'; // Importa
import './Footer.css';

const Footer = () => {
  return (
    <> {/* Fragmento para envolver múltiplos elementos */}
      <div className="newsletter-section-in-footer"> {/* Container para centralizar/limitar largura */}
        <NewsletterForm />
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