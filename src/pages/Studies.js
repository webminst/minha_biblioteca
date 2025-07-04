import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

function Studies() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/studies');
        setStudies(response.data);
      } catch (err) {
        setError('Erro ao carregar os estudos.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedFormat ? `&format=${selectedFormat}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}`);
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&format=${e.target.value}` : ''}${selectedTheme ? `&theme=${selectedTheme}` : ''}`);
  };
  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
    navigate(`${location.pathname}?page=1${selectedFormat ? `&format=${selectedFormat}` : ''}${e.target.value ? `&theme=${e.target.value}` : ''}`);
  };
  const clearFilters = () => {
    setSelectedFormat('');
    setSelectedTheme('');
    navigate(`${location.pathname}?page=1`);
  };

  const uniqueFormats = useMemo(() => [...new Set(studies.map(s => s.format).filter(Boolean))].sort(), [studies]);
  const uniqueThemes = useMemo(() => [...new Set(studies.map(s => s.theme).filter(Boolean))].sort(), [studies]);

  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      const formatMatch = !selectedFormat || study.format === selectedFormat;
      const themeMatch = !selectedTheme || study.theme === selectedTheme;
      return formatMatch && themeMatch;
    });
  }, [selectedFormat, selectedTheme, studies]);

  const paginatedStudies = useMemo(() => {
    const startIndex = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, pageFromUrl]);

  const totalPages = Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);

  const goToNextPage = () => goToPage(Math.min(pageFromUrl + 1, totalPages));
  const goToPreviousPage = () => goToPage(Math.max(pageFromUrl - 1, 1));

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading) return <p>Carregando estudos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (studies.length === 0) return <p>Nenhum estudo encontrado.</p>;

  return (
    <div className="list-page-container">
      <h1>Estudos Bíblicos</h1>
      <p className="list-page-description">
        Aprofunde seu conhecimento da Palavra com estudos temáticos, panoramas bíblicos e devocionais.
      </p>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="format-filter">Formato:</label>
          <select id="format-filter" value={selectedFormat} onChange={handleFormatChange}>
            <option value="">Todos</option>
            {uniqueFormats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="theme-filter">Tema:</label>
          <select id="theme-filter" value={selectedTheme} onChange={handleThemeChange}>
            <option value="">Todos</option>
            {uniqueThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>
        {(selectedFormat || selectedTheme) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>
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
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={goToPreviousPage} disabled={pageFromUrl === 1} className="pagination-button">
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
          <button onClick={goToNextPage} disabled={pageFromUrl === totalPages} className="pagination-button">
            Próxima <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Studies;