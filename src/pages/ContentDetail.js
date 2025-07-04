// src/pages/ContentDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotFound from './NotFound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import './ContentDetail.css';
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
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let response;
        if (window.location.pathname.startsWith('/sermoes')) {
          response = await axios.get(`http://localhost:3001/api/sermons/${contentId}`);
        } else if (window.location.pathname.startsWith('/estudos')) {
          response = await axios.get(`http://localhost:3001/api/studies/${contentId}`);
        } else if (window.location.pathname.startsWith('/livros')) {
          response = await axios.get(`http://localhost:3001/api/books/${contentId}`);
        }
        setSermon(response.data);
      } catch (err) {
        setError('Conteúdo não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentId]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!sermon) return <NotFound />;

  // URL atual da página para compartilhamento
  const shareUrl = window.location.href;
  const shareTitle = sermon.title; // Título para compartilhar

  return (
    <div className="content-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Voltar {/* ÍCONE AQUI */}
      </button>

      <div className="content-header-wrapper"> {/* Wrapper para título e capa */}
        {/* Exibir Capa do Livro */}
        {sermon.type === 'Resumo de Livro' && sermon.coverImageUrl && (
          <div className="book-cover-container">
            <img
              src={sermon.coverImageUrl}
              alt={`Capa do livro ${sermon.title}`}
              className="book-cover-image"
            />
          </div>
        )}

        <div className="title-and-meta-container"> {/* Para alinhar título e meta */}
          <div className="content-meta">
            <span className="content-type-badge">{sermon.type}</span>
            {sermon.type === 'Resumo de Livro' && sermon.author && (
              <span className="meta-item">Autor: {sermon.author}</span>
            )}
            {sermon.publisher && <span className="meta-item">Editora: {sermon.publisher}</span>}
            {sermon.area && <span className="meta-item">Área: {sermon.area}</span>}
          </div>

        </div>
      </div> {/* Fim de .content-header-wrapper */}



      {/* ... Metadados e Título ... */}
      {(['Sermão', 'Estudo', 'sermão', 'estudo'].includes(sermon.type)) && (
        <div className="content-meta-above-title">
          {(sermon.author || sermon.speaker) && (
            <span className="meta-item">
              Autor: {sermon.author || sermon.speaker}
            </span>
          )}
          {(sermon.reference || sermon.bibleReference) && (
            <span className="meta-item">
              {' | Referência: '}{sermon.reference || sermon.bibleReference}
            </span>
          )}
        </div>
      )}
      <h1 className="content-title">{sermon.title}</h1>

      {/* ... Player de Áudio e Texto Completo ... */}
      {sermon.content && (
        <div className="content-full-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {sermon.content}
          </ReactMarkdown>
        </div>
      )}


      {/* --- Ações (Download, Compartilhamento) --- */}
      <div className="content-actions">
        {sermon.pdfUrl && (
          <a href={sermon.pdfUrl} target="_blank" rel="noopener noreferrer" className="action-button download-button">
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

          <LinkedinShareButton url={shareUrl} title={shareTitle} summary={sermon.description} source="Seu Nome - Site Pastoral">
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