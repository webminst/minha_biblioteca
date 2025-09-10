import PropTypes from 'prop-types';
import SuggestionItem from './SuggestionItem';

function FilterControls({
  localSearchTerm,
  handleSearchChange,
  handleKeyDown,
  handleSearchFocus,
  handleSearchBlur,
  isSearching,
  showSuggestions,
  searchSuggestions,
  handleSuggestionMouseDown,
  handleSuggestionKeyPress,
  uniqueAreas,
  selectedArea,
  handleAreaChange,
  uniqueAuthors,
  selectedAuthor,
  handleAuthorChange,
  clearFilters,
  searchTerm,
}) {
  return (
    <div className='filter-controls'>
      <div className='filter-group search-container'>
        <label htmlFor='search-filter'>Buscar:</label>
        <div style={{ position: 'relative' }}>
          <input
            id='search-filter'
            type='text'
            placeholder='Buscar por título, autor, descrição...'
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className={`search-input ${localSearchTerm ? 'search-active' : ''}`}
            autoComplete='off'
          />
          <div className='search-icon-container'>
            {isSearching ? (
              <div
                className='spinner-border spinner-border-sm text-muted'
                role='status'
              >
                <span className='visually-hidden'>Carregando...</span>
              </div>
            ) : (
              <i className='fas fa-search'></i>
            )}
          </div>
          {/* Sugestões de busca */}
          {showSuggestions && (
            <div className='search-suggestions visible'>
              {searchSuggestions.length > 0 ? (
                <>
                  {searchSuggestions.map(suggestion => (
                    <SuggestionItem
                      key={suggestion.text + suggestion.type}
                      suggestion={suggestion}
                      onMouseDown={handleSuggestionMouseDown(suggestion.text)}
                      onKeyPress={handleSuggestionKeyPress(suggestion.text)}
                    />
                  ))}
                </>
              ) : localSearchTerm.length > 1 ? (
                <div className='search-loading'>
                                    Nenhuma sugestão encontrada
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Filtro por área */}
      <div className='filter-group'>
        <label htmlFor='area-filter'>Área:</label>
        <select
          id='area-filter'
          value={selectedArea}
          onChange={handleAreaChange}
        >
          <option value=''>Todas</option>
          {uniqueAreas.map(area => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por autor */}
      <div className='filter-group'>
        <label htmlFor='author-filter'>Autor:</label>
        <select
          id='author-filter'
          value={selectedAuthor}
          onChange={handleAuthorChange}
        >
          <option value=''>Todos</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {/* Botão para limpar filtros */}
      {(selectedArea || selectedAuthor || searchTerm) && (
        <button onClick={clearFilters} className='clear-filter-button'>
                    Limpar Filtros
        </button>
      )}
    </div>
  );
}

FilterControls.propTypes = {
  localSearchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  handleSearchFocus: PropTypes.func.isRequired,
  handleSearchBlur: PropTypes.func.isRequired,
  isSearching: PropTypes.bool.isRequired,
  showSuggestions: PropTypes.bool.isRequired,
  searchSuggestions: PropTypes.array.isRequired,
  handleSuggestionMouseDown: PropTypes.func.isRequired,
  handleSuggestionKeyPress: PropTypes.func.isRequired,
  uniqueAreas: PropTypes.array.isRequired,
  selectedArea: PropTypes.string.isRequired,
  handleAreaChange: PropTypes.func.isRequired,
  uniqueAuthors: PropTypes.array.isRequired,
  selectedAuthor: PropTypes.string.isRequired,
  handleAuthorChange: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default FilterControls;
