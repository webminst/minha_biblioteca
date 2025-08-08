import { useState, useRef } from 'react';
import {
  fetchVerse,
  validateReference,
  fetchRandomVerse,
  AVAILABLE_TRANSLATIONS,
} from '../../services/bibleApiService';
import BibleVerse from '../BibleVerse/BibleVerse';
import './BibleSearch.css';

/**
 * Componente para busca e exibição de versículos bíblicos
 * Permite buscar versículos por referência e obter versículos aleatórios
 */

const BibleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentReference, setCurrentReference] = useState('');
  const [translation, setTranslation] = useState('almeida');
  const [isValidating, setIsValidating] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Sugestões de referências populares
  const popularReferences = [
    'João 3:16',
    'Salmos 23:1',
    'Filipenses 4:13',
    'Romanos 8:28',
    'Isaías 40:31',
    'Mateus 11:28',
    'Jeremias 29:11',
    'Provérbios 3:5-6',
    '1 Coríntios 13:4-7',
    'Gálatas 5:22-23',
  ];

  // Handler para busca
  const handleSearch = async (reference = searchTerm) => {
    if (!reference.trim()) return;

    setIsValidating(true);

    try {
      const isValid = await validateReference(reference, translation);

      if (isValid) {
        setCurrentReference(reference);
        addToHistory(reference);
        setSearchTerm('');
        setShowSuggestions(false);
      } else {
        alert(
          'Referência bíblica não encontrada. Verifique a formatação e tente novamente.',
        );
      }
    } catch (error) {
      alert(`Erro ao validar referência: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Handler para versículo aleatório
  const handleRandomVerse = async (testament = null) => {
    setIsValidating(true);

    try {
      const randomVerse = await fetchRandomVerse(translation, testament);
      if (randomVerse && randomVerse.reference) {
        setCurrentReference(randomVerse.reference);
        addToHistory(randomVerse.reference);
      }
    } catch (error) {
      alert(`Erro ao buscar versículo aleatório: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Adiciona referência ao histórico
  const addToHistory = reference => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== reference);
      return [reference, ...filtered].slice(0, 10); // Mantém apenas os 10 mais recentes
    });
  };

  // Handler para submissão do formulário
  const handleSubmit = e => {
    e.preventDefault();
    handleSearch();
  };

  // Handler para seleção de sugestão
  const handleSuggestionClick = reference => {
    setSearchTerm(reference);
    setShowSuggestions(false);
    handleSearch(reference);
  };

  // Handler para foco no input
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handler para blur do input (com delay para permitir cliques)
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className='bible-search'>
      <div className='search-header'>
        <h2>🔍 Buscar Versículos Bíblicos</h2>
        <p>
          Digite uma referência bíblica (ex: João 3:16, Salmos 23, Mateus
          5:1-10)
        </p>
      </div>

      {/* Seletor de tradução */}
      <div className='translation-selector'>
        <label htmlFor='translation'>Tradução:</label>
        <select
          id='translation'
          value={translation}
          onChange={e => setTranslation(e.target.value)}
        >
          {Object.entries(AVAILABLE_TRANSLATIONS).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Formulário de busca */}
      <form onSubmit={handleSubmit} className='search-form'>
        <div className='search-input-container'>
          <input
            ref={inputRef}
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder='Ex: João 3:16'
            className='search-input'
          />

          <button
            type='submit'
            disabled={!searchTerm.trim() || isValidating}
            className='search-button'
          >
            {isValidating ? '🔄' : '🔍'} Buscar
          </button>

          {/* Sugestões */}
          {showSuggestions && (
            <div className='suggestions-dropdown'>
              {searchHistory.length > 0 && (
                <div className='suggestions-section'>
                  <h4>Histórico</h4>
                  {searchHistory.map((ref, index) => (
                    <button
                      key={index}
                      type='button'
                      className='suggestion-item'
                      onClick={() => handleSuggestionClick(ref)}
                    >
                      📖 {ref}
                    </button>
                  ))}
                </div>
              )}

              <div className='suggestions-section'>
                <h4>Sugestões Populares</h4>
                {popularReferences
                  .filter(
                    ref =>
                      searchTerm === '' ||
                      ref.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .slice(0, 5)
                  .map((ref, index) => (
                    <button
                      key={index}
                      type='button'
                      className='suggestion-item'
                      onClick={() => handleSuggestionClick(ref)}
                    >
                      ⭐ {ref}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Botões de versículos aleatórios */}
      <div className='random-buttons'>
        <button
          onClick={() => handleRandomVerse()}
          disabled={isValidating}
          className='random-button'
        >
          🎲 Versículo Aleatório
        </button>

        <button
          onClick={() => handleRandomVerse('OT')}
          disabled={isValidating}
          className='random-button'
        >
          📜 Antigo Testamento
        </button>

        <button
          onClick={() => handleRandomVerse('NT')}
          disabled={isValidating}
          className='random-button'
        >
          ✝️ Novo Testamento
        </button>
      </div>

      {/* Exibição do versículo */}
      {currentReference && (
        <div className='verse-display'>
          <BibleVerse
            reference={currentReference}
            translation={translation}
            showTranslationSelector={false}
            className='search-result'
          />
        </div>
      )}

      {/* Dicas de uso */}
      <div className='usage-tips'>
        <h3>💡 Dicas de Uso</h3>
        <ul>
          <li>
            <strong>Versículo único:</strong> João 3:16
          </li>
          <li>
            <strong>Capítulo inteiro:</strong> Salmos 23
          </li>
          <li>
            <strong>Intervalo de versículos:</strong> Mateus 5:1-10
          </li>
          <li>
            <strong>Versículos específicos:</strong> Romanos 8:28,31
          </li>
          <li>
            <strong>Livros abreviados:</strong> Jo 3:16, Mt 5:1, Sl 23
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BibleSearch;
