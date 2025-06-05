import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './ContentCard.css';

// Props esperadas: title, type (Sermão, Estudo, Livro), date, reference, description, detailsUrl, pdfUrl (opcional)
const ContentCard = ({ title, type, date, reference, description, detailsUrl, pdfUrl, coverImageUrl }) => {
  return (
    <div className={`content-card ${type === 'Resumo de Livro' && coverImageUrl ? 'with-cover' : ''}`}>
      {type === 'Resumo de Livro' && coverImageUrl && (
        <Link to={detailsUrl} className="card-cover-link">
          <img src={coverImageUrl} alt={`Capa de ${title}`} className="card-cover-image" />
        </Link>
      )}
      <div className="card-content-wrapper">
        <span className="card-type">{type}</span>
        <h3 className="card-title">
          <Link to={detailsUrl}>{title}</Link>
        </h3>
        <div className="card-meta">
          {date && <span>{date}</span>}
          {reference && <span> | {reference}</span>}
        </div>
        <p className="card-description">{description}</p>
        <div className="card-actions">
          <Link to={detailsUrl} className="card-button details-button">
            Ver Detalhes <FontAwesomeIcon icon={faArrowRight} className="icon-after-text" />
          </Link>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="card-button download-button">
              <FontAwesomeIcon icon={faFilePdf} className="icon-before-text" /> Baixar PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;