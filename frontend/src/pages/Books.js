import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import { extractBooks, extractPagination } from '../utils/apiResponseHelpers';

/**
 * Componente Books - Página de resumos de livros
 * Exibe lista paginada de resumos de livros com filtros por área e autor
 * Permite navegação para detalhes e download de PDFs
 */

// Constante para controle de paginação
const ITEMS_PER_PAGE = 8;

function Books() {
  function handleSearchFocus() {
    if (localSearchTerm.length > 1) setShowSuggestions(true);
  }

  function handleSearchBlur() {
    setTimeout(() => setShowSuggestions(false), 200);
  }

  function handleSuggestionMouseDown(value) {
    return function () {
      handleSuggestionClick(value);
    };
  }

  function handleSuggestionKeyPress(value) {
    return function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        handleSuggestionClick(value);
      }
    };
  }
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai página atual da URL
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get('page') || '1', 10);

  // Estados para dados e controles
  const [books, setBooks] = useState([]);
  const [ratings] = useState({}); // Armazena as avaliações por livro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState(null);
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [uniqueAuthors, setUniqueAuthors] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Helper to fetch books and pagination
  const fetchBooksAndPagination = async ({
    locationSearch,
    setBooks,
    setPagination,
    setError,
    setLoading,
  }) => {
    try {
      setLoading(true);

      // Constrói parâmetros da query a partir da URL
      const query = new URLSearchParams(locationSearch);
      const searchParam = query.get('search') || '';
      const areaParam = query.get('area') || '';
      const authorParam = query.get('author') || '';
      const pageParam = query.get('page') || '1';

      const params = {
        page: pageParam,
        limit: ITEMS_PER_PAGE,
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
      setError(
        'Erro ao carregar os livros. Por favor, tente novamente mais tarde.',
      );
      // Erro ao buscar livros
    } finally {
      setLoading(false);
    }
  };

  // Busca dados dos livros na API com filtros e paginação
  useEffect(() => {
    fetchBooksAndPagination({
      locationSearch: location.search,
      setBooks,
      setPagination,
      setError,
      setLoading,
    });
  }, [location.search, searchTerm]);

  // Busca as avaliações de um livro
  // ...código existente...
  // ...existing code...

  // ...existing code...

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
        // Buscando opções de filtro

        // Buscando as áreas
        const areasResponse = await axios.get(
          `${API_ENDPOINTS.BOOKS.BASE}/areas`,
        );
        // Resposta da API - Áreas (raw)

        // Buscando os livros para extrair os autores
        const booksResponse = await axios.get(API_ENDPOINTS.BOOKS.BASE);
        // Resposta completa da API de livros

        // Extrai as áreas da resposta
        const areas = areasResponse.data.success
          ? areasResponse.data.data
          : areasResponse.data || [];

        // Extrai os livros da resposta - agora acessando corretamente a propriedade data
        const books = booksResponse.data.data || [];
        // Lista de livros extraída

        // Extrai os autores únicos dos livros
        const authors = [
          ...new Set(
            books
              .map(book => {
                // Livro atual
                return book.author;
              })
              .filter(author => {
                const isValid =
                  author && typeof author === 'string' && author.trim() !== '';
                // Autor é válido
                return isValid;
              }),
          ),
        ].sort(); // Ordena os autores alfabeticamente

        // Autores extraídos dos livros

        // Tipo de áreas
        // Tipo de autores

        // Usando JSON.stringify para ver o conteúdo completo dos arrays
        // Conteúdo completo de áreas
        // Conteúdo completo de autores

        // Primeiros 5 itens de áreas
        // Primeiros 5 itens de autores

        // Garantir que estamos lidando com arrays e que os itens são strings
        const areasArray = Array.isArray(areas)
          ? areas.filter(a => a && typeof a === 'string').map(a => a.trim())
          : [];
        const authorsArray = Array.isArray(authors)
          ? authors.filter(a => a && typeof a === 'string').map(a => a.trim())
          : [];

        // Áreas após limpeza
        // Autores após limpeza

        setUniqueAreas(areasArray);
        setUniqueAuthors(authorsArray);
      } catch (err) {
        // Erro ao buscar opções de filtro
        // Em caso de erro, mantém arrays vazios
      }
    };

    fetchFilterOptions();
  }, []);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = pageNumber => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    if (selectedArea) params.set('area', selectedArea);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Handlers para mudança de filtros
  const handleAreaChange = e => {
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

  const handleAuthorChange = e => {
    setSelectedAuthor(e.target.value);
    navigate(
      `${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${e.target.value ? `&author=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  };

  // Busca sugestões globalmente na API (fallback global)
  const generateGlobalSearchSuggestions = async term => {
    if (!term.trim()) return [];
    try {
      // Busca os primeiros 100 livros que contenham o termo
      const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, {
        params: { search: term, page: 1, limit: 100 },
        validateStatus: status => status >= 200 && status < 500,
      });
      const booksList = Array.isArray(response.data.data)
        ? response.data.data
        : [];
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
        if (
          book.reference &&
          book.reference.toLowerCase().includes(lowerTerm)
        ) {
          suggestions.add(
            JSON.stringify({ text: book.reference, type: 'referência' }),
          );
        }
        if (suggestions.size >= 10) break;
      }
      return Array.from(suggestions).map(s => JSON.parse(s));
    } catch (error) {
      // Erro ao buscar sugestões globais
      return [];
    }
  };

  // ...existing code...

  // Debounce para evitar muitas chamadas à API
  const debouncedFetchSuggestions = useMemo(() => {
    let timeoutId;
    return function (term) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Definir fetchSearchSuggestions localmente para evitar dependência externa
        if (!term.trim()) {
          setSearchSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        (async () => {
          try {
            const response = await axios.get(
              `${API_ENDPOINTS.BOOKS.BASE}/suggestions`,
              {
                params: { q: term, limit: 5 },
                validateStatus: status => status >= 200 && status < 500,
              },
            );
            if (response.status === 200) {
              if (Array.isArray(response.data)) {
                setSearchSuggestions(
                  response.data.map(s => ({ text: s, type: 'Sugestão' })),
                );
                setShowSuggestions(response.data.length > 0);
                return;
              } else if (
                response.data &&
                response.data.success &&
                Array.isArray(response.data.data)
              ) {
                setSearchSuggestions(
                  response.data.data.map(s => ({ text: s, type: 'Sugestão' })),
                );
                setShowSuggestions(response.data.data.length > 0);
                return;
              }
            }
            // Fallback global
            const globalSuggestions =
              await generateGlobalSearchSuggestions(term);
            setSearchSuggestions(globalSuggestions);
            setShowSuggestions(globalSuggestions.length > 0);
          } catch (error) {
            // Fallback global em caso de erro
            const globalSuggestions =
              await generateGlobalSearchSuggestions(term);
            setSearchSuggestions(globalSuggestions);
            setShowSuggestions(globalSuggestions.length > 0);
          }
        })();
      }, 300);
    };
  }, []);
  // Atualiza o termo de busca local
  const handleSearchChange = e => {
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
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };

  // Seleciona uma sugestão de busca
  const handleSuggestionClick = suggestion => {
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
    <div className='list-page-container'>
      {/* Cabeçalho da página */}
      <h1>Resumos de Livros</h1>
      <p className='list-page-description'>
        Explore resumos, análises e indicações de livros relevantes para a fé e
        o pensamento cristão.
      </p>

      {/* Controles de filtro */}
      <div className='filter-controls'>
        {/* Campo de busca aprimorado */}
        <div className='filter-group search-container'>
          <label htmlFor='search-filter'>Buscar:</label>
          <div style={{ position: 'relative' }}>
            <input
              id='search-filter'
              type='text'
              placeholder='Buscar por título, autor, descrição...'
              value={localSearchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={`search-input ${localSearchTerm ? 'search-active' : ''}`}
              autoComplete='off'
            />
            <div className='search-icon-container'>
              {isSearching ? (
                <div
                  className='spinner-border spinner-border-sm text-muted'
                  role='status'
                >
                  <span className='visually-hidden'>Carregando...</span>
                </div>
              ) : (
                <i className='fas fa-search'></i>
              )}
            </div>
            {/* Sugestões de busca */}
            {showSuggestions && (
              <div className='search-suggestions visible'>
                {searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map(suggestion => (
                      <div
                        key={suggestion.text + suggestion.type}
                        className='suggestion-item'
                        data-type={suggestion.type}
                        onMouseDown={handleSuggestionMouseDown(suggestion.text)}
                        role='button'
                        tabIndex={0}
                        onKeyPress={handleSuggestionKeyPress(suggestion.text)}
                      >
                        <span className='suggestion-text'>
                          {suggestion.text}
                        </span>
                        <span className='suggestion-type'>
                          {suggestion.type}
                        </span>
                      </div>
                    ))}
                  </>
                ) : localSearchTerm.length > 1 ? (
                  <div className='search-loading'>
                    Nenhuma sugestão encontrada
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Filtro por área */}
        <div className='filter-group'>
          <label htmlFor='area-filter'>Área:</label>
          <select
            id='area-filter'
            value={selectedArea}
            onChange={handleAreaChange}
          >
            <option value=''>Todas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por autor */}
        <div className='filter-group'>
          <label htmlFor='author-filter'>Autor:</label>
          <select
            id='author-filter'
            value={selectedAuthor}
            onChange={handleAuthorChange}
          >
            <option value=''>Todos</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros */}
        {(selectedArea || selectedAuthor || searchTerm) && (
          <button onClick={clearFilters} className='clear-filter-button'>
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de livros */}
      <div className='content-list'>
        {books.length > 0 ? (
          books.map(book => (
            <div key={book._id} style={{ marginBottom: 24 }}>
              <ContentCard
                title={book.title}
                type='Resumo de Livro'
                author={book.author}
                description={book.description}
                detailsUrl={`/livros/${book._id}`}
                pdfUrl={book.pdfUrl}
                coverImageUrl={book.coverImageUrl}
                book={book}
                rating={
                  ratings[book._id]
                    ? {
                      average: ratings[book._id].average,
                      total: ratings[book._id].total,
                    }
                    : null
                }
              />
            </div>
          ))
        ) : (
          <p>Nenhum resumo encontrado com os filtros selecionados.</p>
        )}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className='pagination-controls'>
          <button
            onClick={goToPreviousPage}
            disabled={pageFromUrl === 1}
            className='pagination-button'
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
          </button>
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
          <button
            onClick={goToNextPage}
            disabled={pageFromUrl === totalPages}
            className='pagination-button'
          >
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
