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
import { extractBooks, extractPagination } from '../utils/apiResponseHelpers';

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

  // Busca dados dos livros na API com filtros e paginação
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // Constrói parâmetros da query
        const params = {
          page: pageFromUrl,
          limit: ITEMS_PER_PAGE
        };

        if (selectedArea) params.area = selectedArea;
        if (selectedAuthor) params.author = selectedAuthor;
        if (searchTerm) params.search = searchTerm;

        const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, { params });

        // Usa helper para extrair dados de forma compatível
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
  }, [pageFromUrl, selectedArea, selectedAuthor, searchTerm]);

  // Inicializa filtros a partir da URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setSelectedArea(query.get('area') || '');
    setSelectedAuthor(query.get('author') || '');
    setSearchTerm(query.get('search') || '');
  }, [location.search]);

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [areasResponse, authorsResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.BOOKS.BASE}/areas`),
          axios.get(`${API_ENDPOINTS.BOOKS.BASE}/authors`)
        ]);

        // Extrai dados dos filtros, verificando se é DTO ou formato antigo  
        const areas = areasResponse.data.success ? areasResponse.data.data : (areasResponse.data || []);
        const authors = authorsResponse.data.success ? authorsResponse.data.data : (authorsResponse.data || []);

        setUniqueAreas(Array.isArray(areas) ? areas : []);
        setUniqueAuthors(Array.isArray(authors) ? authors : []);
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        // Em caso de erro, mantém arrays vazios
      }
    };

    fetchFilterOptions();
  }, []);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedArea ? `&area=${selectedArea}` : ''}${selectedAuthor ? `&author=${selectedAuthor}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Handlers para mudança de filtros
  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&area=${e.target.value}` : ''}${selectedAuthor ? `&author=${selectedAuthor}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleAuthorChange = (e) => {
    setSelectedAuthor(e.target.value);
    navigate(`${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${e.target.value ? `&author=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Aplica busca com debounce
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      navigate(`${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${selectedAuthor ? `&author=${selectedAuthor}` : ''}${e.target.value ? `&search=${e.target.value}` : ''}`);
    }, 500);
    setSearchTimeout(timeout);
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
        {/* Campo de busca */}
        <div className="filter-group">
          <label htmlFor="search-filter">Buscar:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Buscar por título, autor, descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Filtro por área */}
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
            <ContentCard
              key={book._id}
              title={book.title}
              type="Resumo de Livro"
              reference={`Por ${book.author}`}
              description={book.description}
              detailsUrl={`/livros/${book._id}`}
              pdfUrl={book.pdfUrl}
              coverImageUrl={book.imageUrl}
              book={book}
            />
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