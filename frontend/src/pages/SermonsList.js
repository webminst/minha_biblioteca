import PropTypes from 'prop-types';
import ContentCard from '../components/ContentCard/ContentCard';

function SermonsList({ sermons, ratings }) {
  if (!sermons || sermons.length === 0) {
    return <p>Nenhum serm3o encontrado com os filtros selecionados.</p>;
  }
  return (
    <div className='content-list'>
      {sermons.map(sermon => (
        <div key={sermon._id} style={{ marginBottom: 24 }}>
          <ContentCard
            title={sermon.title}
            type='Serm3o'
            reference={sermon.reference || sermon.book}
            description={sermon.description}
            detailsUrl={`/sermoes/${sermon._id}`}
            pdfUrl={sermon.pdfUrl}
            sermon={sermon}
            rating={
              ratings[sermon._id]
                ? {
                  average: ratings[sermon._id].average,
                  total: ratings[sermon._id].total,
                }
                : null
            }
          />
        </div>
      ))}
    </div>
  );
}

SermonsList.propTypes = {
  sermons: PropTypes.arrayOf(PropTypes.object).isRequired,
  ratings: PropTypes.object.isRequired,
};

export default SermonsList;
