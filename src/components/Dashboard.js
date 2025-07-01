// src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Criaremos este CSS também

function Dashboard({ user }) {
    return (
        <div className="dashboard-container">
            <h2>Painel Administrativo</h2>
            {user && (
                <p>Bem-vindo(a), <strong>{user.username}</strong>! ({user.role})</p>
            )}

            <h3>Gerenciar Conteúdo:</h3>
            <ul className="dashboard-links">
                <li>
                    <Link to="/admin/sermoes">Gerenciar Sermões</Link>
                </li>
                <li>
                    <Link to="/admin/estudos">Gerenciar Estudos</Link>
                </li>
                <li>
                    <Link to="/admin/livros">Gerenciar Livros</Link>
                </li>
                {/* Adicione outros links para gerenciar usuários, configurações, etc. */}
            </ul>

            {/* Aqui você pode exibir estatísticas, mensagens rápidas, etc. */}
        </div>
    );
}

export default Dashboard;