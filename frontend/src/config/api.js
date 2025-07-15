// src/config/api.js
// Configuração centralizada para URLs da API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
    // Base URL
    BASE: API_BASE_URL,

    // Auth endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        VERIFY: `${API_BASE_URL}/api/auth/verify`,
        REFRESH: `${API_BASE_URL}/api/auth/refresh`, // NOVO: Endpoint de refresh
    },

    // Sermons endpoints
    SERMONS: {
        BASE: `${API_BASE_URL}/api/sermons`,
        LATEST: `${API_BASE_URL}/api/sermons/latest`,
        BY_ID: (id) => `${API_BASE_URL}/api/sermons/${id}`,
        SEARCH: (term) => `${API_BASE_URL}/api/sermons/search/${term}`,
    },

    // Studies endpoints
    STUDIES: {
        BASE: `${API_BASE_URL}/api/studies`,
        LATEST: `${API_BASE_URL}/api/studies/latest`,
        BY_ID: (id) => `${API_BASE_URL}/api/studies/${id}`,
        SEARCH: (term) => `${API_BASE_URL}/api/studies/search/${term}`,
    },

    // Books endpoints
    BOOKS: {
        BASE: `${API_BASE_URL}/api/books`,
        LATEST: `${API_BASE_URL}/api/books/latest`,
        BY_ID: (id) => `${API_BASE_URL}/api/books/${id}`,
        SEARCH: (term) => `${API_BASE_URL}/api/books/search/${term}`,
    }
};

export default API_ENDPOINTS;
