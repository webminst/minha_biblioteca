import PropTypes from 'prop-types';
SearchSuggestions.propTypes = {
  showSuggestions: PropTypes.bool.isRequired,
  searchSuggestions: PropTypes.array.isRequired,
  localSearchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  applySearch: PropTypes.func.isRequired,
};

SermonsFilters.propTypes = {
  handleInputFocus: PropTypes.func,
  handleInputBlur: PropTypes.func,
  selectedBook: PropTypes.string,
  selectedSeries: PropTypes.string,
  selectedSpeaker: PropTypes.string,
  searchTerm: PropTypes.string,
  localSearchTerm: PropTypes.string.isRequired,
  uniqueBooks: PropTypes.array.isRequired,
  uniqueSeries: PropTypes.array.isRequired,
  uniqueSpeakers: PropTypes.array.isRequired,
  isSearching: PropTypes.bool.isRequired,
  searchSuggestions: PropTypes.array.isRequired,
  showSuggestions: PropTypes.bool.isRequired,
  handleBookChange: PropTypes.func.isRequired,
  handleSeriesChange: PropTypes.func.isRequired,
  handleSpeakerChange: PropTypes.func.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  setShowSuggestions: PropTypes.func.isRequired,
  applySearch: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
};

function SearchSuggestions({
  showSuggestions,
  searchSuggestions,
  localSearchTerm,
  handleSearchChange,
  applySearch,
}) {
  if (!showSuggestions) return null;


  // Handlers para cada sugestão, sem arrow function no JSX
  const suggestionHandlers = {};
  searchSuggestions.forEach((suggestion) => {
    suggestionHandlers[suggestion] = {
      onMouseDown: () => {
        handleSearchChange({ target: { value: suggestion } });
        applySearch(suggestion);
      },
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSearchChange({ target: { value: suggestion } });
          applySearch(suggestion);
        }
      },
    };
  });

  if (searchSuggestions.length > 0) {
    return (
      <div className='search-suggestions visible'>
        {searchSuggestions.map((suggestion) => (
          <div
            key={suggestion}
            className='suggestion-item'
            role='option'
            tabIndex={0}
            onMouseDown={suggestionHandlers[suggestion].onMouseDown}
            onKeyDown={suggestionHandlers[suggestion].onKeyDown}
            aria-selected='false'
          >
            {suggestion}
          </div>
        ))}
      </div>
    );
  }
  if (localSearchTerm.length > 1) {
    return (
      <div className='search-suggestions visible'>
        <div className='search-loading'>Nenhuma sugestão encontrada</div>
      </div>
    );
  }
  return null;
}

function SermonsFilters({
  selectedBook,
  selectedSeries,
  selectedSpeaker,
  searchTerm,
  localSearchTerm,
  uniqueBooks,
  uniqueSeries,
  uniqueSpeakers,
  isSearching,
  searchSuggestions,
  showSuggestions,
  handleBookChange,
  handleSeriesChange,
  handleSpeakerChange,
  handleSearchChange,
  handleKeyDown,
  setShowSuggestions,
  applySearch,
  clearFilters,
  handleInputFocus,
  handleInputBlur,
}) {
  // Handlers fora do JSX para evitar arrow functions
  // Para evitar erro de lint, definir handlers como constantes e garantir identidade estável
  // Se não vierem como props, define handlers padrão
  const _handleInputFocus = handleInputFocus || function handleInputFocus() {
    if (localSearchTerm.length > 1) setShowSuggestions(true);
  };
  const _handleInputBlur = handleInputBlur || function handleInputBlur() {
    setTimeout(() => setShowSuggestions(false), 200);
  };
  return (
    <div className='filter-controls'>
      {/* Campo de busca */}
      <div className='filter-group'>
        <label htmlFor='search-filter'>Buscar:</label>
        <div style={{ position: 'relative' }}>
          <input
            id='search-filter'
            type='text'
            placeholder='Buscar por título, pregador, referência...'
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={_handleInputFocus}
            onBlur={_handleInputBlur}
            className={`search-input ${localSearchTerm ? 'search-active' : ''}`}
            autoComplete='off'
          />
          <div className='search-icon-container'>
            {isSearching ? (
              <div className='spinner-border spinner-border-sm text-muted' role='status'>
                <span className='visually-hidden'>Carregando...</span>
              </div>
            ) : (
              <i className='fas fa-search'></i>
            )}
          </div>
          <SearchSuggestions
            showSuggestions={showSuggestions}
            searchSuggestions={searchSuggestions}
            localSearchTerm={localSearchTerm}
            handleSearchChange={handleSearchChange}
            applySearch={applySearch}
          />
        </div>
      </div>
      {/* Filtro por livro bíblico */}
      <div className='filter-group'>
        <label htmlFor='book-filter'>Livro Bíblico:</label>
        <select id='book-filter' value={selectedBook} onChange={handleBookChange}>
          <option value=''>Todos</option>
          {uniqueBooks.map(book => (
            <option key={book} value={book}>{book}</option>
          ))}
        </select>
      </div>
      {/* Filtro por série */}
      <div className='filter-group'>
        <label htmlFor='series-filter'>Série:</label>
        <select id='series-filter' value={selectedSeries} onChange={handleSeriesChange}>
          <option value=''>Todas</option>
          {uniqueSeries.map(series => (
            <option key={series} value={series}>{series}</option>
          ))}
        </select>
      </div>
      {/* Filtro por pregador */}
      <div className='filter-group'>
        <label htmlFor='speaker-filter'>Pregador:</label>
        <select id='speaker-filter' value={selectedSpeaker} onChange={handleSpeakerChange}>
          <option value=''>Todos</option>
          {uniqueSpeakers.map(speaker => (
            <option key={speaker} value={speaker}>{speaker}</option>
          ))}
        </select>
      </div>
      {/* Botão para limpar filtros - só aparece se houver filtros ativos */}
      {(selectedBook || selectedSeries || selectedSpeaker || searchTerm) && (
        <button onClick={clearFilters} className='clear-filter-button'>
          Limpar Filtros
        </button>
      )}
    </div>
  );
}

export default SermonsFilters;
