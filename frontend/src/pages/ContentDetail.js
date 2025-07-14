// src/pages/ContentDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotFound from './NotFound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { extractSermons, extractStudies, extractBooks } from '../utils/apiResponseHelpers';
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

/**
 * Componente ContentDetail - Página de detalhes de conteúdo
 * Exibe detalhes completos de sermões, estudos e resumos de livros
 * Inclui funcionalidades de compartilhamento e download de PDF
 */
const ContentDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();

  // Estados para controle dos dados e carregamento
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca o conteúdo baseado na rota atual
  useEffect(() => {
    const fetchContent = async () => {
      try {
        let response;

        // Determina qual API chamar baseado na URL
        if (window.location.pathname.startsWith('/sermoes')) {
          response = await axios.get(API_ENDPOINTS.SERMONS.BY_ID(contentId));
          // Para endpoints BY_ID, o dado vem diretamente em response.data.data
          const sermonData = response.data.success ? response.data.data : response.data;
          setSermon(sermonData);
        } else if (window.location.pathname.startsWith('/estudos')) {
          response = await axios.get(API_ENDPOINTS.STUDIES.BY_ID(contentId));
          // Para endpoints BY_ID, o dado vem diretamente em response.data.data
          const studyData = response.data.success ? response.data.data : response.data;
          setSermon(studyData);
        } else if (window.location.pathname.startsWith('/livros')) {
          response = await axios.get(API_ENDPOINTS.BOOKS.BY_ID(contentId));
          // Para endpoints BY_ID, o dado vem diretamente em response.data.data
          const bookData = response.data.success ? response.data.data : response.data;
          setSermon(bookData);
        }
      } catch (err) {
        setError('Conteúdo não encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  // Estados de carregamento e erro
  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!sermon) return <NotFound />;

  // Dados para compartilhamento
  const shareUrl = window.location.href;
  const shareTitle = sermon.title;

  // Função para compartilhar no Instagram
  const shareOnInstagram = () => {
    // Copia a URL para clipboard e orienta o usuário
    navigator.clipboard.writeText(`${shareTitle}\n\n${shareUrl}\n\n#SermoesOnline #Biblia #EstudoBiblico`)
      .then(() => {
        alert('Link copiado! Cole no Instagram Stories ou post para compartilhar.');
        // Abre o Instagram (se estiver no mobile) ou Instagram Web
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          window.open('instagram://story-camera', '_blank');
        } else {
          window.open('https://www.instagram.com/', '_blank');
        }
      })
      .catch(() => {
        alert('Erro ao copiar link. Copie manualmente e cole no Instagram.');
      });
  };

  return (
    <div className="content-detail-container">
      {/* Botão de voltar */}
      <button onClick={() => navigate(-1)} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Voltar
      </button>

      {/* Cabeçalho com título e capa (para livros) */}
      <div className="content-header-wrapper">
        {/* Capa do livro - só aparece para resumos de livros */}
        {sermon.type === 'Resumo de Livro' && sermon.coverImageUrl && (
          <div className="book-cover-container">
            <img
              src={sermon.coverImageUrl}
              alt={`Capa do livro ${sermon.title}`}
              className="book-cover-image"
            />
          </div>
        )}

        {/* Container para título e metadados */}
        <div className="title-and-meta-container">
          <div className="content-meta">
            <span className="content-type-badge">{sermon.type}</span>

            {/* Metadados específicos para livros */}
            {sermon.type === 'Resumo de Livro' && sermon.author && (
              <span className="meta-item">Autor: {sermon.author}</span>
            )}
            {sermon.publisher && <span className="meta-item">Editora: {sermon.publisher}</span>}
            {sermon.area && <span className="meta-item">Área: {sermon.area}</span>}
          </div>
        </div>
      </div>

      {/* Metadados para sermões e estudos - aparecem acima do título */}
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

      {/* Título principal do conteúdo */}
      <h1 className="content-title">{sermon.title}</h1>

      {/* Conteúdo principal em Markdown */}
      {sermon.content && (
        <div className="content-full-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {sermon.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Seção de ações: download e compartilhamento */}
      <div className="content-actions">
        {/* Botão de download do PDF - só aparece se houver PDF */}
        {sermon.pdfUrl && (
          <a
            href={sermon.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button download-button"
          >
            <FontAwesomeIcon icon={faFilePdf} className="icon-before-text" /> Baixar PDF
          </a>
        )}

        {/* Botões de compartilhamento em redes sociais */}
        <div className="share-buttons-container">
          <span className="share-label">Compartilhar:</span>

          {/* Facebook */}
          <FacebookShareButton url={shareUrl} quote={shareTitle} hashtag="#SermoesOnline">
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          {/* Twitter */}
          <TwitterShareButton url={shareUrl} title={shareTitle} hashtags={["Biblia", "EstudoBiblico"]}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          {/* WhatsApp */}
          <WhatsappShareButton url={shareUrl} title={shareTitle} separator=":: ">
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>

          {/* Instagram */}
          <button
            onClick={shareOnInstagram}
            className="instagram-share-button"
            title="Compartilhar no Instagram"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </button>

          {/* LinkedIn */}
          <LinkedinShareButton
            url={shareUrl}
            title={shareTitle}
            summary={sermon.description}
            source="Pastor Giovanni - Portfólio Pastoral"
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>

          {/* E-mail */}
          <EmailShareButton
            url={shareUrl}
            subject={`Confira: ${shareTitle}`}
            body={`Olá,\n\nAcho que você gostaria de ler este material: ${shareTitle}\n\n${shareUrl}\n\nBênçãos!`}
          >
            <EmailIcon size={32} round />
          </EmailShareButton>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;