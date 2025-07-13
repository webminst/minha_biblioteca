import React, { useState } from 'react';
import { fetchVerse, fetchRandomVerse, AVAILABLE_TRANSLATIONS } from '../../services/bibleApiService';
import './BibleSearch.css';

/**
 * Componente de busca bíblica com suporte para português
 */
const BibleSearchSimple = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [translation, setTranslation] = useState('ara');
    const [verse, setVerse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setVerse(null);

        try {
            const result = await fetchVerse(searchTerm, translation);
            setVerse(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRandomVerse = async () => {
        setLoading(true);
        setError('');
        setVerse(null);

        try {
            const result = await fetchRandomVerse(translation);
            setVerse(result);
            setSearchTerm(''); // Limpa o campo de busca
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bible-search">
            <div className="search-header">
                <h2>Busca Bíblica</h2>
                <p>Busque versículos por referência usando a Bíblia Revista e Atualizada</p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <div className="search-inputs">
                    <input
                        type="text"
                        placeholder="Ex: João 3:16, Salmos 23:1, Filipenses 4:13"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        className="translation-select"
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                    >
                        {Object.entries(AVAILABLE_TRANSLATIONS).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="search-buttons">
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? '🔄 Buscando...' : 'Buscar'}
                    </button>
                    <button
                        type="button"
                        className="random-button"
                        onClick={handleRandomVerse}
                        disabled={loading}
                    >
                        🎲 Versículo Aleatório
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {verse && !verse.isError && (
                <div className="verse-result">
                    <div className="verse-header">
                        <h3>{verse.reference}</h3>
                        <span className="translation-info">
                            {AVAILABLE_TRANSLATIONS[translation] || translation}
                        </span>
                    </div>
                    <div className="verse-text">
                        "{verse.text}"
                    </div>
                    <button
                        className="copy-button"
                        onClick={() => {
                            navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`);
                            alert('Versículo copiado para a área de transferência!');
                        }}
                    >
                        📋 Copiar Versículo
                    </button>
                </div>
            )}

            {verse && verse.isError && (
                <div className="error-message">
                    ⚠️ {verse.text}
                </div>
            )}

            <div className="search-info">
                <h4>💡 Dicas de uso:</h4>
                <ul>
                    <li><strong>Versículos específicos:</strong> João 3:16, Salmos 23:1</li>
                    <li><strong>Múltiplos versículos:</strong> Romanos 8:28-29</li>
                    <li><strong>Capítulos:</strong> Salmos 23</li>
                    <li><strong>Livros abreviados:</strong> Jo 3:16, Mt 5:1, Sl 23</li>
                </ul>
            </div>
        </div>
    );
};

export default BibleSearchSimple;
