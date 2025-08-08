// src/components/ContentCard/ContentCard.js

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import RatingDisplay from '../RatingDisplay/RatingDisplay';
import './ContentCard.css';

const ContentCard = ({
  title,
  type,
  date,
  reference,
  description,
  detailsUrl,
  pdfUrl,
  coverImageUrl,
  sermon,
  study,
  book,
  author,
  speaker,
  rating,
}) => {
  // Use o objeto que estiver disponível
  const content = sermon || study || book;

  // Formata a data para exibição
  const formatDate = dateString => {
    if (!dateString) return '';
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Renderiza a meta-informação baseada no tipo
  const renderMetaInfo = () => {
    if (type === 'Resumo de Livro') {
      return <>{author && <div className='card-meta'>Por: {author}</div>}</>;
    } else if (type === 'Sermão') {
      const sermonDate = date || (content && content.date);
      return (
        <div className='card-meta'>
          {reference && <span className='card-reference'>{reference}</span>}
          {sermonDate && (
            <span className='card-date'>{formatDate(sermonDate)}</span>
          )}
          {speaker && <span className='card-speaker'>Pregador: {speaker}</span>}
        </div>
      );
    } else if (type === 'Estudo Bíblico' || type === 'Estudo') {
      return (
        <div className='card-meta'>
          {reference && <span className='card-reference'>{reference}</span>}
          {author && <span className='card-author'>Por: {author}</span>}
        </div>
      );
    }
    return null; // Caso não seja nenhum dos tipos esperados
  };

  return (
    <div
      className={`content-card ${type === 'Resumo de Livro' && coverImageUrl ? 'with-cover' : ''}`}
    >
      {type === 'Resumo de Livro' && coverImageUrl && (
        <Link to={detailsUrl} className='card-cover-link'>
          <img
            src={coverImageUrl}
            alt={`Capa de ${title}`}
            className='card-cover-image'
          />
        </Link>
      )}
      <div className='card-content-wrapper'>
        <span className='card-type'>{type}</span>
        <h3 className='card-title'>
          <Link to={detailsUrl}>{title}</Link>
        </h3>
        {renderMetaInfo()}{' '}
        {/* Chama a função para renderizar a meta-informacao */}
        {/* Exibe a media de avaliacoes se disponivel */}
        {rating && rating.average !== null && (
          <div className='card-rating'>
            <RatingDisplay
              average={rating.average}
              total={rating.total}
              size='small'
            />
          </div>
        )}
        <p className='card-description'>{description}</p>
        <div className='card-actions'>
          {(detailsUrl || (content && content._id)) && (
            <Link
              to={
                detailsUrl ||
                `/${type === 'Estudo Bíblico' ? 'estudos' : type === 'Resumo de Livro' ? 'livros' : 'sermoes'}/${content._id}`
              }
              className='card-button details-button'
            >
              Ver Detalhes{' '}
              <FontAwesomeIcon
                icon={faArrowRight}
                className='icon-after-text'
              />
            </Link>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='card-button download-button'
            >
              <FontAwesomeIcon icon={faFilePdf} className='icon-before-text' />{' '}
              Baixar PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
