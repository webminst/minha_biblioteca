// src/components/admin/AdminSermonsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // CSS geral para listas admin

function AdminSermonsList() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await axios.get('http://localhost:3001/api/sermons', config);
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
        await axios.delete(`http://localhost:3001/api/sermons/${id}`, config);
        // Atualiza a lista removendo o sermão excluído
        setSermons(sermons.filter((sermon) => sermon._id !== id));
        alert('Sermão excluído com sucesso!');
      } catch (err) {
        setError('Erro ao excluir sermão: ' + (err.response?.data?.message || err.message));
        console.error('Erro ao excluir sermão:', err);
      }
    }
  };

  if (loading) return <p>Carregando sermões...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-list-container">
      <h2>Gerenciar Sermões</h2>
      <Link to="/admin/sermoes/novo" className="btn-add-new">Adicionar Novo Sermão</Link>

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
            {sermons.map((sermon) => (
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