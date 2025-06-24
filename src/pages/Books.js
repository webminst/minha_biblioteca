import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ListPage.css';
import { useNavigate, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

function Books() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page") || "1", 10);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/books');
        setBooks(response.data);
      } catch (err) {
        setError('Erro ao carregar os livros.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const goToPage = (pageNumber) => {
    navigate(`${location.pathname}?page=${pageNumber}${selectedArea ? `&area=${selectedArea}` : ''}${selectedAuthor ? `&author=${selectedAuthor}` : ''}`);
  };

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    navigate(`${location.pathname}?page=1${e.target.value ? `&area=${e.target.value}` : ''}${selectedAuthor ? `&author=${selectedAuthor}` : ''}`);
  };
  const handleAuthorChange = (e) => {
    setSelectedAuthor(e.target.value);
    navigate(`${location.pathname}?page=1${selectedArea ? `&area=${selectedArea}` : ''}${e.target.value ? `&author=${e.target.value}` : ''}`);
  };
  const clearFilters = () => {
    setSelectedArea('');
    setSelectedAuthor('');
    navigate(`${location.pathname}?page=1`);
  };

  const uniqueAreas = useMemo(() => [...new Set(books.map(b => b.area).filter(Boolean))].sort(), [books]);
  const uniqueAuthors = useMemo(() => [...new Set(books.map(b => b.author).filter(Boolean))].sort(), [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const areaMatch = !selectedArea || book.area === selectedArea;
      const authorMatch = !selectedAuthor || book.author === selectedAuthor;
      return areaMatch && authorMatch;
    });
  }, [selectedArea, selectedAuthor, books]);

  const paginatedBooks = useMemo(() => {
    const startIndex = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, pageFromUrl]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  const goToNextPage = () => goToPage(Math.min(pageFromUrl + 1, totalPages));
  const goToPreviousPage = () => goToPage(Math.max(pageFromUrl - 1, 1));

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading) return <p>Carregando livros...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (books.length === 0) return <p>Nenhum livro encontrado.</p>;

  return (
    <div className="list-page-container">
      <h1>Resumos de Livros</h1>
      <p className="list-page-description">
        Explore resumos, análises e indicações de livros relevantes para a fé e o pensamento cristão.
      </p>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="area-filter">Área:</label>
          <select id="area-filter" value={selectedArea} onChange={handleAreaChange}>
            <option value="">Todas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="author-filter">Autor:</label>
          <select id="author-filter" value={selectedAuthor} onChange={handleAuthorChange}>
            <option value="">Todos</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
        {(selectedArea || selectedAuthor) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>
      <div className="content-list">
        {paginatedBooks.length > 0 ? (
          paginatedBooks.map((book) => (
            <ContentCard
              key={book._id}
              title={book.title}
              type="Resumo de Livro"
              reference={`Por ${book.author}`}
              description={book.description}
              detailsUrl={`/livros/${book._id}`}
              pdfUrl={book.pdfUrl}
              coverImageUrl={book.coverImageUrl}
              book={book}
            />
          ))
        ) : (
          <p>Nenhum resumo encontrado com os filtros selecionados.</p>
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

export default Books;