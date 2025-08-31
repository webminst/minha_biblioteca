import axios from 'axios';

export async function generateGlobalSearchSuggestions(term, API_ENDPOINTS) {
  if (!term.trim()) return [];
  try {
    // Busca os primeiros 100 sermões que contenham o termo
    const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, {
      params: { search: term, page: 1, limit: 100 },
      validateStatus: status => status >= 200 && status < 500,
    });
    const sermonsList = Array.isArray(response.data.data)
      ? response.data.data
      : [];
    const lowerTerm = term.toLowerCase();
    const suggestions = new Set();
    for (let i = 0; i < sermonsList.length; i++) {
      const sermon = sermonsList[i];
      if (sermon.title && sermon.title.toLowerCase().includes(lowerTerm)) {
        suggestions.add(sermon.title);
      }
      if (sermon.series && sermon.series.toLowerCase().includes(lowerTerm)) {
        suggestions.add(sermon.series);
      }
      if (
        sermon.speaker &&
        sermon.speaker.toLowerCase().includes(lowerTerm)
      ) {
        suggestions.add(sermon.speaker);
      }
      if (suggestions.size >= 5) break;
    }
    return Array.from(suggestions);
  } catch (error) {
    return [];
  }
}
