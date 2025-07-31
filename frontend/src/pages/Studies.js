import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import StudyService from '../services/studyService';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import { extractStudies, extractPagination } from '../utils/apiResponseHelpers';

/**
 * Componente Studies - Página de estudos bíblicos
 * Exibe lista paginada de estudos com filtros por formato e tema
 * Permite navegação para detalhes e download de PDFs
 */

// Constante para controle de paginação
const ITEMS_PER_PAGE = 8;

function Studies() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai página atual da URL
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  // Estados para dados e controles
  const [studies, setStudies] = useState([]);
  const [ratings, setRatings] = useState({}); // Armazena as avaliações por estudo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [uniqueFormats, setUniqueFormats] = useState([]);
  const [uniqueThemes, setUniqueThemes] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Busca as avaliações de um estudo
  const fetchStudyRatings = async (studyId) => {
    if (!studyId) {
      console.warn('ID do estudo não fornecido para buscar avaliações');
      return { average: null, total: 0 };
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.STUDIES.BASE}/${studyId}/ratings`);
      
      if (!response.ok) {
        // Se a resposta não for 200-299, verifica se é 404 (estudo sem avaliações)
        if (response.status === 404) {
          return { average: null, total: 0 };
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Garante que os dados retornados tenham o formato esperado
      if (typeof data !== 'object' || data === null) {
        console.warn('Formato de avaliação inválido:', data);
        return { average: null, total: 0 };
      }
      
      return {
        average: typeof data.average === 'number' ? data.average : null,
        total: typeof data.total === 'number' ? data.total : 0
      };
      
    } catch (err) {
      console.error('Erro ao carregar avaliações para o estudo', studyId, ':', err);
      return { average: null, total: 0 };
    }
  };

  // Busca as avaliações para todos os estudos
  const fetchAllRatings = async (studiesList) => {
    const ratingsMap = {};
    
    // Verifica se studiesList é um array e tem itens
    if (!Array.isArray(studiesList) || studiesList.length === 0) {
      console.warn('Nenhum estudo encontrado para buscar avaliações');
      return ratingsMap;
    }

    // Cria um array de promessas para buscar as avaliações em paralelo
    const ratingPromises = studiesList.map(async (study) => {
      try {
        const ratingData = await fetchStudyRatings(study._id);
        return { id: study._id, data: ratingData };
      } catch (error) {
        console.error(`Erro ao buscar avaliações para o estudo ${study._id}:`, error);
        return { id: study._id, data: { average: null, total: 0 } };
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

  // Busca dados dos estudos na API com filtros e paginação
  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_ENDPOINTS.STUDIES.BASE, {
          params: {
            page: pageFromUrl,
            limit: ITEMS_PER_PAGE,
            ...(selectedFormat && { format: selectedFormat }),
            ...(selectedTheme && { theme: selectedTheme }),
            ...(searchTerm && { search: searchTerm })
          }
        });

        // Extrai os estudos e garante que seja um array
        const extractedData = extractStudies(response.data);
        const studiesList = Array.isArray(extractedData) ? extractedData : [];
        
        setStudies(studiesList);
        
        // Extrai os dados de paginação
        const paginationData = extractPagination(response.data) || {};
        setPagination(paginationData);

        // Busca as avaliações para os estudos
        const ratingsMap = await fetchAllRatings(studiesList);
        setRatings(ratingsMap);

        // Extrai formatos e temas únicos para os filtros
        const formats = [...new Set(studiesList.map(study => study?.format).filter(Boolean))];
        const themes = [...new Set(studiesList.map(study => study?.theme).filter(Boolean))];
        
        setUniqueFormats(formats);
        setUniqueThemes(themes);
      } catch (err) {
        console.error('Erro ao buscar estudos:', err);
        setError('Erro ao carregar os estudos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [pageFromUrl, selectedFormat, selectedTheme, searchTerm]);

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
    setSelectedFormat(query.get('format') || '');
    setSelectedTheme(query.get('theme') || '');
  }, [location.search]);

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [formats, themes] = await Promise.all([
          StudyService.getFormats(),
          StudyService.getThemes()
        ]);

        console.log('DEBUG - formats:', formats, 'isArray:', Array.isArray(formats));
        console.log('DEBUG - themes:', themes, 'isArray:', Array.isArray(themes));

        setUniqueFormats(Array.isArray(formats) ? formats : []);
        setUniqueThemes(Array.isArray(themes) ? themes : []);
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        // Em caso de erro, mantém arrays vazios
      }
    };

    fetchFilterOptions();
  }, []);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedFormat ? `&format=${selectedFormat}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Gera sugestões de busca com fallback local (igual Sermons)
  const generateSearchSuggestions = async (term) => {
    if (!term.trim()) return [];

    try {
      // Tenta buscar sugestões no backend primeiro
      const response = await axios.get(`${API_ENDPOINTS.STUDIES.BASE}/suggestions`, {
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
      console.warn('Usando busca global para sugestões. Considerar implementar o endpoint /suggestions no backend para melhor desempenho.');
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
      // Busca os primeiros 100 estudos que contenham o termo
      const response = await axios.get(API_ENDPOINTS.STUDIES.BASE, {
        params: { search: term, page: 1, limit: 100 },
        validateStatus: status => status >= 200 && status < 500
      });
      const studiesList = Array.isArray(response.data.data) ? response.data.data : [];
      const lowerTerm = term.toLowerCase();
      const suggestions = new Set();
      for (let i = 0; i < studiesList.length; i++) {
        const study = studiesList[i];
        if (study.title && study.title.toLowerCase().includes(lowerTerm)) {
          suggestions.add(study.title);
        }
        if (study.author && study.author.toLowerCase().includes(lowerTerm)) {
          suggestions.add(study.author);
        }
        if (study.reference && study.reference.toLowerCase().includes(lowerTerm)) {
          suggestions.add(study.reference);
        }
        if (suggestions.size >= 5) break;
      }
      return Array.from(suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões globais:', error);
      return [];
    }
  };

  // Gera sugestões localmente (usado como fallback)
  const generateLocalSearchSuggestions = (term) => {
    if (!term.trim() || !studies || studies.length === 0) return [];

    const lowerTerm = term.toLowerCase();
    const suggestions = new Set();

    // Limita a busca aos primeiros 100 itens para performance
    const maxItems = Math.min(100, studies.length);

    for (let i = 0; i < maxItems; i++) {
      const study = studies[i];

      // Adiciona sugestões de títulos
      if (study.title && study.title.toLowerCase().includes(lowerTerm)) {
        suggestions.add(study.title);
      }

      // Adiciona sugestões de temas
      if (study.theme && study.theme.toLowerCase().includes(lowerTerm)) {
        suggestions.add(study.theme);
      }

      // Adiciona sugestões de referências
      if (study.reference && study.reference.toLowerCase().includes(lowerTerm)) {
        suggestions.add(study.reference);
      }

      // Limita a 5 sugestões para melhor desempenho
      if (suggestions.size >= 5) break;
    }

    return Array.from(suggestions);
  };

  // Handlers para mudança de filtros
  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&format=${e.target.value}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
    navigate(`${location.pathname}?page=1${selectedFormat ? `&format=${selectedFormat}` : ''}${e.target.value ? `&theme=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  // Atualiza o termo de busca local
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // Gera sugestões em tempo real
    if (value.length > 1) {
      const suggestions = await generateSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
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

    if (selectedFormat) newSearchParams.set('format', selectedFormat);
    if (selectedTheme) newSearchParams.set('theme', selectedTheme);

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
    setSelectedFormat('');
    setSelectedTheme('');
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
  if (loading) return <p>Carregando estudos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (studies.length === 0) return <p>Nenhum estudo encontrado.</p>;

  return (
    <div className="list-page-container">
      {/* Cabeçalho da página */}
      <h1>Estudos Bíblicos</h1>
      <p className="list-page-description">
        Aprofunde seu conhecimento da Palavra com estudos temáticos, panoramas bíblicos e devocionais.
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
              placeholder="Buscar por título, descrição..."
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

        {/* Filtro por formato */}
        <div className="filter-group">
          <label htmlFor="format-filter">Formato:</label>
          <select id="format-filter" value={selectedFormat} onChange={handleFormatChange}>
            <option value="">Todos</option>
            {Array.isArray(uniqueFormats) && uniqueFormats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {/* Filtro por tema */}
        <div className="filter-group">
          <label htmlFor="theme-filter">Tema:</label>
          <select id="theme-filter" value={selectedTheme} onChange={handleThemeChange}>
            <option value="">Todos</option>
            {Array.isArray(uniqueThemes) && uniqueThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
        {(selectedFormat || selectedTheme || searchTerm) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de estudos */}
      <div className="content-list">
        {studies.length > 0 ? (
          studies.map((study) => (
            <div key={study._id} style={{ marginBottom: 24 }}>
              <ContentCard
                title={study.title}
                type={study.format || 'Estudo'}
                reference={study.reference}
                description={study.description}
                detailsUrl={`/estudos/${study._id}`}
                pdfUrl={study.pdfUrl}
                study={study}
                rating={ratings[study._id] ? {
                  average: ratings[study._id].average,
                  total: ratings[study._id].total
                } : null}
              />
            </div>
          ))
        ) : (
          <p>Nenhum estudo encontrado com os filtros selecionados.</p>
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

export default Studies;