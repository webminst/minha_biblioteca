import { useCallback } from 'react';

export function useSermonsHandlers({
  setSelectedBook,
  setSelectedSeries,
  setSelectedSpeaker,
  setSearchTerm,
  setLocalSearchTerm,
  navigate,
  location,
  selectedBook,
  selectedSeries,
  selectedSpeaker,
  searchTerm,
  generateSearchSuggestions,
  setIsSearching,
  setSearchSuggestions,
  setShowSuggestions,
  applySearch,
}) {
  const handleBookChange = useCallback((e) => {
    setSelectedBook(e.target.value);
    navigate(
      `${location.pathname}?page=1${e.target.value ? `&book=${e.target.value}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  }, [location.pathname, selectedSeries, selectedSpeaker, searchTerm, setSelectedBook, navigate]);

  const handleSeriesChange = useCallback((e) => {
    setSelectedSeries(e.target.value);
    navigate(
      `${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${e.target.value ? `&series=${e.target.value}` : ''}${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  }, [location.pathname, selectedBook, selectedSpeaker, searchTerm, setSelectedSeries, navigate]);

  const handleSpeakerChange = useCallback((e) => {
    setSelectedSpeaker(e.target.value);
    navigate(
      `${location.pathname}?page=1${selectedBook ? `&book=${selectedBook}` : ''}${selectedSeries ? `&series=${selectedSeries}` : ''}${e.target.value ? `&speaker=${e.target.value}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
    );
  }, [location.pathname, selectedBook, selectedSeries, searchTerm, setSelectedSpeaker, navigate]);

  const handleSearchChange = useCallback(async (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (value.length > 1) {
      try {
        setIsSearching(true);
        const suggestions = await generateSearchSuggestions(value);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [generateSearchSuggestions, setIsSearching, setLocalSearchTerm, setSearchSuggestions, setShowSuggestions]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  }, [applySearch]);

  const clearFilters = useCallback(() => {
    setSelectedBook('');
    setSelectedSeries('');
    setSelectedSpeaker('');
    setSearchTerm('');
    setLocalSearchTerm('');
    navigate(`${location.pathname}?page=1`);
  }, [location.pathname, navigate, setSelectedBook, setSelectedSeries, setSelectedSpeaker, setSearchTerm, setLocalSearchTerm]);

  return {
    handleBookChange,
    handleSeriesChange,
    handleSpeakerChange,
    handleSearchChange,
    handleKeyDown,
    clearFilters,
  };
}
