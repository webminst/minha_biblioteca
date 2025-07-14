// src/components/Sermons.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import { extractSermons, extractPagination } from '../utils/apiResponseHelpers';

/**
 * Componente Sermons - Página de sermões
 * Exibe lista paginada de sermões com filtros por livro bíblico e série
 * Permite navegação para detalhes e download de PDFs
 */

// Constante para controle de paginação
const ITEMS_PER_PAGE = 8;

function Sermons() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai página atual da URL
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  // Estados para dados e controles
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [uniqueBooks, setUniqueBooks] = useState([]);
  const [uniqueSeries, setUniqueSeries] = useState([]);
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);

  // Busca dados dos sermões na API com filtros e paginação
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);

        // Constrói parâmetros da query
        const params = {
          page: pageFromUrl,
          limit: ITEMS_PER_PAGE
        };

        if (selectedBook) params.book = selectedBook;
        if (selectedSeries) params.series = selectedSeries;
        if (selectedSpeaker) params.speaker = selectedSpeaker;
        if (searchTerm) params.search = searchTerm;

        const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, { params });

        // Usa helpers para extrair dados e paginação
        const sermonsData = extractSermons(response.data);
        const paginationData = extractPagination(response.data);

        setSermons(sermonsData);
        setPagination(paginationData);
      } catch (err) {
        setError('Erro ao carregar os sermões. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar sermões:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, [pageFromUrl, selectedBook, selectedSeries, selectedSpeaker, searchTerm]);

  // Inicializa filtros a partir da URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setSelectedBook(query.get('book') || '');
    setSelectedSeries(query.get('series') || '');
    setSelectedSpeaker(query.get('speaker') || '');
    setSearchTerm(query.get('search') || '');
  }, [location.search]);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Handlers para mudança de filtros
  const handleBookChange = (e) => {
    setSelectedBook(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&book=${e.target.value}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value);
    navigate(`${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${e.target.value ? `&series=${e.target.value}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleSpeakerChange = (e) => {
    setSelectedSpeaker(e.target.value);
    navigate(`${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${e.target.value ? `&speaker=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Aplica busca com debounce
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      navigate(`${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${e.target.value ? `&search=${e.target.value}` : ''}`);
    }, 500);
    setSearchTimeout(timeout);
  };

  // Limpar todos os filtros aplicados
  const clearFilters = () => {
    setSelectedBook('');
    setSelectedSeries('');
    setSelectedSpeaker('');
    setSearchTerm('');
    navigate(`${location.pathname}?page=1`);
  };

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [booksResponse, seriesResponse, speakersResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/books`),
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/series`),
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/speakers`)
        ]);

        // Extrai dados dos filtros, verificando se é DTO ou formato antigo
        const books = booksResponse.data.success ? booksResponse.data.data : (booksResponse.data || []);
        const series = seriesResponse.data.success ? seriesResponse.data.data : (seriesResponse.data || []);
        const speakers = speakersResponse.data.success ? speakersResponse.data.data : (speakersResponse.data || []);

        setUniqueBooks(Array.isArray(books) ? books : []);
        setUniqueSeries(Array.isArray(series) ? series : []);
        setUniqueSpeakers(Array.isArray(speakers) ? speakers : []);
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        // Em caso de erro, mantém arrays vazios
      }
    };

    fetchFilterOptions();
  }, []);

  // Funções de navegação baseadas na paginação da API
  const totalPages = pagination?.totalPages || 1;
  const goToNextPage = () => goToPage(Math.min(pageFromUrl + 1, totalPages));
  const goToPreviousPage = () => goToPage(Math.max(pageFromUrl - 1, 1));

  // Gera array com números das páginas para paginação
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Estados de carregamento e erro
  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (sermons.length === 0) return <p>Nenhum sermão encontrado.</p>;

  return (
    <div className="list-page-container">
      {/* Cabeçalho da página */}
      <h1>Sermões</h1>
      <p className="list-page-description">
        Você pode usar, copiar ou distribuir estes esboços desde que o faça gratuitamente.
        <i>"De graça recebestes, de graça dai"</i> (Mateus 10:8).
      </p>

      {/* Controles de filtro */}
      <div className="filter-controls">
        {/* Campo de busca */}
        <div className="filter-group">
          <label htmlFor="search-filter">Buscar:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Buscar por título, pregador, descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Filtro por livro bíblico */}
        <div className="filter-group">
          <label htmlFor="book-filter">Livro Bíblico:</label>
          <select id="book-filter" value={selectedBook} onChange={handleBookChange}>
            <option value="">Todos</option>
            {uniqueBooks.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>

        {/* Filtro por série */}
        <div className="filter-group">
          <label htmlFor="series-filter">Série:</label>
          <select id="series-filter" value={selectedSeries} onChange={handleSeriesChange}>
            <option value="">Todas</option>
            {uniqueSeries.map(series => (
              <option key={series} value={series}>{series}</option>
            ))}
          </select>
        </div>

        {/* Filtro por pregador */}
        <div className="filter-group">
          <label htmlFor="speaker-filter">Pregador:</label>
          <select id="speaker-filter" value={selectedSpeaker} onChange={handleSpeakerChange}>
            <option value="">Todos</option>
            {uniqueSpeakers.map(speaker => (
              <option key={speaker} value={speaker}>{speaker}</option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
        {(selectedBook || selectedSeries || selectedSpeaker || searchTerm) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de sermões */}
      <div className="content-list">
        {sermons.length > 0 ? (
          sermons.map((sermon) => (
            <ContentCard
              key={sermon._id}
              title={sermon.title}
              type="Sermão"
              description={sermon.description}
              detailsUrl={`/sermoes/${sermon._id}`}
              pdfUrl={sermon.pdfUrl}
              reference={sermon.bibleReference}
              sermon={sermon}
            />
          ))
        ) : (
          <p>Nenhum sermão encontrado com os filtros selecionados.</p>
        )}
      </div>

      {/* Controles de paginação - só aparecem se houver mais de uma página */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* Botão página anterior */}
          <button onClick={goToPreviousPage} disabled={pageFromUrl === 1} className="pagination-button">
            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
          </button>

          {/* Números das páginas */}
          {getPageNumbers().map(number => (
            <button
              key={number}
              onClick={() => goToPage(number)}
              className={`pagination-button page-number ${pageFromUrl === number ? 'active' : ''}`}
              disabled={pageFromUrl === number}
            >
              {number}
            </button>
          ))}

          {/* Botão próxima página */}
          <button onClick={goToNextPage} disabled={pageFromUrl === totalPages} className="pagination-button">
            Próxima <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      <NewsletterSection />
      <SupportSection />
    </div>
  );
}

export default Sermons;