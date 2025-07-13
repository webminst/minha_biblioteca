import React from 'react';
import { Link } from 'react-router-dom';
import './SupportSection.css';

const SupportSection = () => {
  return (
    <section className="footer-support-cta">
      <p>Se este conteúdo tem sido uma bênção, considere apoiar este ministério:</p>
      <Link to="/apoie" className="footer-support-button">
        Saiba como apoiar
      </Link>
    </section>
  );
};

export default SupportSection;