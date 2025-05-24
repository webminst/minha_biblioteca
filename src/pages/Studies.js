// src/pages/Studies.js
import React, { useState, useMemo } from 'react';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { studiesData } from '../data/generatedData'; // NOVA LINHA para atualizar os dados
import './ListPage.css'; // Reutiliza o mesmo CSS de lista

const ITEMS_PER_PAGE = 6; // Defina quantos itens por página

const Studies = () => {
  // --- Estados para os Filtros ---
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  // --- Estado para a Página Atual ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- Extrair Opções Únicas ---
  const uniqueFormats = useMemo(() => {
    return [...new Set(studiesData.map(s => s.format).filter(Boolean))].sort();
  }, []);

  const uniqueThemes = useMemo(() => {
    return [...new Set(studiesData.map(s => s.theme).filter(Boolean))].sort();
  }, []);

  // --- Lógica de Filtragem ---
  const filteredStudies = useMemo(() => {
    return studiesData.filter(study => {
      const formatMatch = !selectedFormat || study.format === selectedFormat;
      const themeMatch = !selectedTheme || study.theme === selectedTheme;
      return formatMatch && themeMatch;
    });
  }, [selectedFormat, selectedTheme]);

  // --- Lógica de Paginação ---
  const paginatedStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, currentPage]);

  const totalPages = Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);

  // --- Handlers para mudança nos selects e Limpar Filtros ---
  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página
  };
  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página
  };
  const clearFilters = () => {
    setSelectedFormat('');
    setSelectedTheme('');
    setCurrentPage(1); // Reseta para a primeira página
  };

  // --- Handlers para Paginação ---
  const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

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

      {/* --- Controles de Filtro --- */}
      <div className="filter-controls">
        {/* Filtro por Formato */}
        <div className="filter-group">
          <label htmlFor="format-filter">Formato:</label>
          <select id="format-filter" value={selectedFormat} onChange={handleFormatChange}>
            <option value="">Todos</option>
            {uniqueFormats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tema */}
        <div className="filter-group">
          <label htmlFor="theme-filter">Tema:</label>
          <select id="theme-filter" value={selectedTheme} onChange={handleThemeChange}>
            <option value="">Todos</option>
            {uniqueThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        {/* Botão Limpar Filtros */}
        {(selectedFormat || selectedTheme) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>
      {/* --- Fim dos Filtros --- */}

      {/* --- Lista de Conteúdo --- */}
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

      {/* --- Controles de Paginação --- */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={goToPreviousPage} disabled={currentPage === 1} className="pagination-button">
            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
          </button>
          {getPageNumbers().map(number => (
            <button
              key={number}
              onClick={() => goToPage(number)}
              className={`pagination-button page-number ${currentPage === number ? 'active' : ''}`}
              disabled={currentPage === number}
            >
              {number}
            </button>
          ))}
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="pagination-button">
            Próxima <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
      {/* --- Fim dos Controles de Paginação --- */}
    </div>
  );
};

export default Studies;