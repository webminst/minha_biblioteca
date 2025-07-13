// frontend/src/utils/apiResponseHelpers.js

/**
 * Utilitários para lidar com as diferentes estruturas de resposta da API
 * Compatibilidade entre estrutura antiga (array direto) e nova (objeto com paginação)
 */

/**
 * Extrai array de sermões da resposta da API
 * @param {Object|Array} responseData - Dados da resposta da API
 * @returns {Array} - Array de sermões
 */
export const extractSermons = (responseData) => {
    if (responseData.sermons) {
        return Array.isArray(responseData.sermons) ? responseData.sermons : [];
    }
    return Array.isArray(responseData) ? responseData : [];
};

/**
 * Extrai array de estudos da resposta da API
 * @param {Object|Array} responseData - Dados da resposta da API
 * @returns {Array} - Array de estudos
 */
export const extractStudies = (responseData) => {
    if (responseData.studies) {
        return Array.isArray(responseData.studies) ? responseData.studies : [];
    }
    return Array.isArray(responseData) ? responseData : [];
};

/**
 * Extrai array de livros da resposta da API
 * @param {Object|Array} responseData - Dados da resposta da API
 * @returns {Array} - Array de livros
 */
export const extractBooks = (responseData) => {
    if (responseData.books) {
        return Array.isArray(responseData.books) ? responseData.books : [];
    }
    return Array.isArray(responseData) ? responseData : [];
};

/**
 * Extrai informações de paginação da resposta da API
 * @param {Object} responseData - Dados da resposta da API
 * @returns {Object|null} - Objeto de paginação ou null se não existir
 */
export const extractPagination = (responseData) => {
    return responseData.pagination || null;
};

/**
 * Extrai filtros aplicados da resposta da API
 * @param {Object} responseData - Dados da resposta da API
 * @returns {Object} - Objeto com filtros aplicados
 */
export const extractFilters = (responseData) => {
    return responseData.filters || {};
};

/**
 * Função genérica para extrair dados de qualquer endpoint
 * @param {Object|Array} responseData - Dados da resposta da API
 * @param {string} type - Tipo de dados (sermons, studies, books)
 * @returns {Object} - Objeto com dados, paginação e filtros
 */
export const extractApiData = (responseData, type) => {
    let data = [];

    switch (type) {
        case 'sermons':
            data = extractSermons(responseData);
            break;
        case 'studies':
            data = extractStudies(responseData);
            break;
        case 'books':
            data = extractBooks(responseData);
            break;
        default:
            data = Array.isArray(responseData) ? responseData : [];
    }

    return {
        data,
        pagination: extractPagination(responseData),
        filters: extractFilters(responseData)
    };
};

/**
 * Hook personalizado para lidar com estruturas de resposta da API
 * @param {string} type - Tipo de dados (sermons, studies, books)
 * @returns {Function} - Função para processar resposta da API
 */
export const useApiResponseProcessor = (type) => {
    return (responseData) => extractApiData(responseData, type);
};
