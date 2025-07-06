// src/pages/SearchResults.js
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ContentCard from '../components/ContentCard/ContentCard';
import './ListPage.css'; // Reutilizar estilos da lista

// Helper para pegar query param da URL
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}


const SearchResults = () => {
  const location = useLocation();
  const queryHook = useQuery();

  // Estados para os dados do banco
  const [sermons, setSermons] = useState([]);
  const [studies, setStudies] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pega o termo de busca do query param
  const searchTerm = queryHook.get('q') || '';
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  // Busca os dados do banco de dados
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

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

  // Combina todos os dados e adiciona tipo para identificação
  const allContent = useMemo(() => [
    ...sermons.map(sermon => ({ ...sermon, type: 'Sermão' })),
    ...studies.map(study => ({ ...study, type: 'Estudo' })),
    ...books.map(book => ({ ...book, type: 'Livro' }))
  ], [sermons, studies, books]);

  // Filtra os resultados com base no termo de busca
  const filteredResults = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    return allContent.filter(item => {
      const searchableString = `
        ${item.title || ''}
        ${item.description || ''}
        ${item.reference || ''}
        ${item.book || ''}
        ${item.series || ''}
        ${item.theme || ''}
        ${item.format || ''}
        ${item.author || ''}
        ${item.area || ''}
        ${item.publisher || ''}
        ${(item.tags || []).join(' ')}
      `.toLowerCase();

      return searchableString.includes(normalizedSearchTerm);
    });
  }, [allContent, normalizedSearchTerm]);

  if (loading) {
    return (
      <div className="list-page-container">
        <h1>Resultados da Busca</h1>
        <p>Carregando resultados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page-container">
        <h1>Resultados da Busca</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="list-page-container"> {/* Reutiliza o container */}
      <h1>Resultados da Busca</h1>

      {searchTerm ? (
        <p className="list-page-description">
          Resultados para: <strong>"{searchTerm}"</strong> ({filteredResults.length} encontrados)
        </p>
      ) : (
        <p className="list-page-description">
          Por favor, digite um termo na barra de busca acima.
        </p>
      )}


      {/* Reutiliza a lista de conteúdo */}
      <div className="content-list">
        {filteredResults.length > 0 ? (
          filteredResults.map((item) => (
            <ContentCard
              key={`${item.type}-${item.id}`} // Chave única combinando tipo e id
              title={item.title}
              type={item.type}
              date={item.date}
              // Adapta a referência conforme o tipo para melhor visualização
              reference={
                item.type === 'Livro' ? `Por ${item.author}` :
                  item.reference || item.theme || item.format || item.area || ''
              }
              description={item.description}
              detailsUrl={item.detailsUrl}
              pdfUrl={item.pdfUrl}
            />
          ))
        ) : searchTerm && filteredResults.length === 0 && (
          <div className="empty-state-container">
            {/* Pode adicionar um SVG/Imagem aqui */}
            <img src="/images/nenhum-resultado-encontrado.png" alt="Nenhum resultado encontrado" className="empty-state-image" />
            <h2>Nenhum resultado para "{searchTerm}"</h2>
            <p>Tente palavras-chave diferentes ou explore nossas seções:</p>
            <div className="empty-state-actions">
              <Link to="/sermoes" className="empty-state-button"> Ver Sermões | </Link>
              <Link to="/livros" className="empty-state-button">  Ver Livros  | </Link>
              <Link to="/estudos" className="empty-state-button"> Ver Estudos | </Link>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="hero-button">Voltar para Home</Link> {/* Reutiliza estilo do botão */}
      </div>
    </div>
  );
};

export default SearchResults;