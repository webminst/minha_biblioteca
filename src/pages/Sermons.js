import React, { useState, useMemo } from 'react';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { sermonsData } from '../data/generatedData';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

const Sermons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}`);
  };

  const handleBookChange = (e) => {
    setSelectedBook(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&book=${e.target.value}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}`);
  };
  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value);
    navigate(`${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${e.target.value ? `&series=${e.target.value}` : ''}`);
  };
  const clearFilters = () => {
    setSelectedBook('');
    setSelectedSeries('');
    navigate(`${location.pathname}?page=1`);
  };

  const uniqueBooks = useMemo(() => [...new Set(sermonsData.map(s => s.book).filter(Boolean))].sort(), []);
  const uniqueSeries = useMemo(() => [...new Set(sermonsData.map(s => s.series).filter(Boolean))].sort(), []);

  const filteredSermons = useMemo(() => {
    return sermonsData.filter(sermon => {
      const bookMatch = !selectedBook || sermon.book === selectedBook;
      const seriesMatch = !selectedSeries || sermon.series === selectedSeries;
      return bookMatch && seriesMatch;
    });
  }, [selectedBook, selectedSeries]);

  const paginatedSermons = useMemo(() => {
    const startIndex = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSermons.slice(startIndex, endIndex);
  }, [filteredSermons, pageFromUrl]);

  const totalPages = Math.ceil(filteredSermons.length / ITEMS_PER_PAGE);

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
      <h1>Sermões</h1>
      <p className="list-page-description">
        Você pode usar, copiar ou distribuir estes esboços desde que o faça gratuitamente. <i>“De graça recebestes, de graça dai”</i> (Mateus 10:8).
      </p>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="book-filter">Livro Bíblico:</label>
          <select id="book-filter" value={selectedBook} onChange={handleBookChange}>
            <option value="">Todos</option>
            {uniqueBooks.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="series-filter">Série:</label>
          <select id="series-filter" value={selectedSeries} onChange={handleSeriesChange}>
            <option value="">Todas</option>
            {uniqueSeries.map(series => (
              <option key={series} value={series}>{series}</option>
            ))}
          </select>
        </div>
        {(selectedBook || selectedSeries) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>
      <div className="content-list">
        {paginatedSermons.length > 0 ? (
          paginatedSermons.map((sermon) => (
            <ContentCard
              key={sermon.id}
              title={sermon.title} type={sermon.type} date={sermon.date}
              reference={sermon.reference} description={sermon.description}
              detailsUrl={sermon.detailsUrl} pdfUrl={sermon.pdfUrl}
            />
          ))
        ) : (
          <p>Nenhum sermão encontrado com os filtros selecionados.</p>
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

export default Sermons;