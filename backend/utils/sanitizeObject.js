// Utilitário para sanitizar campos de texto usando sanitize-html
const sanitizeHtml = require('sanitize-html');

/**
 * Sanitiza recursivamente todos os campos string de um objeto
 * @param {Object} obj - Objeto a ser sanitizado
 * @returns {Object} - Objeto sanitizado
 */
function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
    } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }
    return obj;
}

module.exports = sanitizeObject;
