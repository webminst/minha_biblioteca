import axios from 'axios';

export async function generateGlobalSearchSuggestions(term, API_ENDPOINTS) {
  if (!term.trim()) return [];

  function addSuggestion(suggestions, value) {
    if (!suggestions.includes(value)) {
      suggestions.push(value);
    }
  }

  function checkAndAddField(suggestions, sermon, field, lowerTerm) {
    if (sermon[field] && sermon[field].toLowerCase().includes(lowerTerm)) {
      addSuggestion(suggestions, sermon[field]);
      return true;
    }
    return false;
  }

  try {
    // Busca os primeiros 100 serm5es que contenham o termo
    const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, {
      params: { search: term, page: 1, limit: 100 },
      validateStatus: status => status >= 200 && status < 500,
    });
    const sermonsList = Array.isArray(response.data.data)
      ? response.data.data
      : [];
    const lowerTerm = term.toLowerCase();
    const suggestions = [];

    for (let i = 0; i < sermonsList.length; i++) {
      const sermon = sermonsList[i];
      let matched = false;
      matched = checkAndAddField(suggestions, sermon, 'title', lowerTerm) || matched;
      matched = checkAndAddField(suggestions, sermon, 'series', lowerTerm) || matched;
      matched = checkAndAddField(suggestions, sermon, 'speaker', lowerTerm) || matched;
      if (suggestions.length >= 5) break;
    }
    return suggestions;
  } catch (error) {
    return [];
  }
}
