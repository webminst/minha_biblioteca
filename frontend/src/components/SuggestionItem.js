// ...existing code...
import PropTypes from 'prop-types';

function SuggestionItem({ suggestion, onMouseDown, onKeyPress }) {
  return (
    <div
      className='suggestion-item'
      data-type={suggestion.type}
      role='button'
      tabIndex={0}
      onMouseDown={onMouseDown}
      onKeyPress={onKeyPress}
    >
      <span className='suggestion-text'>{suggestion.text}</span>
      <span className='suggestion-type'>{suggestion.type}</span>
    </div>
  );
}

SuggestionItem.propTypes = {
  suggestion: PropTypes.shape({
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
};

export default SuggestionItem;
