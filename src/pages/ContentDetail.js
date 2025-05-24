// src/pages/ContentDetail.js
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NotFound from './NotFound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import './ContentDetail.css';
import { sermonsData, studiesData, booksData, findContentById } from '../data/generatedData'; // NOVA LINHA para atualizar os dados
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
} from 'react-share';

const ContentDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const content = findContentById(contentId);

  if (!content) {
    return <NotFound />;
  }

  const handleGoBack = () => navigate(-1);

  // URL atual da página para compartilhamento
  const shareUrl = window.location.href;
  const shareTitle = content.title; // Título para compartilhar

  return (
    <div className="content-detail-container">
      <button onClick={handleGoBack} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Voltar {/* ÍCONE AQUI */}
      </button>

      {/* ... Metadados e Título ... */}
       <div className="content-meta">
        {/* ... */}
      </div>
      <h1 className="content-title">{content.title}</h1>
      {/* ... Player de Áudio e Texto Completo ... */}
       <div className="content-full-text" dangerouslySetInnerHTML={{ __html: content.fullText || '...' }} />


      {/* --- Ações (Download, Compartilhamento) --- */}
            <div className="content-actions">
        {content.pdfUrl && (
          <a href={content.pdfUrl} target="_blank" rel="noopener noreferrer" className="action-button download-button">
            <FontAwesomeIcon icon={faFilePdf} className="icon-before-text" /> Baixar PDF {/* ÍCONE AQUI */}
          </a>
        )}

        {/* Botões de Compartilhamento Reais */}
        <div className="share-buttons-container">
          <span className="share-label">Compartilhar:</span>
          <FacebookShareButton url={shareUrl} quote={shareTitle} hashtag="#SermoesOnline"> {/* Adicione hashtags relevantes */}
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl} title={shareTitle} hashtags={["Biblia", "EstudoBiblico"]}> {/* Ajuste hashtags */}
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <WhatsappShareButton url={shareUrl} title={shareTitle} separator=":: ">
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>

          <LinkedinShareButton url={shareUrl} title={shareTitle} summary={content.description} source="Seu Nome - Site Pastoral">
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>

          <EmailShareButton url={shareUrl} subject={`Confira: ${shareTitle}`} body={`Olá,\n\nAcho que você gostaria de ler este material: ${shareTitle}\n\n${shareUrl}\n\nAtenciosamente,\n[Seu Nome (opcional)]`}>
            <EmailIcon size={32} round />
          </EmailShareButton>
        </div>
      </div>
      {/* ... */}
    </div>
  );
};

export default ContentDetail;