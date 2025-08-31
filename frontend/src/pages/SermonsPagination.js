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
  return (
    <div className='pagination-controls'>
      <button
        onClick={goToPreviousPage}
        disabled={pageFromUrl === 1}
        className='pagination-button'
      >
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

export default SermonsPagination;
