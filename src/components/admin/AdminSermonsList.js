// src/components/admin/AdminSermonsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // CSS geral para listas admin

function AdminSermonsList() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('date-desc'); // Estado para controlar a ordenação
  const [sortedSermons, setSortedSermons] = useState([]); // Estado para sermões ordenados

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
      const response = await axios.get('http://localhost:3002/api/sermons', config);
      setSermons(response.data);
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
        await axios.delete(`http://localhost:3002/api/sermons/${id}`, config);
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
    }
  }, [sermons, sortOrder]);

  // Função para alterar a ordenação
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-list-container">
      <h2>Gerenciar Sermões</h2>

      <div className="admin-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        <Link to="/admin/sermoes/novo" className="btn-add-new">Adicionar Novo Sermão</Link>

        <div className="sort-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            {sortedSermons.map((sermon) => (
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
      )}
    </div>
  );
}

export default AdminSermonsList;