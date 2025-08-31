// src/components/Sermons.js
import React, { useEffect, useState } from 'react';
import { useSermonsHandlers } from './useSermonsHandlers';
import { generateGlobalSearchSuggestions } from './sermonsUtils';
import { useSermonsData } from './useSermonsData';
import './ListPage.css';
import './Sermons.css';
import SermonsFilters from './SermonsFilters';
import SermonsList from './SermonsList';
import SermonsPagination from './SermonsPagination';
import { useNavigate, useLocation } from 'react-router-dom';
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';

/**
 * Componente Sermons - Página de sermões
 * Exibe lista paginada de sermões com filtros por livro bíblico e série
 * Permite navegação para detalhes e download de PDFs
 */


function Sermons() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai página atual da URL
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get('page') || '1', 10);

  // Estados de controle
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [uniqueBooks, setUniqueBooks] = useState([]);
  const [uniqueSeries, setUniqueSeries] = useState([]);
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Dados dos sermões e paginação
  const { sermons, ratings, loading, error, pagination } = useSermonsData({
    pageFromUrl,
    selectedBook,
    selectedSeries,
    selectedSpeaker,
    searchTerm,
  });

  // Handlers extraídos para hook externo
  const {
    handleBookChange,
    handleSeriesChange,
    handleSpeakerChange,
    handleSearchChange,
    handleKeyDown,
    clearFilters,
  } = useSermonsHandlers({
    setSelectedBook,
    setSelectedSeries,
    setSelectedSpeaker,
    setSearchTerm,
    setLocalSearchTerm,
    navigate,
    location,
    selectedBook,
    selectedSeries,
    selectedSpeaker,
    searchTerm,
    generateGlobalSearchSuggestions,
    setIsSearching,
    setSearchSuggestions,
    setShowSuggestions,
    applySearch: () => {}, // Placeholder, ajuste se necessário
  });


  // Busca listas únicas para filtros via API
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [seriesResponse, speakersResponse, booksResponse] = await Promise.all([
          fetch('/api/sermoes/series'),
          fetch('/api/sermoes/speakers'),
          fetch('/api/sermoes/books'),
        ]);
        const series = (await seriesResponse.json()).data || [];
        const speakers = (await speakersResponse.json()).data || [];
        const books = (await booksResponse.json()).data || [];
        setUniqueSeries(series);
        setUniqueSpeakers(speakers);
        setUniqueBooks(books);
      } catch {
        setUniqueSeries([]);
        setUniqueSpeakers([]);
        setUniqueBooks([]);
      }
    }
    fetchFilterOptions();
  }, []);


  // Funções de paginação
  const totalPages = pagination?.totalPages || 1;
  // Funções estáveis para props
  const goToPage = React.useCallback((pageNumber) => {
    const query = new URLSearchParams(location.search);
    query.set('page', pageNumber);
    navigate(`${location.pathname}?${query.toString()}`);
  }, [location, navigate]);

  const goToNextPage = React.useCallback(() => {
    goToPage(Math.min(pageFromUrl + 1, totalPages));
  }, [goToPage, pageFromUrl, totalPages]);

  const goToPreviousPage = React.useCallback(() => {
    goToPage(Math.max(pageFromUrl - 1, 1));
  }, [goToPage, pageFromUrl]);

  const getPageNumbers = React.useCallback(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  const applySearch = React.useCallback((value = null) => {
    const searchValue = value !== null ? value : localSearchTerm;
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    if (selectedBook) newSearchParams.set('book', selectedBook);
    if (selectedSeries) newSearchParams.set('series', selectedSeries);
    if (selectedSpeaker) newSearchParams.set('speaker', selectedSpeaker);
    if (searchValue) newSearchParams.set('search', searchValue);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
    setShowSuggestions(false);
    setIsSearching(false);
  }, [localSearchTerm, selectedBook, selectedSeries, selectedSpeaker, location.pathname, navigate]);

  // Estados de carregamento e erro
  // Corpo do componente deve estar dentro da função
  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (sermons.length === 0) return <p>Nenhum sermão encontrado.</p>;


  return (
    <div className='list-page-container'>
      {/* Cabeçalho da página */}
      <h1>Sermões</h1>
      <p className='list-page-description'>
        Você pode usar, copiar ou distribuir estes esboços desde que o faça gratuitamente.
        <i>&quot;De graça recebestes, de graça dai&quot;</i> (Mateus 10:8).
      </p>

      {/* Controles de filtro extraídos para componente */}
      <SermonsFilters
        selectedBook={selectedBook}
        selectedSeries={selectedSeries}
        selectedSpeaker={selectedSpeaker}
        searchTerm={searchTerm}
        localSearchTerm={localSearchTerm}
        uniqueBooks={uniqueBooks}
        uniqueSeries={uniqueSeries}
        uniqueSpeakers={uniqueSpeakers}
        isSearching={isSearching}
        searchSuggestions={searchSuggestions}
        showSuggestions={showSuggestions}
        handleBookChange={handleBookChange}
        handleSeriesChange={handleSeriesChange}
        handleSpeakerChange={handleSpeakerChange}
        handleSearchChange={handleSearchChange}
        handleKeyDown={handleKeyDown}
        setShowSuggestions={setShowSuggestions}
        applySearch={applySearch}
        clearFilters={clearFilters}
      />

      {/* Controles de paginação extraídos para componente */}
      <SermonsPagination
        pageFromUrl={pageFromUrl}
        totalPages={totalPages}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        goToPage={goToPage}
        getPageNumbers={getPageNumbers}
      />

      {/* Lista de sermões extraída para componente */}
      <SermonsList sermons={sermons} ratings={ratings} />

      {/* Seção de newsletter */}
      <NewsletterSection />
      <SupportSection />
    </div>
  );
}

export default Sermons;
