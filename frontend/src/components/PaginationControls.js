import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

function getPageNumbers(totalPages) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
}

function PaginationControls({
  totalPages,
  pageFromUrl,
  goToPreviousPage,
  goToNextPage,
  goToPage,
}) {
  const pageNumbers = getPageNumbers(totalPages);

  function handlePageClick(number) {
    goToPage(number);
  }

  // Create a handler map to avoid arrow functions in JSX
  const handlePageClickMap = {};
  pageNumbers.forEach(number => {
    handlePageClickMap[number] = () => handlePageClick(number);
  });

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
          onClick={handlePageClickMap[number]}
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

PaginationControls.propTypes = {
  totalPages: PropTypes.number.isRequired,
  pageFromUrl: PropTypes.number.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  goToNextPage: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired,
};

export default PaginationControls;
