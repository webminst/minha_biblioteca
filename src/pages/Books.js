// src/pages/Books.js
import React, { useState, useMemo } from 'react';
import ContentCard from '../components/ContentCard/ContentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
// import { booksData } from '../data/mockData'; // LINHA ANTIGA
import { booksData } from '../data/generatedData'; // NOVA LINHA para atualizar os dados
import './ListPage.css'; // Reutiliza o mesmo CSS de lista

const ITEMS_PER_PAGE = 6; // Defina quantos itens por página

const Books = () => {
  // --- Estados para os Filtros ---
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');

  // --- Estado para a Página Atual ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- Extrair Opções Únicas ---
  const uniqueAreas = useMemo(() => {
    return [...new Set(booksData.map(b => b.area).filter(Boolean))].sort();
  }, []);

  const uniqueAuthors = useMemo(() => {
    return [...new Set(booksData.map(b => b.author).filter(Boolean))].sort();
  }, []);

  // --- Lógica de Filtragem ---
  const filteredBooks = useMemo(() => {
    return booksData.filter(book => {
      const areaMatch = !selectedArea || book.area === selectedArea;
      const authorMatch = !selectedAuthor || book.author === selectedAuthor;
      return areaMatch && authorMatch;
    });
  }, [selectedArea, selectedAuthor]);

  // --- Lógica de Paginação ---
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  // --- Handlers para mudança nos selects e Limpar Filtros ---
  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página
  };
  const handleAuthorChange = (e) => {
    setSelectedAuthor(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página
  };
  const clearFilters = () => {
    setSelectedArea('');
    setSelectedAuthor('');
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
      <h1>Resumos de Livros</h1>
      <p className="list-page-description">
        Explore resumos, análises e indicações de livros relevantes para a fé e o pensamento cristão.
      </p>

      {/* --- Controles de Filtro --- */}
      <div className="filter-controls">
        {/* Filtro por Área */}
        <div className="filter-group">
          <label htmlFor="area-filter">Área:</label>
          <select id="area-filter" value={selectedArea} onChange={handleAreaChange}>
            <option value="">Todas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Autor */}
        <div className="filter-group">
          <label htmlFor="author-filter">Autor:</label>
          <select id="author-filter" value={selectedAuthor} onChange={handleAuthorChange}>
            <option value="">Todos</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>

        {/* Botão Limpar Filtros */}
        {(selectedArea || selectedAuthor) && (
          <button onClick={clearFilters} className="clear-filter-button">
            Limpar Filtros
          </button>
        )}
      </div>
      {/* --- Fim dos Filtros --- */}

      {/* --- Lista de Conteúdo --- */}
      <div className="content-list">
        {paginatedBooks.length > 0 ? (
          paginatedBooks.map((book) => (
            <ContentCard
              key={book.id}
              title={book.title}
              type={book.type}
              reference={`Por ${book.author}`}
              description={book.description}
              detailsUrl={book.detailsUrl}
              pdfUrl={book.pdfUrl}
              coverImageUrl={book.coverImageUrl}
            />
          ))
        ) : (
          <p>Nenhum resumo encontrado com os filtros selecionados.</p>
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

export default Books;