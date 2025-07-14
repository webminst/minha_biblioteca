// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './Dashboard.css';

function Dashboard({ user }) {
    const [counts, setCounts] = useState({
        sermons: 0,
        studies: 0,
        books: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            setLoading(true);

            const [sermonsRes, studiesRes, booksRes] = await Promise.all([
                fetch(`${API_ENDPOINTS.SERMONS.BASE}/count`),
                fetch(`${API_ENDPOINTS.STUDIES.BASE}/count`),
                fetch(`${API_ENDPOINTS.BOOKS.BASE}/count`)
            ]);

            const [sermonsData, studiesData, booksData] = await Promise.all([
                sermonsRes.json(),
                studiesRes.json(),
                booksRes.json()
            ]);

            setCounts({
                sermons: (sermonsData.success ? sermonsData.data.count : sermonsData.count) || 0,
                studies: (studiesData.success ? studiesData.data.count : studiesData.count) || 0,
                books: (booksData.success ? booksData.data.count : booksData.count) || 0
            });
        } catch (error) {
            console.error('Erro ao buscar contadores:', error);
            // Manter os valores padrão (0) em caso de erro
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Painel Administrativo</h2>
            {user && (
                <p>Bem-vindo(a), <strong>{user.username}</strong>! ({user.role})</p>
            )}

            <h3>Gerenciar Conteúdo:</h3>
            <div className="dashboard-links">
                <div className="dashboard-item">
                    <Link to="/admin/sermoes" className="dashboard-link">
                        Gerenciar Sermões
                    </Link>
                    <span className="item-count">
                        {loading ? 'Carregando...' : `${counts.sermons} sermão${counts.sermons !== 1 ? 'es' : ''} cadastrado${counts.sermons !== 1 ? 's' : ''}`}
                    </span>
                </div>

                <div className="dashboard-item">
                    <Link to="/admin/estudos" className="dashboard-link">
                        Gerenciar Estudos
                    </Link>
                    <span className="item-count">
                        {loading ? 'Carregando...' : `${counts.studies} estudo${counts.studies !== 1 ? 's' : ''} cadastrado${counts.studies !== 1 ? 's' : ''}`}
                    </span>
                </div>

                <div className="dashboard-item">
                    <Link to="/admin/livros" className="dashboard-link">
                        Gerenciar Livros
                    </Link>
                    <span className="item-count">
                        {loading ? 'Carregando...' : `${counts.books} livro${counts.books !== 1 ? 's' : ''} cadastrado${counts.books !== 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>

            {/* Estatísticas resumidas */}
            <div className="dashboard-stats">
                <h4>Resumo do Conteúdo:</h4>
                <p>Total de itens cadastrados: <strong>{loading ? '...' : counts.sermons + counts.studies + counts.books}</strong></p>
            </div>
        </div>
    );
}

export default Dashboard;