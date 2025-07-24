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

        // Two Factor Authentication endpoints
        TWO_FACTOR: {
            SETUP: `${API_BASE_URL}/api/auth2fa/setup`,
            ENABLE: `${API_BASE_URL}/api/auth2fa/enable`,
            VERIFY: `${API_BASE_URL}/api/auth2fa/verify`,
            DISABLE: `${API_BASE_URL}/api/auth2fa/disable`,
            STATUS: `${API_BASE_URL}/api/auth2fa/status`,
            REGENERATE_BACKUP_CODES: `${API_BASE_URL}/api/auth2fa/backup-codes/regenerate`,
        }
    },

    // Sermons endpoints
    SERMONS: {
        BASE: `${API_BASE_URL}/api/sermons`,
        LATEST: `${API_BASE_URL}/api/sermons/latest`,
        BY_ID: (id) => `${API_BASE_URL}/api/sermons/${id}`,
        SEARCH: (term) => `${API_BASE_URL}/api/sermons/search/${term}`,
        SUGGESTIONS: `${API_BASE_URL}/api/sermons/suggestions`,
        SERIES: `${API_BASE_URL}/api/sermons/series`,
        SPEAKERS: `${API_BASE_URL}/api/sermons/speakers`,
        BOOKS: `${API_BASE_URL}/api/sermons/books`,
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
