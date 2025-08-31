import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function SermonsPagination({
  pageFromUrl,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  goToPage,
  getPageNumbers,
}) {
  // Memoize handlers for each page number to avoid recreating functions in render
  const pageNumbers = getPageNumbers();
  const pageHandlers = useMemo(() => {
    const handlers = {};
    pageNumbers.forEach(number => {
      handlers[number] = () => goToPage(number);
    });
    return handlers;
  }, [pageNumbers, goToPage]);

  return (
    <div className='pagination-controls'>
      <button
        onClick={goToPreviousPage}
        disabled={pageFromUrl === 1}
        className='pagination-button'
      >
        <FontAwesomeIcon icon={faChevronLeft} /> Anterior
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={pageHandlers[number]}
          className={`pagination-button page-number ${pageFromUrl === number ? 'active' : ''}`}
          disabled={pageFromUrl === number}
        >
          {number}
        </button>
      ))}
      <button
        onClick={goToNextPage}
        disabled={pageFromUrl === totalPages}
        className='pagination-button'
      >
        Próxima <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}

SermonsPagination.propTypes = {
  pageFromUrl: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  goToNextPage: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired,
  getPageNumbers: PropTypes.func.isRequired,
};

SermonsPagination.propTypes = {
  pageFromUrl: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  goToNextPage: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired,
  getPageNumbers: PropTypes.func.isRequired,
};

export default SermonsPagination;
