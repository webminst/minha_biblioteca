// src/components/ContentCard/ContentCard.js

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import RatingDisplay from '../RatingDisplay/RatingDisplay';
import './ContentCard.css';
import PropTypes from 'prop-types';

// Helper to format date
const formatDate = dateString => {
  if (!dateString) return '';
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Meta info for book
const BookMetaInfo = ({ author }) =>
  author ? <div className='card-meta'>Por: {author}</div> : null;

BookMetaInfo.propTypes = {
  author: PropTypes.string,
};

// Meta info for sermon
const SermonMetaInfo = ({ reference, date, speaker }) => (
  <div className='card-meta'>
    {reference && <span className='card-reference'>{reference}</span>}
    {date && <span className='card-date'>{formatDate(date)}</span>}
    {speaker && <span className='card-speaker'>Pregador: {speaker}</span>}
  </div>
);

SermonMetaInfo.propTypes = {
  reference: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  speaker: PropTypes.string,
};

// Meta info for study
const StudyMetaInfo = ({ reference, author }) => (
  <div className='card-meta'>
    {reference && <span className='card-reference'>{reference}</span>}
    {author && <span className='card-author'>Por: {author}</span>}
  </div>
);

StudyMetaInfo.propTypes = {
  reference: PropTypes.string,
  author: PropTypes.string,
};

const getMetaInfo = ({ type, author, reference, date, speaker, content }) => {
  if (type === 'Resumo de Livro') {
    return <BookMetaInfo author={author} />;
  }
  if (type === 'Sermão') {
    const sermonDate = date || (content && content.date);
    return (
      <SermonMetaInfo
        reference={reference}
        date={sermonDate}
        speaker={speaker}
      />
    );
  }
  if (type === 'Estudo Bíblico' || type === 'Estudo') {
    return <StudyMetaInfo reference={reference} author={author} />;
  }
  return null;
};

const getDetailsLink = ({ detailsUrl, content, type }) => {
  if (detailsUrl) return detailsUrl;
  if (content && content._id) {
    if (type === 'Estudo Bíblico') return `/estudos/${content._id}`;
    if (type === 'Resumo de Livro') return `/livros/${content._id}`;
    return `/sermons/${content._id}`;
  }
  return null;
};

const renderCoverImage = ({ type, coverImageUrl, detailsUrl, title }) => {
  if (type === 'Resumo de Livro' && coverImageUrl) {
    return (
      <Link to={detailsUrl} className='card-cover-link'>
        <img
          src={coverImageUrl}
          alt={`Capa de ${title}`}
          className='card-cover-image'
        />
      </Link>
    );
  }
  return null;
};

const renderRating = rating => {
  if (rating && rating.average !== null) {
    return (
      <div className='card-rating'>
        <RatingDisplay
          average={rating.average}
          total={rating.total}
          size='small'
        />
      </div>
    );
  }
  return null;
};

const renderActions = ({ detailsLink, pdfUrl }) => (
  <div className='card-actions'>
    {detailsLink && (
      <Link
        to={detailsLink}
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
);

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
  const content = sermon || study || book;
  const metaInfo = getMetaInfo({ type, author, reference, date, speaker, content });
  const detailsLink = getDetailsLink({ detailsUrl, content, type });

  return (
    <div
      className={`content-card ${type === 'Resumo de Livro' && coverImageUrl ? 'with-cover' : ''}`}
    >
      {renderCoverImage({ type, coverImageUrl, detailsUrl, title })}
      <div className='card-content-wrapper'>
        <span className='card-type'>{type}</span>
        <h3 className='card-title'>
          <Link to={detailsUrl}>{title}</Link>
        </h3>
        {metaInfo}
        {renderRating(rating)}
        <p className='card-description'>{description}</p>
        {renderActions({ detailsLink, pdfUrl })}
      </div>
    </div>
  );
};

ContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  reference: PropTypes.string,
  description: PropTypes.string,
  detailsUrl: PropTypes.string,
  pdfUrl: PropTypes.string,
  coverImageUrl: PropTypes.string,
  sermon: PropTypes.object,
  study: PropTypes.object,
  book: PropTypes.object,
  author: PropTypes.string,
  speaker: PropTypes.string,
  rating: PropTypes.shape({
    average: PropTypes.number,
    total: PropTypes.number,
  }),
};

export default ContentCard;
