import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './ListPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import { extractBooks, extractPagination } from '../utils/apiResponseHelpers';
import FilterControls from '../components/FilterControls';
import BookList from '../components/BookList';
import PaginationControls from '../components/PaginationControls';

function sanitizeAreaValue(value) {
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',')[0].trim();
  }
  return value;
}

function Books() {
  const ITEMS_PER_PAGE = 8;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get('page') || '1', 10);

  // Estados
  const [books, setBooks] = useState([]);
  const [ratings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState(null);
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [uniqueAuthors, setUniqueAuthors] = useState([]);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Busca livros e paginação
  const fetchBooksAndPagination = async ({ locationSearch }) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(locationSearch);
      const searchParam = query.get('search') || '';
      const areaParam = query.get('area') || '';
      const authorParam = query.get('author') || '';
      const pageParam = query.get('page') || '1';
      const params = { page: pageParam, limit: ITEMS_PER_PAGE };
      if (areaParam) params.area = areaParam;
      if (authorParam) params.author = authorParam;
      if (searchParam) params.search = searchParam;
      const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, { params });
      setBooks(extractBooks(response.data));
      setPagination(extractPagination(response.data));
    } catch (err) {
      setError('Erro ao carregar os livros. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndPagination({ locationSearch: location.search });
  }, [location.search, searchTerm]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlSearchTerm = query.get('search') || '';
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
      setLocalSearchTerm(urlSearchTerm);
    }
    setSelectedArea(query.get('area') || '');
    setSelectedAuthor(query.get('author') || '');
  }, [location.search, searchTerm]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const areasResponse = await axios.get(`${API_ENDPOINTS.BOOKS.BASE}/areas`);
        const booksResponse = await axios.get(API_ENDPOINTS.BOOKS.BASE);
        const areas = areasResponse.data.success ? areasResponse.data.data : areasResponse.data || [];
        const books = booksResponse.data.data || [];
        const authors = [...new Set(books.map(book => book.author).filter(author => author && typeof author === 'string' && author.trim() !== ''))].sort();
        setUniqueAreas(Array.isArray(areas) ? areas.filter(a => a && typeof a === 'string').map(a => a.trim()) : []);
        setUniqueAuthors(Array.isArray(authors) ? authors.filter(a => a && typeof a === 'string').map(a => a.trim()) : []);
      } catch (err) {
        setUniqueAreas([]);
        setUniqueAuthors([]);
      }
    };
    fetchFilterOptions();
  }, []);

  // Navegação e handlers memorizados
  const goToPage = useCallback((pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    if (selectedArea) params.set('area', selectedArea);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname, selectedArea, selectedAuthor, searchTerm]);

  const handleAreaChange = useCallback((e) => {
    const value = sanitizeAreaValue(e.target.value);
    setSelectedArea(value);
    const params = new URLSearchParams();
    params.set('page', 1);
    if (value) params.set('area', value);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname, selectedAuthor, searchTerm]);

  const handleAuthorChange = useCallback((e) => {
    setSelectedAuthor(e.target.value);
    navigate(`${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${e.target.value ? `&author=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  }, [navigate, location.pathname, selectedArea, searchTerm]);

  // Handlers para FilterControls
  const handleSearchChange = useCallback(() => { }, []);
  const handleKeyDown = useCallback(() => { }, []);
  const handleSearchFocus = useCallback(() => { }, []);
  const handleSearchBlur = useCallback(() => { }, []);
  const handleSuggestionMouseDown = useCallback(() => { }, []);
  const handleSuggestionKeyPress = useCallback(() => { }, []);
  const clearFilters = useCallback(() => {
    setSelectedArea('');
    setSelectedAuthor('');
    setSearchTerm('');
    navigate(`${location.pathname}?page=1`);
  }, [navigate, location.pathname]);

  const totalPages = pagination?.totalPages || 1;
  const goToNextPage = useCallback(() => goToPage(Math.min(pageFromUrl + 1, totalPages)), [goToPage, pageFromUrl, totalPages]);
  const goToPreviousPage = useCallback(() => goToPage(Math.max(pageFromUrl - 1, 1)), [goToPage, pageFromUrl]);

  // Renderização
  if (loading) return <p>Carregando livros...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (books.length === 0) return <p>Nenhum livro encontrado.</p>;

  return (
    <div className='list-page-container'>
      <h1>Resumos de Livros</h1>
      <p className='list-page-description'>
        Explore resumos, análises e indicações de livros relevantes para a fé e o pensamento cristão.
      </p>
      <FilterControls
        localSearchTerm={localSearchTerm}
        handleSearchChange={handleSearchChange}
        handleKeyDown={handleKeyDown}
        handleSearchFocus={handleSearchFocus}
        handleSearchBlur={handleSearchBlur}
        isSearching={false}
        showSuggestions={false}
        searchSuggestions={[]}
        handleSuggestionMouseDown={handleSuggestionMouseDown}
        handleSuggestionKeyPress={handleSuggestionKeyPress}
        uniqueAreas={uniqueAreas}
        selectedArea={selectedArea}
        handleAreaChange={handleAreaChange}
        uniqueAuthors={uniqueAuthors}
        selectedAuthor={selectedAuthor}
        handleAuthorChange={handleAuthorChange}
        clearFilters={clearFilters}
        searchTerm={searchTerm}
      />
      <BookList books={books} ratings={ratings} />
      {totalPages > 1 && (
        <PaginationControls
          totalPages={totalPages}
          pageFromUrl={pageFromUrl}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          goToPage={goToPage}
        />
      )}
      <NewsletterSection />
      <SupportSection />
    </div>
  );
}

export default Books;
