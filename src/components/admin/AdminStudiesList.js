// src/components/admin/AdminStudiesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // Reutiliza o CSS geral de listas admin

function AdminStudiesList() {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('date-desc'); // Estado para controlar a ordenação
    const [sortedStudies, setSortedStudies] = useState([]); // Estado para estudos ordenados

    const fetchStudies = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('userToken'); // Pega o token do localStorage
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // Faz a requisição GET para buscar os estudos
            const response = await axios.get('http://localhost:3001/api/studies', config);
            setStudies(response.data);
        } catch (err) {
            setError('Erro ao carregar estudos: ' + (err.response?.data?.message || err.message));
            console.error('Erro ao buscar estudos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudies();
    }, []); // O array vazio [] garante que a busca ocorra apenas uma vez ao montar o componente

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este estudo?')) {
            try {
                const token = localStorage.getItem('userToken');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`http://localhost:3001/api/studies/${id}`, config);
                // Atualiza a lista removendo o estudo excluído
                const updatedStudies = studies.filter((study) => study._id !== id);
                setStudies(updatedStudies);
                alert('Estudo excluído com sucesso!');
            } catch (err) {
                setError('Erro ao excluir estudo: ' + (err.response?.data?.message || err.message));
                console.error('Erro ao excluir estudo:', err);
            }
        }
    };

    // Função para ordenar os estudos
    const sortStudies = (studiesArray, order) => {
        const sorted = [...studiesArray];

        switch (order) {
            case 'alphabetical-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'alphabetical-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return sorted;
        }
    };

    // useEffect para ordenar estudos quando studies ou sortOrder mudarem
    useEffect(() => {
        if (studies.length > 0) {
            const sorted = sortStudies(studies, sortOrder);
            setSortedStudies(sorted);
        }
    }, [studies, sortOrder]);

    // Função para alterar a ordenação
    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    if (loading) return <p>Carregando estudos...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-list-container">
            <h2>Gerenciar Estudos Bíblicos</h2>

            <div className="admin-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                <Link to="/admin/estudos/novo" className="btn-add-new">Adicionar Novo Estudo</Link>

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
                    </select>
                </div>
            </div>

            {studies.length === 0 ? (
                <p>Nenhum estudo cadastrado ainda.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Tema</th>
                            <th>Formato</th>
                            <th>Referência</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStudies.map((study) => (
                            <tr key={study._id}>
                                <td>{study.title}</td>
                                <td>{study.theme}</td>
                                <td>{study.format}</td>
                                <td>{study.bibleReference}</td>
                                <td>{new Date(study.date).toLocaleDateString()}</td>
                                <td className="actions">
                                    <Link to={`/admin/estudos/editar/${study._id}`} className="btn-edit">Editar</Link>
                                    <button onClick={() => handleDelete(study._id)} className="btn-delete">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminStudiesList;