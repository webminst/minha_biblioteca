import PropTypes from 'prop-types';
import ContentCard from '../components/ContentCard/ContentCard';

function BookList({ books, ratings }) {
  if (books.length === 0) {
    return <p>Nenhum resumo encontrado com os filtros selecionados.</p>;
  }
  return (
    <div className='content-list'>
      {books.map(book => (
        <div key={book._id} style={{ marginBottom: 24 }}>
          <ContentCard
            title={book.title}
            type='Resumo de Livro'
            author={book.author}
            description={book.description}
            detailsUrl={`/livros/${book._id}`}
            pdfUrl={book.pdfUrl}
            coverImageUrl={book.coverImageUrl}
            book={book}
            rating={
              ratings[book._id]
                ? {
                  average: ratings[book._id].average,
                  total: ratings[book._id].total,
                }
                : null
            }
          />
        </div>
      ))}
    </div>
  );
}

BookList.propTypes = {
  books: PropTypes.array.isRequired,
  ratings: PropTypes.object.isRequired,
};

export default BookList;
