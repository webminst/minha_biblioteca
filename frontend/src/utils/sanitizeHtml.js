// Utilitário para sanitizar HTML no frontend usando DOMPurify
import DOMPurify from 'dompurify';

/**
 * Sanitiza uma string HTML para uso seguro no React
 * @param {string} html - HTML potencialmente inseguro
 * @returns {string} - HTML sanitizado
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
