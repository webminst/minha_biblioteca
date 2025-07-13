// Exemplo de uso dos novos componentes e hooks
// Este arquivo demonstra como implementar as melhorias

// ========== EXEMPLO 1: Usando useApi hook ==========
// src/components/admin/AdminSermonsList.js (versão melhorada)

import React, { useState } from 'react';
import { useApi, usePagination } from '../../hooks/useApi';
import { useToast } from '../../components/Toast/ToastContainer';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import SkeletonLoader from '../../components/Loading/SkeletonLoader';
import { API_ENDPOINTS } from '../../config/api';

function AdminSermonsListImproved() {
    const { showSuccess, showError } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // Hook customizado para buscar sermões
    const {
        data: sermons = [],
        loading,
        error,
        refetch
    } = useApi(API_ENDPOINTS.SERMONS.BASE);

    // Hook para paginação
    const {
        currentItems,
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNext,
        hasPrev
    } = usePagination(sermons, 10);

    // Função para deletar sermão com feedback melhorado
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${title}"?`)) return;

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(API_ENDPOINTS.SERMONS.BY_ID(id), {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSuccess(`Sermão "${title}" excluído com sucesso!`);
            refetch(); // Revalida os dados
        } catch (err) {
            showError(`Erro ao excluir sermão: ${err.response?.data?.message || err.message}`);
        }
    };

    // Filtrar sermões por termo de busca
    const filteredSermons = sermons.filter(sermon =>
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.bibleReference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <SkeletonLoader type="admin-list" items={10} />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-list-container">
            <h2>Gerenciar Sermões</h2>

            {/* Campo de busca */}
            <input
                type="text"
                placeholder="Buscar sermões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            {/* Lista de sermões */}
            {filteredSermons.map(sermon => (
                <div key={sermon._id} className="admin-item">
                    <div className="item-info">
                        <h3>{sermon.title}</h3>
                        <p>{sermon.bibleReference}</p>
                        <span>{new Date(sermon.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="item-actions">
                        <button onClick={() => navigate(`/admin/sermoes/editar/${sermon._id}`)}>
                            Editar
                        </button>
                        <button
                            onClick={() => handleDelete(sermon._id, sermon.title)}
                            className="btn-danger"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            ))}

            {/* Paginação */}
            <div className="pagination">
                <button onClick={prevPage} disabled={!hasPrev}>
                    Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={nextPage} disabled={!hasNext}>
                    Próxima
                </button>
            </div>
        </div>
    );
}

// ========== EXEMPLO 2: Formulário com Toast e Loading ==========
// src/components/admin/SermonForm.js (versão melhorada)

import { useMutation } from '../../hooks/useApi';
import { useToast } from '../../components/Toast/ToastContainer';

function SermonFormImproved() {
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    // Hook para mutações (criar/editar)
    const { mutate: saveSermon, loading } = useMutation(async (sermonData) => {
        const token = localStorage.getItem('userToken');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        if (isEditing) {
            return axios.patch(API_ENDPOINTS.SERMONS.BY_ID(id), sermonData, config);
        } else {
            return axios.post(API_ENDPOINTS.SERMONS.BASE, sermonData, config);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await saveSermon(sermonData);

            showSuccess(
                isEditing ? 'Sermão atualizado com sucesso!' : 'Sermão criado com sucesso!',
                { duration: 3000 }
            );

            navigate('/admin/sermoes');
        } catch (err) {
            showError(
                `Erro ao salvar sermão: ${err.response?.data?.message || err.message}`,
                { duration: 6000 }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className={loading ? 'form-loading' : ''}>
            {/* Campos do formulário... */}

            <button
                type="submit"
                disabled={loading}
                className={loading ? 'button-loading' : ''}
            >
                <span>{isEditing ? 'Atualizar' : 'Criar'} Sermão</span>
            </button>
        </form>
    );
}

// ========== EXEMPLO 3: Página com Error Boundary ==========
// src/pages/Sermons.js (versão melhorada)

import ErrorBoundary from '../components/ErrorBoundary';
import SkeletonLoader from '../components/Loading/SkeletonLoader';

function SermonsPageImproved() {
    const { data: sermons, loading, error, refetch } = useApi(API_ENDPOINTS.SERMONS.BASE);

    if (loading) return <SkeletonLoader type="grid" columns={2} items={6} />;
    if (error) {
        return (
            <div className="error-container">
                <p>Erro ao carregar sermões: {error}</p>
                <button onClick={refetch}>Tentar Novamente</button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="sermons-page">
                <h1>Sermões</h1>
                <div className="sermons-grid">
                    {sermons.map(sermon => (
                        <SermonCard key={sermon._id} sermon={sermon} />
                    ))}
                </div>
            </div>
        </ErrorBoundary>
    );
}

// ========== EXEMPLO 4: Usando localStorage hook ==========
// src/hooks/useAuth.js

import { useLocalStorage } from './useApi';

export const useAuth = () => {
    const [token, setToken] = useLocalStorage('userToken', null);
    const [user, setUser] = useLocalStorage('user', null);

    const login = (tokenData, userData) => {
        setToken(tokenData);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return {
        token,
        user,
        login,
        logout,
        isAuthenticated
    };
};

export default {
    // Exemplos de implementação das melhorias sugeridas
    // Estes componentes demonstram o uso dos novos hooks e padrões
};
