import React, { useState, useMemo } from 'react';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { studiesData } from '../data/generatedData';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const Studies = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

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

  const uniqueFormats = useMemo(() => [...new Set(studiesData.map(s => s.format).filter(Boolean))].sort(), []);
  const uniqueThemes = useMemo(() => [...new Set(studiesData.map(s => s.theme).filter(Boolean))].sort(), []);

  const filteredStudies = useMemo(() => {
    return studiesData.filter(study => {
      const formatMatch = !selectedFormat || study.format === selectedFormat;
      const themeMatch = !selectedTheme || study.theme === selectedTheme;
      return formatMatch && themeMatch;
    });
  }, [selectedFormat, selectedTheme]);

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
              key={study.id}
              title={study.title}
              type={study.type}
              reference={study.reference}
              description={study.description}
              detailsUrl={study.detailsUrl}
              pdfUrl={study.pdfUrl}
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