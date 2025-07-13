// src/components/admin/AdminSermonsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { Link, useNavigate } from 'react-router-dom';
import './AdminList.css'; // CSS geral para listas admin

function AdminSermonsList() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('date-desc'); // Estado para controlar a ordenação
  const [sortedSermons, setSortedSermons] = useState([]); // Estado para sermões ordenados
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [pageSize, setPageSize] = useState(10); // Itens por página
  const navigate = useNavigate(); // Hook para navegação

  const fetchSermons = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken'); // Pega o token do localStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Faz a requisição GET para buscar os sermões
      const response = await axios.get(API_ENDPOINTS.SERMONS.BASE, config);

      // Verifica se a resposta tem a nova estrutura com sermons
      const sermonsData = response.data.sermons || response.data;
      setSermons(Array.isArray(sermonsData) ? sermonsData : []);
    } catch (err) {
      setError('Erro ao carregar sermões: ' + (err.response?.data?.message || err.message));
      console.error('Erro ao buscar sermões:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este sermão?')) {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(API_ENDPOINTS.SERMONS.BY_ID(id), config);
        // Atualiza a lista removendo o sermão excluído
        const updatedSermons = sermons.filter((sermon) => sermon._id !== id);
        setSermons(updatedSermons);
        alert('Sermão excluído com sucesso!');
      } catch (err) {
        setError('Erro ao excluir sermão: ' + (err.response?.data?.message || err.message));
        console.error('Erro ao excluir sermão:', err);
      }
    }
  };

  // Função para ordenar os sermões
  const sortSermons = (sermonsArray, order) => {
    const sorted = [...sermonsArray];

    switch (order) {
      case 'alphabetical-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'alphabetical-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'reference-asc':
        return sorted.sort((a, b) => (a.bibleReference || '').localeCompare(b.bibleReference || ''));
      case 'reference-desc':
        return sorted.sort((a, b) => (b.bibleReference || '').localeCompare(a.bibleReference || ''));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      default:
        return sorted;
    }
  };

  // useEffect para ordenar sermões quando sermons ou sortOrder mudarem
  useEffect(() => {
    if (sermons.length > 0) {
      const sorted = sortSermons(sermons, sortOrder);
      setSortedSermons(sorted);
      setCurrentPage(1); // Reset para primeira página quando ordenação muda
    }
  }, [sermons, sortOrder]);

  // Função para alterar a ordenação
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Funções de paginação
  const totalPages = Math.ceil(sortedSermons.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSermons = sortedSermons.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset para primeira página
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          ← Anterior
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="pagination-button">1</button>
            {startPage > 2 && <span className="pagination-info">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-info">...</span>}
            <button onClick={() => handlePageChange(totalPages)} className="pagination-button">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Próxima →
        </button>
      </div>
    );
  };

  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-list-container">
      <h2>Gerenciar Sermões</h2>

      <div className="admin-controls">
        <div className="admin-buttons-group">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn-back"
          >
            ← Voltar
          </button>
          <Link to="/admin/sermoes/novo" className="btn-add-new">
            Adicionar Novo Sermão
          </Link>
        </div>

        <div className="sort-controls">
          <label htmlFor="sortOrder" style={{ fontWeight: 'bold', minWidth: 'fit-content' }}>Ordenar por:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortChange}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            <option value="date-desc">Data (Mais recente primeiro)</option>
            <option value="date-asc">Data (Mais antigo primeiro)</option>
            <option value="alphabetical-asc">Título (A-Z)</option>
            <option value="alphabetical-desc">Título (Z-A)</option>
            <option value="reference-asc">Referência (A-Z)</option>
            <option value="reference-desc">Referência (Z-A)</option>
          </select>
        </div>
      </div>

      {sermons.length === 0 ? (
        <p>Nenhum sermão cadastrado ainda.</p>
      ) : (
        <>
          <div className="pagination-info" style={{ textAlign: 'left', marginBottom: '10px', color: '#666' }}>
            Exibindo {startIndex + 1} a {Math.min(endIndex, sortedSermons.length)} de {sortedSermons.length} sermões
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Referência</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentSermons.map((sermon) => (
                <tr key={sermon._id}>
                  <td>{sermon.title}</td>
                  <td>{sermon.bibleReference}</td>
                  <td>{new Date(sermon.date).toLocaleDateString()}</td>
                  <td className="actions">
                    <Link to={`/admin/sermoes/editar/${sermon._id}`} className="btn-edit">Editar</Link>
                    <button onClick={() => handleDelete(sermon._id)} className="btn-delete">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {renderPagination()}

          <div className="page-size-controls">
            <label htmlFor="pageSize">Itens por página:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminSermonsList;