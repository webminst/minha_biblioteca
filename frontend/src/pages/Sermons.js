// src/components/Sermons.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { generateGlobalSearchSuggestions } from './sermonsUtils';
import './ListPage.css';
import './Sermons.css';
import SermonsFilters from './SermonsFilters';
import SermonsList from './SermonsList';
import SermonsPagination from './SermonsPagination';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const pageFromUrl = parseInt(query.get('page') || '1', 10);

  // Estados para dados e controles
  const [sermons, setSermons] = useState([]);
  const [ratings, setRatings] = useState({}); // Armazena as avaliações por sermão
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const [pagination, setPagination] = useState(null);
  const [uniqueBooks, setUniqueBooks] = useState([]);
  const [uniqueSeries, setUniqueSeries] = useState([]);
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Busca as avaliações de um sermão
  const fetchSermonRatings = async sermonId => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SERMONS.BASE}/${sermonId}/ratings`,
      );
      if (!response.ok) {
        throw new Error(
          `Erro ao carregar avaliações para o sermão ${sermonId}`,
        );
      }
      const data = await response.json();
      // Garante que a resposta tem o formato esperado
      if (data.sucesso === false) {
        return { average: null, total: 0 };
      }
      return data.dados || { average: null, total: 0 };
    } catch (err) {
      return { average: null, total: 0 };
    }
  };

  // Busca as avaliações para todos os sermões
  const fetchAllRatings = async sermonsList => {
    if (!Array.isArray(sermonsList) || sermonsList.length === 0) {
      return {};
    }

    const ratingsMap = {};

    // Cria um array de promessas para buscar as avaliações em paralelo
    const ratingPromises = sermonsList.map(async sermon => {
      try {
        const ratingData = await fetchSermonRatings(sermon._id);
        return { id: sermon._id, data: ratingData };
      } catch (error) {
        return { id: sermon._id, data: { average: null, total: 0 } };
      }
    });

    // Aguarda todas as requisições serem concluídas
    const ratings = await Promise.all(ratingPromises);

    // Preenche o mapa de avaliações
    ratings.forEach(({ id, data }) => {
      ratingsMap[id] = data;
    });

    return ratingsMap;
  };

  // Busca dados dos sermões na API com filtros e paginação
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);

        // Constrói parâmetros da query
        const params = {
          page: pageFromUrl,
          limit: ITEMS_PER_PAGE,
        };

        if (selectedBook) params.book = selectedBook;
        if (selectedSeries) params.series = selectedSeries;
        if (selectedSpeaker) params.speaker = selectedSpeaker;
        if (searchTerm) params.search = searchTerm;

        const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, {
          params,
        });

        // Usa helpers para extrair dados e paginação
        const sermonsData = extractSermons(response.data);
        const paginationData = extractPagination(response.data);

        // Atualiza a lista de sermões e paginação
        setSermons(sermonsData);
        setPagination(paginationData);

        // Busca as avaliações para os sermões
        const ratingsMap = await fetchAllRatings(sermonsData);
        setRatings(ratingsMap);

      } catch (err) {
        setError(
          'Erro ao carregar os sermões. Por favor, tente novamente mais tarde.',
        );
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
  const goToPage = pageNumber => {
    navigate(
      `${location.pathname}?page=${pageNumber}${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  };

  // Busca sugestões de busca no backend ou usa busca local como fallback
  const generateSearchSuggestions = async term => {
    if (!term.trim()) return [];

    try {
      // Tenta buscar sugestões no backend primeiro
      const response = await axios.get(
        `${API_ENDPOINTS.SERMONS.BASE}/suggestions`,
        {
          params: { q: term, limit: 5 },
          validateStatus: status => status >= 200 && status < 500,
        },
      );

      // Verifica se a resposta tem o formato esperado
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.data)
        ) {
          return response.data.data;
        }
      }

      // Se chegou aqui, o endpoint de sugestões não está disponível ou retornou um formato inválido
      // Usa busca global como fallback
      return await generateGlobalSearchSuggestions(term, API_ENDPOINTS);
    } catch (error) {
      // Em caso de erro, usa busca global como fallback
      return await generateGlobalSearchSuggestions(term, API_ENDPOINTS);
    }
  };

  // Busca sugestões globalmente na API (fallback global)

  // Handlers para mudança de filtros
  const handleBookChange = e => {
    setSelectedBook(e.target.value);
    navigate(
      `${location.pathname}?page=1${e.target.value ? `&book=${e.target.value}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  };

  const handleSeriesChange = e => {
    setSelectedSeries(e.target.value);
    navigate(
      `${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${e.target.value ? `&series=${e.target.value}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  };

  const handleSpeakerChange = e => {
    setSelectedSpeaker(e.target.value);
    navigate(
      `${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${e.target.value ? `&speaker=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  };

  // Atualiza o termo de busca local
  const handleSearchChange = async e => {
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
  const handleKeyDown = e => {
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
    setLocalSearchTerm('');
    navigate(`${location.pathname}?page=1`);
  };

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Busca séries, pregadores e livros bíblicos diretamente dos endpoints da API
        const [seriesResponse, speakersResponse, booksResponse] =
          await Promise.all([
            axios.get(`${API_ENDPOINTS.SERMONS.BASE}/series`),
            axios.get(`${API_ENDPOINTS.SERMONS.BASE}/speakers`),
            axios.get(`${API_ENDPOINTS.SERMONS.BASE}/books`),
          ]);


        // Extrai dados dos filtros, verificando se é DTO ou formato antigo
        const series = seriesResponse.data.success
          ? seriesResponse.data.data
          : Array.isArray(seriesResponse.data)
            ? seriesResponse.data
            : [];
        const speakers = speakersResponse.data.success
          ? speakersResponse.data.data
          : Array.isArray(speakersResponse.data)
            ? speakersResponse.data
            : [];
        const books = booksResponse.data.success
          ? booksResponse.data.data
          : Array.isArray(booksResponse.data)
            ? booksResponse.data
            : [];


        // Atualiza os estados com os dados obtidos
        setUniqueSeries(series);
        setUniqueSpeakers(speakers);
        setUniqueBooks(books);
      } catch (err) {
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
