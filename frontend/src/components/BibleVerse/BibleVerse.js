import React, { useState, useEffect } from 'react';
import { fetchVerse, AVAILABLE_TRANSLATIONS, validateReference } from '../../services/bibleApiService';
import './BibleVerse.css';

/**
 * Componente para exibir versículos bíblicos
 * Permite buscar e exibir versículos da API bíblica
 */

const BibleVerse = ({
    reference,
    translation = 'almeida',
    showTranslationSelector = false,
    className = '',
    onVerseLoad = null,
    autoLoad = true
}) => {
    const [verseData, setVerseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentTranslation, setCurrentTranslation] = useState(translation);
    const [isValid, setIsValid] = useState(null);

    // Função para carregar versículo
    const loadVerse = async (ref = reference, trans = currentTranslation) => {
        if (!ref) return;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchVerse(ref, trans);
            setVerseData(data);
            setIsValid(true);

            if (onVerseLoad) {
                onVerseLoad(data);
            }
        } catch (err) {
            setError(err.message);
            setVerseData(null);
            setIsValid(false);
        } finally {
            setLoading(false);
        }
    };

    // Carrega versículo quando referência ou tradução mudam
    useEffect(() => {
        if (autoLoad && reference) {
            loadVerse();
        }
    }, [reference, currentTranslation, autoLoad]);

    // Handler para mudança de tradução
    const handleTranslationChange = (newTranslation) => {
        setCurrentTranslation(newTranslation);
    };

    // Renderização condicional baseada no estado
    if (loading) {
        return (
            <div className={`bible-verse ${className}`}>
                <div className="bible-verse-loading">
                    <div className="loading-spinner"></div>
                    <span>Carregando versículo...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bible-verse bible-verse-error ${className}`}>
                <div className="error-icon">📖</div>
                <div className="error-message">
                    <strong>Referência não encontrada</strong>
                    <p>{error}</p>
                    {reference && (
                        <button
                            onClick={() => loadVerse()}
                            className="retry-button"
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!verseData && !autoLoad) {
        return (
            <div className={`bible-verse bible-verse-manual ${className}`}>
                <div className="manual-load">
                    <div className="bible-icon">📖</div>
                    <p>Clique para carregar o versículo</p>
                    <button
                        onClick={() => loadVerse()}
                        className="load-button"
                        disabled={!reference}
                    >
                        Carregar {reference}
                    </button>
                </div>
            </div>
        );
    }

    if (!verseData) {
        return null;
    }

    return (
        <div className={`bible-verse ${className}`}>
            {/* Seletor de tradução */}
            {showTranslationSelector && (
                <div className="translation-selector">
                    <label htmlFor="translation-select">Tradução:</label>
                    <select
                        id="translation-select"
                        value={currentTranslation}
                        onChange={(e) => handleTranslationChange(e.target.value)}
                    >
                        {Object.entries(AVAILABLE_TRANSLATIONS).map(([key, name]) => (
                            <option key={key} value={key}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Conteúdo do versículo */}
            <div className="verse-content">
                <div className="verse-text">
                    {verseData.text}
                </div>

                <div className="verse-reference">
                    <strong>{verseData.reference}</strong>
                    {verseData.translation_name && (
                        <span className="translation-name"> ({verseData.translation_name})</span>
                    )}
                </div>

                {/* Lista detalhada de versículos (se múltiplos) */}
                {verseData.verses && verseData.verses.length > 1 && (
                    <div className="verse-details">
                        {verseData.verses.map((verse, index) => (
                            <div key={index} className="individual-verse">
                                <span className="verse-number">{verse.verse}</span>
                                <span className="verse-text">{verse.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ações */}
            <div className="verse-actions">
                <button
                    onClick={() => navigator.clipboard?.writeText(`${verseData.text} - ${verseData.reference}`)}
                    className="copy-button"
                    title="Copiar versículo"
                >
                    📋 Copiar
                </button>

                <button
                    onClick={() => loadVerse()}
                    className="refresh-button"
                    title="Recarregar versículo"
                >
                    🔄 Atualizar
                </button>
            </div>
        </div>
    );
};

export default BibleVerse;
