// src/pages/SearchResults.js
import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
// import { sermonsData, studiesData, booksData, findContentById } from '../data/mockData'; // LINHA ANTIGA
import { sermonsData, studiesData, booksData, findContentById } from '../data/generatedData'; // NOVA LINHA para atualizar os dados
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

  // Pega o termo de busca - Escolha UMA das opções abaixo:
  // Opção 1: Se usou query param no Header (?q=...)
  const searchTerm = queryHook.get('q') || '';
  // Opção 2: Se usou state no Header (navigate('/busca', { state: { query: ... } }))
  // const searchTerm = location.state?.query || '';

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const allContent = useMemo(() => [
      ...sermonsData,
      ...studiesData,
      ...booksData
    ], []); // Combina todos os dados uma vez

  const filteredResults = useMemo(() => {
    if (!normalizedSearchTerm) {
      return []; // Retorna vazio se não houver termo de busca
    }

    return allContent.filter(item => {
      // Constrói uma string com todos os campos pesquisáveis do item
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
      `.toLowerCase(); // Converte tudo para minúsculas

      // Verifica se a string pesquisável inclui o termo de busca
      return searchableString.includes(normalizedSearchTerm);
    });
  }, [allContent, normalizedSearchTerm]); // Recalcula quando o termo muda

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
                  item.type === 'Resumo de Livro' ? `Por ${item.author}` :
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