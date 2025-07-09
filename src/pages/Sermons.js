// src/components/Sermons.js
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
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  // Estados para dados e controles
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  // Busca dados dos sermões na API
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/sermons');
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

  // Função para navegar entre páginas mantendo filtros
  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}`);
  };

  // Handlers para mudança de filtros
  const handleBookChange = (e) => {
    setSelectedBook(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&book=${e.target.value}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}`);
  };

  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value);
    navigate(`${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${e.target.value ? `&series=${e.target.value}` : ''}`);
  };

  // Limpar todos os filtros aplicados
  const clearFilters = () => {
    setSelectedBook('');
    setSelectedSeries('');
    navigate(`${location.pathname}?page=1`);
  };

  // Memoização para otimização de performance
  // Extrai livros bíblicos únicos das referências bíblicas
  const uniqueBooks = useMemo(() => {
    const booksFromReferences = sermons
      .map(s => s.bibleReference ? s.bibleReference.split(' ')[0].replace(':', '') : '')
      .filter(Boolean);
    return [...new Set(booksFromReferences)].sort();
  }, [sermons]);

  // Lista única de séries para o filtro
  const uniqueSeries = useMemo(() => [...new Set(sermons.map(s => s.series).filter(Boolean))].sort(), [sermons]);

  // Aplicação dos filtros selecionados
  const filteredSermons = useMemo(() => {
    return sermons.filter(sermon => {
      // Extrai livro bíblico da referência
      const sermonBook = sermon.bibleReference ? sermon.bibleReference.split(' ')[0].replace(':', '') : '';
      const bookMatch = !selectedBook || sermonBook === selectedBook;
      const seriesMatch = !selectedSeries || sermon.series === selectedSeries;
      return bookMatch && seriesMatch;
    });
  }, [selectedBook, selectedSeries, sermons]);

  // Paginação dos sermões filtrados
  const paginatedSermons = useMemo(() => {
    const startIndex = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSermons.slice(startIndex, endIndex);
  }, [filteredSermons, pageFromUrl]);

  // Cálculo do total de páginas
  const totalPages = Math.ceil(filteredSermons.length / ITEMS_PER_PAGE);

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
  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (sermons.length === 0) return <p>Nenhum sermão encontrado.</p>;

  return (
    <div className="list-page-container">
      {/* Cabeçalho da página */}
      <h1>Sermões</h1>
      <p className="list-page-description">
        Você pode usar, copiar ou distribuir estes esboços desde que o faça gratuitamente.
        <i>"De graça recebestes, de graça dai"</i> (Mateus 10:8).
      </p>

      {/* Controles de filtro */}
      <div className="filter-controls">
        {/* Filtro por livro bíblico */}
        <div className="filter-group">
          <label htmlFor="book-filter">Livro Bíblico:</label>
          <select id="book-filter" value={selectedBook} onChange={handleBookChange}>
            <option value="">Todos</option>
            {uniqueBooks.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>

        {/* Filtro por série */}
        <div className="filter-group">
          <label htmlFor="series-filter">Série:</label>
          <select id="series-filter" value={selectedSeries} onChange={handleSeriesChange}>
            <option value="">Todas</option>
            {uniqueSeries.map(series => (
              <option key={series} value={series}>{series}</option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
        {(selectedBook || selectedSeries) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Lista de sermões */}
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

export default Sermons;