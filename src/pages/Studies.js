import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';

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

  // Busca dados dos estudos na API
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/studies');
        setStudies(response.data);
      } catch (err) {
        setError('Erro ao carregar os estudos. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar estudos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, []);

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedFormat ? `&format=${selectedFormat}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}`);
  };

  // Handlers para mudança de filtros
  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&format=${e.target.value}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}`);
  };

  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
    navigate(`${location.pathname}?page=1${selectedFormat ? `&format=${selectedFormat}` : ''}${e.target.value ? `&theme=${e.target.value}` : ''}`);
  };

  // Limpar todos os filtros aplicados
  const clearFilters = () => {
    setSelectedFormat('');
    setSelectedTheme('');
    navigate(`${location.pathname}?page=1`);
  };

  // Memoização para otimização de performance
  // Lista única de formatos para o filtro
  const uniqueFormats = useMemo(() => [...new Set(studies.map(s => s.format).filter(Boolean))].sort(), [studies]);

  // Lista única de temas para o filtro
  const uniqueThemes = useMemo(() => [...new Set(studies.map(s => s.theme).filter(Boolean))].sort(), [studies]);

  // Aplicação dos filtros selecionados
  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      const formatMatch = !selectedFormat || study.format === selectedFormat;
      const themeMatch = !selectedTheme || study.theme === selectedTheme;
      return formatMatch && themeMatch;
    });
  }, [selectedFormat, selectedTheme, studies]);

  // Paginação dos estudos filtrados
  const paginatedStudies = useMemo(() => {
    const startIndex = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, pageFromUrl]);

  // Cálculo do total de páginas
  const totalPages = Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);

  // Funções de navegação
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
        {/* Filtro por formato */}
        <div className="filter-group">
          <label htmlFor="format-filter">Formato:</label>
          <select id="format-filter" value={selectedFormat} onChange={handleFormatChange}>
            <option value="">Todos</option>
            {uniqueFormats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {/* Filtro por tema */}
        <div className="filter-group">
          <label htmlFor="theme-filter">Tema:</label>
          <select id="theme-filter" value={selectedTheme} onChange={handleThemeChange}>
            <option value="">Todos</option>
            {uniqueThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
        {(selectedFormat || selectedTheme) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de estudos */}
      <div className="content-list">
        {paginatedStudies.length > 0 ? (
          paginatedStudies.map((study) => (
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