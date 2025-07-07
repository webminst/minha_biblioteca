// src/pages/SearchResults.js
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import './ListPage.css';

/**
 * Componente SearchResults - Página de resultados de busca
 * Busca em todos os tipos de conteúdo (sermões, estudos, livros)
 * Exibe resultados filtrados com base no termo de busca da URL
 */

// Helper para extrair parâmetros de busca da URL
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SearchResults = () => {
  const location = useLocation();
  const queryHook = useQuery();

  // Estados para os dados das diferentes coleções
  const [sermons, setSermons] = useState([]);
  const [studies, setStudies] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extrai o termo de busca da URL
  const searchTerm = queryHook.get('q') || '';
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  // Busca todos os dados necessários para a pesquisa
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Busca paralela de todas as coleções
        const [sermonsResponse, studiesResponse, booksResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/sermons'),
          axios.get('http://localhost:3001/api/studies'),
          axios.get('http://localhost:3001/api/books')
        ]);

        setSermons(sermonsResponse.data);
        setStudies(studiesResponse.data);
        setBooks(booksResponse.data);
      } catch (err) {
        setError('Erro ao carregar dados para busca. Por favor, tente novamente mais tarde.');
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Combina todos os conteúdos e adiciona URLs de detalhes
  const allContent = useMemo(() => [
    ...sermons.map(sermon => ({
      ...sermon,
      type: 'Sermão',
      detailsUrl: `/sermoes/${sermon._id}`
    })),
    ...studies.map(study => ({
      ...study,
      type: 'Estudo',
      detailsUrl: `/estudos/${study._id}`
    })),
    ...books.map(book => ({
      ...book,
      type: 'Livro',
      detailsUrl: `/livros/${book._id}`
    }))
  ], [sermons, studies, books]);

  // Filtra os resultados com base no termo de busca
  const filteredResults = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    return allContent.filter(item => {
      // Cria string com todos os campos pesquisáveis
      const searchableString = `
        ${item.title || ''}
        ${item.description || ''}
        ${item.reference || ''}
        ${item.bibleReference || ''}
        ${item.series || ''}
        ${item.theme || ''}
        ${item.author || ''}
        ${item.speaker || ''}
        ${item.area || ''}
        ${item.publisher || ''}
        ${(item.tags || []).join(' ')}
      `.toLowerCase();

      return searchableString.includes(normalizedSearchTerm);
    });
  }, [allContent, normalizedSearchTerm]);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="list-page-container">
        <h1>Resultados da Busca</h1>
        <p>Carregando resultados...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="list-page-container">
        <h1>Resultados da Busca</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="list-page-container">
      <h1>Resultados da Busca</h1>

      {/* Descrição dos resultados ou instrução de busca */}
      {searchTerm ? (
        <p className="list-page-description">
          Resultados para: <strong>"{searchTerm}"</strong> ({filteredResults.length} encontrados)
        </p>
      ) : (
        <p className="list-page-description">
          Por favor, digite um termo na barra de busca acima.
        </p>
      )}

      {/* Lista de resultados */}
      <div className="content-list">
        {filteredResults.length > 0 ? (
          filteredResults.map((item) => (
            <ContentCard
              key={`${item.type}-${item._id}`}
              title={item.title}
              type={item.type}
              date={item.date}
              reference={
                item.type === 'Livro'
                  ? `Por ${item.author}`
                  : item.reference || item.bibleReference || item.theme || item.area || ''
              }
              description={item.description}
              detailsUrl={item.detailsUrl}
              pdfUrl={item.pdfUrl}
              sermon={item.type === 'Sermão' ? item : undefined}
              study={item.type === 'Estudo' ? item : undefined}
              book={item.type === 'Livro' ? item : undefined}
            />
          ))
        ) : (
          // Estado vazio - quando há termo de busca mas nenhum resultado
          searchTerm && (
            <div className="empty-state-container">
              <h2>Nenhum resultado para "{searchTerm}"</h2>
              <p>Tente palavras-chave diferentes ou explore nossas seções:</p>
              <div className="empty-state-actions">
                <Link to="/sermoes" className="empty-state-button">Ver Sermões</Link>
                <Link to="/estudos" className="empty-state-button">Ver Estudos</Link>
                <Link to="/livros" className="empty-state-button">Ver Livros</Link>
              </div>
            </div>
          )
        )}
      </div>

      {/* Botão para voltar à página inicial */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="hero-button">Voltar para Home</Link>
      </div>
    </div>
  );
};

export default SearchResults;