// src/components/Sermons.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ITEMS_PER_PAGE = 8;

function Sermons() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sermons');
        setSermons(response.data);
      } catch (err) {
        setError('Erro ao carregar os sermões. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar sermões:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

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

  // Note: Seu schema de Sermão não tem 'book'. Se você tem um campo 'bibleBook' ou algo similar,
  // precisará usá-lo aqui. Por agora, vou assumir que 'bibleReference' pode ser usado para extrair o livro.
  // Ou, se 'book' é um campo que você pretende adicionar ao schema de sermão:
  // const uniqueBooks = useMemo(() => [...new Set(sermons.map(s => s.bibleReference.split(' ')[0]).filter(Boolean))].sort(), [sermons]);
  // Se 'book' for um campo real no seu modelo de sermão, mantenha 's.book'.
  const uniqueBooks = useMemo(() => {
    // Tentativa de extrair o livro da referência bíblica para o filtro, se 'book' não for um campo direto
    const booksFromReferences = sermons.map(s => s.bibleReference ? s.bibleReference.split(' ')[0].replace(':', '') : '').filter(Boolean);
    return [...new Set(booksFromReferences)].sort();
  }, [sermons]);
  const uniqueSeries = useMemo(() => [...new Set(sermons.map(s => s.series).filter(Boolean))].sort(), [sermons]);

  const filteredSermons = useMemo(() => {
    return sermons.filter(sermon => {
      // Ajuste aqui se 'book' não é um campo direto no seu modelo de sermão e você está filtrando por 'bibleReference'
      const sermonBook = sermon.bibleReference ? sermon.bibleReference.split(' ')[0].replace(':', '') : '';
      const bookMatch = !selectedBook || sermonBook === selectedBook;
      const seriesMatch = !selectedSeries || sermon.series === selectedSeries;
      return bookMatch && seriesMatch;
    });
  }, [selectedBook, selectedSeries, sermons]);

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

  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (sermons.length === 0) return <p>Nenhum sermão encontrado. Adicione um sermão usando sua API de backend!</p>;

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
              key={sermon._id}
              title={sermon.title}
              type="Sermão"
              description={sermon.description}
              detailsUrl={`/sermoes/${sermon._id}`}
              pdfUrl={sermon.pdfUrl}
              reference={sermon.bibleReference}
              sermon={sermon}
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