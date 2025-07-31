import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import authHeader from './auth-header';

const BookService = {
  /**
   * Busca sugestões de livros com base em um termo de busca
   * @param {string} term - Termo de busca
   * @param {number} limit - Limite de sugestões por categoria
   * @returns {Promise<Object>} - Objeto com sugestões agrupadas por categoria
   */
  async getSuggestions(term, limit = 5) {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.SUGGESTIONS, {
        params: { term, limit },
        headers: authHeader()
      });
      
      // Retorna as sugestões formatadas
      return response.data.data || {
        titles: [],
        authors: [],
        areas: [],
        publishers: []
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões de livros:', error);
      // Retorna um objeto vazio em caso de erro
      return {
        titles: [],
        authors: [],
        areas: [],
        publishers: []
      };
    }
  },

  /**
   * Busca livros com base em filtros e paginação
   * @param {Object} params - Parâmetros de busca
   * @returns {Promise<Object>} - Dados paginados de livros
   */
  async search(params = {}) {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.BASE, {
        params,
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
  },

  /**
   * Busca um livro específico por ID
   * @param {string} id - ID do livro
   * @returns {Promise<Object>} - Dados do livro
   */
  async getById(id) {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.BY_ID(id), {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar livro com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca os autores únicos disponíveis
   * @returns {Promise<Array>} - Lista de autores únicos
   */
  /**
   * Busca os autores únicos disponíveis
   * @returns {Promise<Array>} - Lista de autores únicos
   */
  async getAuthors() {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.AUTHORS);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar autores de livros:', error);
      return [];
    }
  },

  /**
   * Busca as áreas únicas disponíveis
   * @returns {Promise<Array>} - Lista de áreas únicas
   */
  /**
   * Busca as áreas únicas disponíveis
   * @returns {Promise<Array>} - Lista de áreas únicas
   */
  async getAreas() {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.AREAS);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar áreas de livros:', error);
      return [];
    }
  },

  /**
   * Busca as editoras únicas disponíveis
   * @returns {Promise<Array>} - Lista de editoras únicas
   */
  async getPublishers() {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.PUBLISHERS);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar editoras de livros:', error);
      return [];
    }
  },

  /**
   * Busca as séries únicas disponíveis
   * @returns {Promise<Array>} - Lista de séries únicas
   */
  async getSeries() {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.SERIES);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar séries de livros:', error);
      return [];
    }
  },

  /**
   * Busca os livros mais recentes
   * @param {number} limit - Limite de livros a serem retornados
   * @returns {Promise<Array>} - Lista de livros recentes
   */
  async getLatest(limit = 5) {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.LATEST, {
        params: { limit },
        headers: authHeader()
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar livros recentes:', error);
      return [];
    }
  },

  /**
   * Avalia um livro
   * @param {string} bookId - ID do livro
   * @param {number} stars - Número de estrelas (1-5)
   * @param {string} deviceId - ID do dispositivo
   * @returns {Promise<Object>} - Dados da avaliação
   */
  async rateBook(bookId, stars, deviceId) {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.BOOKS.BASE}/${bookId}/rate`,
        { stars, deviceId },
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao avaliar o livro:', error);
      throw error;
    }
  },

  /**
   * Obtém as avaliações de um livro
   * @param {string} bookId - ID do livro
   * @returns {Promise<Object>} - Dados das avaliações (média e total)
   */
  async getBookRatings(bookId) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.BOOKS.BASE}/${bookId}/ratings`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avaliações do livro:', error);
      // Retorna valores padrão em caso de erro
      return { average: null, total: 0 };
    }
  }
};

export default BookService;
