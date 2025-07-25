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
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [uniqueBooks, setUniqueBooks] = useState([]);
  const [uniqueSeries, setUniqueSeries] = useState([]);
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
        console.log('[Sermons] API response:', response.data);
        const sermonsData = extractSermons(response.data);
        const paginationData = extractPagination(response.data);
        console.log('[Sermons] sermonsData:', sermonsData);
        console.log('[Sermons] paginationData:', paginationData);
        setSermons(sermonsData);
        setPagination(paginationData);

        // Não é mais necessário extrair livros bíblicos aqui, pois já são buscados diretamente da API
        console.log('Dados dos sermões carregados:', sermonsData);
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
    const urlSearchTerm = query.get('search') || '';

    // Atualiza o estado local quando a URL muda
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
      setLocalSearchTerm(urlSearchTerm);
    }

    // Atualiza outros filtros
    setSelectedBook(query.get('book') || '');
    setSelectedSeries(query.get('series') || '');
    setSelectedSpeaker(query.get('speaker') || '');
  }, [location.search]);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Busca sugestões de busca no backend ou usa busca local como fallback
  const generateSearchSuggestions = async (term) => {
    if (!term.trim()) return [];

    try {
      // Tenta buscar sugestões no backend primeiro
      const response = await axios.get(`${API_ENDPOINTS.SERMONS.BASE}/suggestions`, {
        params: { q: term, limit: 5 },
        validateStatus: status => status >= 200 && status < 500
      });

      // Verifica se a resposta tem o formato esperado
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }

      // Se chegou aqui, o endpoint de sugestões não está disponível ou retornou um formato inválido
      // Usa busca global como fallback
      console.warn('Usando busca global para sugestões. Considere implementar o endpoint /suggestions no backend para melhor desempenho.');
      return await generateGlobalSearchSuggestions(term);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      // Em caso de erro, usa busca global como fallback
      return await generateGlobalSearchSuggestions(term);
    }
  };

  // Busca sugestões globalmente na API (fallback global)
  const generateGlobalSearchSuggestions = async (term) => {
    if (!term.trim()) return [];
    try {
      // Busca os primeiros 100 sermões que contenham o termo
      const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, {
        params: { search: term, page: 1, limit: 100 },
        validateStatus: status => status >= 200 && status < 500
      });
      const sermonsList = Array.isArray(response.data.data) ? response.data.data : [];
      const lowerTerm = term.toLowerCase();
      const suggestions = new Set();
      for (let i = 0; i < sermonsList.length; i++) {
        const sermon = sermonsList[i];
        if (sermon.title && sermon.title.toLowerCase().includes(lowerTerm)) {
          suggestions.add(sermon.title);
        }
        if (sermon.series && sermon.series.toLowerCase().includes(lowerTerm)) {
          suggestions.add(sermon.series);
        }
        if (sermon.speaker && sermon.speaker.toLowerCase().includes(lowerTerm)) {
          suggestions.add(sermon.speaker);
        }
        if (suggestions.size >= 5) break;
      }
      return Array.from(suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões globais:', error);
      return [];
    }
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

  // Atualiza o termo de busca local
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // Gera sugestões em tempo real
    if (value.length > 1) {
      try {
        setIsSearching(true);
        const suggestions = await generateSearchSuggestions(value);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Erro ao gerar sugestões:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Aplica a busca quando o usuário clica em uma sugestão ou pressiona Enter
  const applySearch = (value = null) => {
    const searchValue = value !== null ? value : localSearchTerm;

    setIsSearching(true);

    // Atualiza a URL com o novo termo de busca
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');

    if (selectedBook) newSearchParams.set('book', selectedBook);
    if (selectedSeries) newSearchParams.set('series', selectedSeries);
    if (selectedSpeaker) newSearchParams.set('speaker', selectedSpeaker);

    if (searchValue) {
      newSearchParams.set('search', searchValue);
    }

    // Navega para a nova URL
    navigate(`${location.pathname}?${newSearchParams.toString()}`);

    // Fecha as sugestões
    setShowSuggestions(false);
    setIsSearching(false);
  };

  // Aplica a busca quando o usuário pressiona Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applySearch();
    }
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
        console.log('Buscando opções de filtro...');
        // Busca séries, pregadores e livros bíblicos diretamente dos endpoints da API
        const [seriesResponse, speakersResponse, booksResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/series`),
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/speakers`),
          axios.get(`${API_ENDPOINTS.SERMONS.BASE}/books`)
        ]);

        console.log('Resposta da API - Séries:', seriesResponse);
        console.log('Resposta da API - Pregadores:', speakersResponse);
        console.log('Resposta da API - Livros:', booksResponse);

        // Extrai dados dos filtros, verificando se é DTO ou formato antigo
        const series = seriesResponse.data.success ? seriesResponse.data.data : (Array.isArray(seriesResponse.data) ? seriesResponse.data : []);
        const speakers = speakersResponse.data.success ? speakersResponse.data.data : (Array.isArray(speakersResponse.data) ? speakersResponse.data : []);
        const books = booksResponse.data.success ? booksResponse.data.data : (Array.isArray(booksResponse.data) ? booksResponse.data : []);

        console.log('Séries extraídas:', series);
        console.log('Pregadores extraídos:', speakers);
        console.log('Livros bíblicos extraídos:', books);

        // Atualiza os estados com os dados obtidos
        setUniqueSeries(series);
        setUniqueSpeakers(speakers);
        setUniqueBooks(books);
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        // Em caso de erro, mantém arrays vazios
        setUniqueSeries([]);
        setUniqueSpeakers([]);
        setUniqueBooks([]);
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
          <div style={{ position: 'relative' }}>
            <input
              id="search-filter"
              type="text"
              placeholder="Buscar por título, pregador, referência..."
              value={localSearchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => localSearchTerm.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`search-input ${localSearchTerm ? 'search-active' : ''}`}
              autoComplete="off"
            />
            <div className="search-icon-container">
              {isSearching ? (
                <div className="spinner-border spinner-border-sm text-muted" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </div>

            {/* Sugestões de busca */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions visible">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onMouseDown={() => {
                      setLocalSearchTerm(suggestion);
                      applySearch(suggestion);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && searchSuggestions.length === 0 && localSearchTerm.length > 1 && (
              <div className="search-suggestions visible">
                <div className="search-loading">Nenhuma sugestão encontrada</div>
              </div>
            )}
          </div>
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