import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import authHeader from './auth-header';

const StudyService = {
  /**
   * Busca sugestões de estudos com base em um termo de busca
   * @param {string} term - Termo de busca
   * @param {number} limit - Limite de sugestões por categoria
   * @returns {Promise<Object>} - Objeto com sugestões agrupadas por categoria
   */
  async getSuggestions(term, limit = 5) {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.SUGGESTIONS, {
        params: { term, limit },
        headers: authHeader()
      });
      
      // Retorna as sugestões formatadas
      return response.data.data || {
        titles: [],
        themes: [],
        references: [],
        formats: []
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões de estudos:', error);
      // Retorna um objeto vazio em caso de erro
      return {
        titles: [],
        themes: [],
        references: [],
        formats: []
      };
    }
  },

  /**
   * Busca estudos com base em filtros e paginação
   * @param {Object} params - Parâmetros de busca
   * @returns {Promise<Object>} - Dados paginados de estudos
   */
  async search(params = {}) {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.BASE, {
        params,
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estudos:', error);
      throw error;
    }
  },

  /**
   * Busca um estudo específico por ID
   * @param {string} id - ID do estudo
   * @returns {Promise<Object>} - Dados do estudo
   */
  async getById(id) {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.BY_ID(id), {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar estudo com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca os temas únicos disponíveis
   * @returns {Promise<Array>} - Lista de temas únicos
   */
  /**
   * Busca os temas únicos disponíveis
   * @returns {Promise<Array>} - Lista de temas únicos
   */
  async getThemes() {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.THEMES);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar temas de estudos:', error);
      return [];
    }
  },

  /**
   * Busca os formatos únicos disponíveis
   * @returns {Promise<Array>} - Lista de formatos únicos
   */
  /**
   * Busca os formatos únicos disponíveis
   * @returns {Promise<Array>} - Lista de formatos únicos
   */
  async getFormats() {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.FORMATS);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar formatos de estudos:', error);
      return [];
    }
  },

  /**
   * Busca os estudos mais recentes
   * @param {number} limit - Limite de estudos a serem retornados
   * @returns {Promise<Array>} - Lista de estudos recentes
   */
  async getLatest(limit = 5) {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.LATEST, {
        params: { limit },
        headers: authHeader()
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar estudos recentes:', error);
      return [];
    }
  }
};

export default StudyService;
