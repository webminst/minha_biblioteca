// src/components/admin/AdminBooksList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // Reutiliza o CSS geral de listas admin

function AdminBooksList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('userToken'); // Pega o token do localStorage
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // Faz a requisição GET para buscar os livros
            const response = await axios.get('http://localhost:3001/api/books', config);
            setBooks(response.data);
        } catch (err) {
            setError('Erro ao carregar livros: ' + (err.response?.data?.message || err.message));
            console.error('Erro ao buscar livros:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []); // O array vazio [] garante que a busca ocorra apenas uma vez ao montar o componente

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este livro?')) {
            try {
                const token = localStorage.getItem('userToken');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`http://localhost:3001/api/books/${id}`, config);
                // Atualiza a lista removendo o livro excluído
                setBooks(books.filter((book) => book._id !== id));
                alert('Livro excluído com sucesso!');
            } catch (err) {
                setError('Erro ao excluir livro: ' + (err.response?.data?.message || err.message));
                console.error('Erro ao excluir livro:', err);
            }
        }
    };

    if (loading) return <p>Carregando livros...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-list-container">
            <h2>Gerenciar Livros</h2>
            <Link to="/admin/livros/novo" className="btn-add-new">Adicionar Novo Livro</Link>

            {books.length === 0 ? (
                <p>Nenhum livro cadastrado ainda.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Série</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book._id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.series}</td>
                                <td>{new Date(book.date).toLocaleDateString()}</td>
                                <td className="actions">
                                    <Link to={`/admin/livros/editar/${book._id}`} className="btn-edit">Editar</Link>
                                    <button onClick={() => handleDelete(book._id)} className="btn-delete">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminBooksList;