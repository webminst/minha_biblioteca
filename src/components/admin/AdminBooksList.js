// src/components/admin/AdminBooksList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminList.css'; // Reutiliza o CSS geral de listas admin

function AdminBooksList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('date-desc'); // Estado para controlar a ordenação
    const [sortedBooks, setSortedBooks] = useState([]); // Estado para livros ordenados

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
                const updatedBooks = books.filter((book) => book._id !== id);
                setBooks(updatedBooks);
                alert('Livro excluído com sucesso!');
            } catch (err) {
                setError('Erro ao excluir livro: ' + (err.response?.data?.message || err.message));
                console.error('Erro ao excluir livro:', err);
            }
        }
    };

    // Função para ordenar os livros
    const sortBooks = (booksArray, order) => {
        const sorted = [...booksArray];

        switch (order) {
            case 'alphabetical-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'alphabetical-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'author-asc':
                return sorted.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
            case 'author-desc':
                return sorted.sort((a, b) => (b.author || '').localeCompare(a.author || ''));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return sorted;
        }
    };

    // useEffect para ordenar livros quando books ou sortOrder mudarem
    useEffect(() => {
        if (books.length > 0) {
            const sorted = sortBooks(books, sortOrder);
            setSortedBooks(sorted);
        }
    }, [books, sortOrder]);

    // Função para alterar a ordenação
    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    if (loading) return <p>Carregando livros...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-list-container">
            <h2>Gerenciar Livros</h2>

            <div className="admin-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                <Link to="/admin/livros/novo" className="btn-add-new">Adicionar Novo Livro</Link>

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
                        <option value="author-asc">Autor (A-Z)</option>
                        <option value="author-desc">Autor (Z-A)</option>
                    </select>
                </div>
            </div>

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
                        {sortedBooks.map((book) => (
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