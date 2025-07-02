// src/components/admin/AdminStudiesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // Reutiliza o CSS geral de listas admin

function AdminStudiesList() {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setStudies(studies.filter((study) => study._id !== id));
                alert('Estudo excluído com sucesso!');
            } catch (err) {
                setError('Erro ao excluir estudo: ' + (err.response?.data?.message || err.message));
                console.error('Erro ao excluir estudo:', err);
            }
        }
    };

    if (loading) return <p>Carregando estudos...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-list-container">
            <h2>Gerenciar Estudos Bíblicos</h2>
            <Link to="/admin/estudos/novo" className="btn-add-new">Adicionar Novo Estudo</Link>

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
                        {studies.map((study) => (
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