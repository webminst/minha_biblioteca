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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [uniqueFormats, setUniqueFormats] = useState([]);
  const [uniqueThemes, setUniqueThemes] = useState([]);

  // Busca dados dos estudos na API com filtros e paginação
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);

        // Constrói parâmetros da query
        const params = {
          page: pageFromUrl,
          limit: ITEMS_PER_PAGE
        };

        if (selectedFormat) params.format = selectedFormat;
        if (selectedTheme) params.theme = selectedTheme;
        if (searchTerm) params.search = searchTerm;

        const response = await axios.get(API_ENDPOINTS.STUDIES.BASE, { params });

        // Usa helper para extrair dados de forma compatível
        console.log('[Studies] API response:', response.data);
        const studiesData = extractStudies(response.data);
        const paginationData = extractPagination(response.data);
        console.log('[Studies] studiesData:', studiesData);
        console.log('[Studies] paginationData:', paginationData);
        setStudies(studiesData);
        setPagination(paginationData);
      } catch (err) {
        setError('Erro ao carregar os estudos. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar estudos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [pageFromUrl, selectedFormat, selectedTheme, searchTerm]);

  // Inicializa filtros a partir da URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setSelectedFormat(query.get('format') || '');
    setSelectedTheme(query.get('theme') || '');
    setSearchTerm(query.get('search') || '');
  }, [location.search]);

  // Busca listas únicas para filtros via API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [formatsResponse, themesResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.STUDIES.BASE}/formats`),
          axios.get(`${API_ENDPOINTS.STUDIES.BASE}/themes`)
        ]);

        // Processa resposta dos formatos (compatível com DTO)
        const formatsData = formatsResponse.data.success && formatsResponse.data.data
          ? formatsResponse.data.data
          : (formatsResponse.data || []);

        // Processa resposta dos temas (compatível com DTO)
        const themesData = themesResponse.data.success && themesResponse.data.data
          ? themesResponse.data.data
          : (themesResponse.data || []);

        console.log('DEBUG - formatsData:', formatsData, 'isArray:', Array.isArray(formatsData));
        console.log('DEBUG - themesData:', themesData, 'isArray:', Array.isArray(themesData));

        setUniqueFormats(Array.isArray(formatsData) ? formatsData : []);
        setUniqueThemes(Array.isArray(themesData) ? themesData : []);
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

  // Handlers para mudança de filtros
  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&format=${e.target.value}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
    navigate(`${location.pathname}?page=1${selectedFormat ? `&format=${selectedFormat}` : ''}${e.target.value ? `&theme=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Aplica busca com debounce
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      navigate(`${location.pathname}?page=1${selectedFormat ? `&format=${selectedFormat}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}${e.target.value ? `&search=${e.target.value}` : ''}`);
    }, 500);
    setSearchTimeout(timeout);
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
          <input
            id="search-filter"
            type="text"
            placeholder="Buscar por título, tema, descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
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
            <ContentCard
              key={study._id}
              title={study.title}
              type="Estudo"
              reference={study.reference}
              description={study.description}
              detailsUrl={`/estudos/${study._id}`}
              pdfUrl={study.pdfUrl}
              study={study}
            />
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