import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { extractSermons, extractPagination } from '../utils/apiResponseHelpers';

export function useSermonsData({
  pageFromUrl,
  selectedBook,
  selectedSeries,
  selectedSpeaker,
  searchTerm,
}) {
  const [sermons, setSermons] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Busca as avaliações de um sermão
  const fetchSermonRatings = useCallback(async (sermonId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SERMONS.BASE}/${sermonId}/ratings`,
      );
      if (!response.ok) {
        throw new Error(
          `Erro ao carregar avaliações para o sermão ${sermonId}`,
        );
      }
      const data = await response.json();
      if (data.sucesso === false) {
        return { average: null, total: 0 };
      }
      return data.dados || { average: null, total: 0 };
    } catch (err) {
      return { average: null, total: 0 };
    }
  }, []);

  // Busca as avaliações para todos os sermões (useCallback para deps estáveis)
  const fetchAllRatings = useCallback(async (sermonsList) => {
    if (!Array.isArray(sermonsList) || sermonsList.length === 0) {
      return {};
    }
    const ratingsMap = {};
    const ratingPromises = sermonsList.map(async sermon => {
      try {
        const ratingData = await fetchSermonRatings(sermon._id);
        return { id: sermon._id, data: ratingData };
      } catch (error) {
        return { id: sermon._id, data: { average: null, total: 0 } };
      }
    });
    const ratings = await Promise.all(ratingPromises);
    ratings.forEach(({ id, data }) => {
      ratingsMap[id] = data;
    });
    return ratingsMap;
  }, [fetchSermonRatings]);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);
        const params = {
          page: pageFromUrl,
          limit: 8,
        };
        if (selectedBook) params.book = selectedBook;
        if (selectedSeries) params.series = selectedSeries;
        if (selectedSpeaker) params.speaker = selectedSpeaker;
        if (searchTerm) params.search = searchTerm;
        const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, {
          params,
        });
        const sermonsData = extractSermons(response.data);
        const paginationData = extractPagination(response.data);
        setSermons(sermonsData);
        setPagination(paginationData);
        const ratingsMap = await fetchAllRatings(sermonsData);
        setRatings(ratingsMap);
      } catch (err) {
        setError('Erro ao carregar os sermões. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, [pageFromUrl, selectedBook, selectedSeries, selectedSpeaker, searchTerm, fetchAllRatings]);

  return { sermons, ratings, loading, error, pagination };
}
