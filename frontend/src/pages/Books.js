import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import ContentCard from '../components/ContentCard/ContentCard';
import StarRating from '../components/StarRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import { extractBooks, extractPagination } from '../utils/apiResponseHelpers';
import BookService from '../services/bookService';

/**
 * Componente Books - Página de resumos de livros
 * Exibe lista paginada de resumos de livros com filtros por área e autor
 * Permite navegação para detalhes e download de PDFs
 */

// Constante para controle de paginação
const ITEMS_PER_PAGE = 8;

function Books() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai página atual da URL
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  // Estados para dados e controles
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [uniqueAuthors, setUniqueAuthors] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [suggestionCategories, setSuggestionCategories] = useState({
    titles: [],
    authors: [],
    areas: [],
    publishers: []
  });
  const lastRequestId = useRef(0);

  // Busca dados dos livros na API com filtros e paginação
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // Constrói parâmetros da query a partir da URL
        const query = new URLSearchParams(location.search);
        const searchParam = query.get('search') || '';
        const areaParam = query.get('area') || '';
        const authorParam = query.get('author') || '';
        const pageParam = query.get('page') || '1';

        const params = {
          page: pageParam,
          limit: ITEMS_PER_PAGE
        };

        if (areaParam) params.area = areaParam;
        if (authorParam) params.author = authorParam;
        if (searchParam) params.search = searchParam;

        const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, { params });

        const booksData = extractBooks(response.data);
        const paginationData = extractPagination(response.data);

        setBooks(booksData);
        setPagination(paginationData);
      } catch (err) {
        setError('Erro ao carregar os livros. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar livros:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [location.search]);

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
    const areaParam = query.get('area') || '';
    setSelectedArea(areaParam);
    setSelectedAuthor(query.get('author') || '');
  }, [location.search]);

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log('Buscando opções de filtro...');

        // Buscando as áreas
        const areasResponse = await axios.get(`${API_ENDPOINTS.BOOKS.BASE}/areas`);
        console.log('Resposta da API - Áreas (raw):', areasResponse);

        // Buscando os livros para extrair os autores
        const booksResponse = await axios.get(API_ENDPOINTS.BOOKS.BASE);
        console.log('Resposta completa da API de livros:', JSON.stringify(booksResponse.data, null, 2));

        // Extrai as áreas da resposta
        const areas = areasResponse.data.success ? areasResponse.data.data : (areasResponse.data || []);

        // Extrai os livros da resposta - agora acessando corretamente a propriedade data
        const books = booksResponse.data.data || [];
        console.log('Lista de livros extraída:', books);

        // Extrai os autores únicos dos livros
        const authors = [
          ...new Set(
            books
              .map(book => {
                console.log('Livro atual:', book);
                return book.author;
              })
              .filter(author => {
                const isValid = author && typeof author === 'string' && author.trim() !== '';
                console.log('Autor:', author, 'é válido?', isValid);
                return isValid;
              })
          )
        ].sort(); // Ordena os autores alfabeticamente

        console.log('Autores extraídos dos livros:', authors);

        console.log('Tipo de áreas:', typeof areas, 'É array?', Array.isArray(areas));
        console.log('Tipo de autores:', typeof authors, 'É array?', Array.isArray(authors));

        // Usando JSON.stringify para ver o conteúdo completo dos arrays
        console.log('Conteúdo completo de áreas:', JSON.stringify(areas, null, 2));
        console.log('Conteúdo completo de autores:', JSON.stringify(authors, null, 2));

        console.log('Primeiros 5 itens de áreas:', areas.slice(0, 5));
        console.log('Primeiros 5 itens de autores:', authors.slice(0, 5));

        // Garantir que estamos lidando com arrays e que os itens são strings
        const areasArray = Array.isArray(areas) ? areas.filter(a => a && typeof a === 'string').map(a => a.trim()) : [];
        const authorsArray = Array.isArray(authors) ? authors.filter(a => a && typeof a === 'string').map(a => a.trim()) : [];

        console.log('Áreas após limpeza:', JSON.stringify(areasArray, null, 2));
        console.log('Autores após limpeza:', JSON.stringify(authorsArray, null, 2));

        setUniqueAreas(areasArray);
        setUniqueAuthors(authorsArray);
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        // Em caso de erro, mantém arrays vazios
      }
    };

    fetchFilterOptions();
  }, []);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    if (selectedArea) params.set('area', selectedArea);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Handlers para mudança de filtros
  const handleAreaChange = (e) => {
    let value = e.target.value;
    // Sanitiza: só permite string única, sem vírgula ou múltiplos valores
    if (typeof value === 'string' && value.includes(',')) {
      value = value.split(',')[0].trim();
    }
    setSelectedArea(value);
    const params = new URLSearchParams();
    params.set('page', 1);
    if (value) params.set('area', value);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleAuthorChange = (e) => {
    setSelectedAuthor(e.target.value);
    navigate(`${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${e.target.value ? `&author=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Busca sugestões globais com base no termo digitado
  // Função para buscar sugestões de busca (autocomplete) com fallback local (igual Sermons)
  const fetchSearchSuggestions = async (term) => {
    if (!term.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      // Tenta buscar sugestões no backend primeiro
      const response = await axios.get(`${API_ENDPOINTS.BOOKS.BASE}/suggestions`, {
        params: { q: term, limit: 5 },
        validateStatus: status => status >= 200 && status < 500
      });

      // Verifica se a resposta tem o formato esperado
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          setSearchSuggestions(response.data.map(s => ({ text: s, type: 'Sugestão' })));
          setShowSuggestions(response.data.length > 0);
          return;
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setSearchSuggestions(response.data.data.map(s => ({ text: s, type: 'Sugestão' })));
          setShowSuggestions(response.data.data.length > 0);
          return;
        }
      }

      // Se chegou aqui, o endpoint de sugestões não está disponível ou retornou um formato inválido
      // Usa busca global como fallback
      console.warn('Usando busca global para sugestões. Considere implementar o endpoint /suggestions no backend para melhor desempenho.');
      const globalSuggestions = await generateGlobalSearchSuggestions(term);
      setSearchSuggestions(globalSuggestions);
      setShowSuggestions(globalSuggestions.length > 0);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      // Em caso de erro, usa busca global como fallback
      const globalSuggestions = await generateGlobalSearchSuggestions(term);
      setSearchSuggestions(globalSuggestions);
      setShowSuggestions(globalSuggestions.length > 0);
    }
  };

  // Busca sugestões globalmente na API (fallback global)
  const generateGlobalSearchSuggestions = async (term) => {
    if (!term.trim()) return [];
    try {
      // Busca os primeiros 100 livros que contenham o termo
      const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, {
        params: { search: term, page: 1, limit: 100 },
        validateStatus: status => status >= 200 && status < 500
      });
      const booksList = Array.isArray(response.data.data) ? response.data.data : [];
      const lowerTerm = term.toLowerCase();
      const suggestions = new Set();
      for (let i = 0; i < booksList.length; i++) {
        const book = booksList[i];
        if (book.title && book.title.toLowerCase().includes(lowerTerm)) {
          suggestions.add(JSON.stringify({ text: book.title, type: 'título' }));
        }
        if (book.author && book.author.toLowerCase().includes(lowerTerm)) {
          suggestions.add(JSON.stringify({ text: book.author, type: 'autor' }));
        }
        if (book.reference && book.reference.toLowerCase().includes(lowerTerm)) {
          suggestions.add(JSON.stringify({ text: book.reference, type: 'referência' }));
        }
        if (suggestions.size >= 10) break;
      }
      return Array.from(suggestions).map(s => JSON.parse(s));
    } catch (error) {
      console.error('Erro ao buscar sugestões globais:', error);
      return [];
    }
  };

  // Gera sugestões localmente (usado como fallback)
  const generateLocalSearchSuggestions = (term) => {
    if (!term.trim() || !books || books.length === 0) return [];

    const lowerTerm = term.toLowerCase();
    const suggestions = new Set();

    // Limita a busca aos primeiros 100 itens para performance
    const maxItems = Math.min(100, books.length);

    for (let i = 0; i < maxItems; i++) {
      const book = books[i];

      // Adiciona sugestões de títulos
      if (book.title && book.title.toLowerCase().includes(lowerTerm)) {
        suggestions.add(JSON.stringify({ text: book.title, type: 'título' }));
      }

      // Adiciona sugestões de autores
      if (book.author && book.author.toLowerCase().includes(lowerTerm)) {
        suggestions.add(JSON.stringify({ text: book.author, type: 'autor' }));
      }

      // Adiciona sugestões de áreas
      if (book.area && book.area.toLowerCase().includes(lowerTerm)) {
        suggestions.add(JSON.stringify({ text: book.area, type: 'área' }));
      }

      // Adiciona sugestões de editoras
      if (book.publisher && book.publisher.toLowerCase().includes(lowerTerm)) {
        suggestions.add(JSON.stringify({ text: book.publisher, type: 'editora' }));
      }

      // Limita a 10 sugestões para melhor desempenho
      if (suggestions.size >= 10) break;
    }

    // Converte de volta para objetos
    return Array.from(suggestions).map(s => JSON.parse(s));
  };

  // Debounce para evitar muitas chamadas à API
  const debouncedFetchSuggestions = useMemo(
    () => {
      let timeoutId;
      return (term) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchSearchSuggestions(term);
        }, 300); // 300ms de atraso
      };
    },
    [] // O array vazio garante que a função é criada apenas uma vez
  );

  // Atualiza o termo de busca local
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // Busca sugestões em tempo real
    if (value.trim().length > 1) {
      debouncedFetchSuggestions(value.trim());
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Aplica a busca quando o usuário clica em uma sugestão ou pressiona Enter
  const applySearch = (value = null) => {
    const searchValue = value !== null ? value : localSearchTerm;

    // Se o valor for vazio, não faz nada
    if (!searchValue || !searchValue.trim()) return;

    setIsSearching(true);

    // Atualiza a URL com o novo termo de busca
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');

    // Limpa outros filtros ao aplicar uma busca por sugestão
    // Isso evita conflitos entre os filtros
    if (selectedArea) newSearchParams.set('area', '');
    if (selectedAuthor) newSearchParams.set('author', '');

    // Adiciona o termo de busca
    newSearchParams.set('search', searchValue.trim());

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

  // Seleciona uma sugestão de busca
  const handleSuggestionClick = (suggestion) => {
    setLocalSearchTerm(suggestion);
    applySearch(suggestion);
    // Fecha as sugestões após a seleção
    setShowSuggestions(false);
  };

  // Limpar todos os filtros aplicados
  const clearFilters = () => {
    setSelectedArea('');
    setSelectedAuthor('');
    setSearchTerm('');
    navigate(`${location.pathname}?page=1`);
  };

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
  if (loading) return <p>Carregando livros...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (books.length === 0) return <p>Nenhum livro encontrado.</p>;

  return (
    <div className="list-page-container">
      {/* Cabeçalho da página */}
      <h1>Resumos de Livros</h1>
      <p className="list-page-description">
        Explore resumos, análises e indicações de livros relevantes para a fé e o pensamento cristão.
      </p>

      {/* Controles de filtro */}
      <div className="filter-controls">
        {/* Campo de busca aprimorado */}
        <div className="filter-group search-container">
          <label htmlFor="search-filter">Buscar:</label>
          <div style={{ position: 'relative' }}>
            <input
              id="search-filter"
              type="text"
              placeholder="Buscar por título, autor, descrição..."
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
            {showSuggestions && (
              <div className="search-suggestions visible">
                {isLoadingSuggestions ? (
                  <div className="search-loading">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    Buscando sugestões...
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        data-type={suggestion.type}
                        onMouseDown={() => handleSuggestionClick(suggestion.text)}
                      >
                        <span className="suggestion-text">{suggestion.text}</span>
                        <span className="suggestion-type">{suggestion.type}</span>
                      </div>
                    ))}
                  </>
                ) : localSearchTerm.length > 1 ? (
                  <div className="search-loading">Nenhuma sugestão encontrada</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Filtro por área (seleção única) */}
        <div className="filter-group">
          <label htmlFor="area-filter">Área:</label>
          <select id="area-filter" value={selectedArea} onChange={handleAreaChange}>
            <option value="">Todas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Filtro por autor */}
        <div className="filter-group">
          <label htmlFor="author-filter">Autor:</label>
          <select id="author-filter" value={selectedAuthor} onChange={handleAuthorChange}>
            <option value="">Todos</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
        {(selectedArea || selectedAuthor || searchTerm) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de livros */}
      <div className="content-list">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book._id} style={{ marginBottom: 24 }}>
              <ContentCard
                title={book.title}
                type="Resumo de Livro"
                author={book.author}
                description={book.description}
                detailsUrl={`/livros/${book._id}`}
                pdfUrl={book.pdfUrl}
                coverImageUrl={book.coverImageUrl}
                book={book}
              />
              <div style={{ marginTop: 8, marginLeft: 8 }}>
                <StarRating bookId={book._id} userToken={null} />
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum resumo encontrado com os filtros selecionados.</p>
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

export default Books;