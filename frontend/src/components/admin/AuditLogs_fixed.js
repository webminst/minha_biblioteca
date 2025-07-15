// src/components/admin/AuditLogs.js
/**
 * Componente de Visualização de Logs de Auditoria
 * Dashboard para administradores acompanharem atividades do sistema
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuditLogs.css';

const AuditLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        userId: '',
        startDate: '',
        endDate: '',
        limit: 50
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Carrega dados iniciais
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [logsResponse, statsResponse, summaryResponse] = await Promise.all([
                axios.get('/api/audit/logs', {
                    params: { limit: filters.limit }
                }),
                axios.get('/api/audit/stats'),
                axios.get('/api/audit/summary')
            ]);

            setLogs(logsResponse.data.data?.logs || logsResponse.data.logs || []);
            setStats(statsResponse.data.data || statsResponse.data || {});
            setSummary(summaryResponse.data.data || summaryResponse.data || {});
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar dados de auditoria');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/audit/logs', {
                params: {
                    ...filters,
                    offset: (currentPage - 1) * filters.limit
                }
            });

            setLogs(response.data.data.logs || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao aplicar filtros');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            resource: '',
            userId: '',
            startDate: '',
            endDate: '',
            limit: 50
        });
        setCurrentPage(1);
        loadInitialData();
    };

    const exportLogs = async (format = 'json') => {
        try {
            const response = await axios.get('/api/audit/export', {
                params: {
                    format,
                    ...filters
                },
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            if (format === 'csv') {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'audit-logs.csv';
                link.click();
                window.URL.revokeObjectURL(url);
            } else {
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'audit-logs.json';
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao exportar logs');
        }
    };

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    const getActionColor = (action) => {
        const colors = {
            'CREATE': 'success',
            'UPDATE': 'warning',
            'DELETE': 'danger',
            'LOGIN': 'info',
            'LOGOUT': 'secondary',
            'REGISTER': 'primary'
        };
        return colors[action] || 'light';
    };

    const getCriticalityColor = (criticality) => {
        const colors = {
            'low': 'success',
            'normal': 'info',
            'high': 'warning',
            'critical': 'danger'
        };
        return colors[criticality] || 'secondary';
    };

    if (loading) {
        return (
            <div className="audit-logs-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando logs de auditoria...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="audit-logs-container">
            <div className="audit-header">
                <div className="header-top">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn btn-secondary btn-back"
                    >
                        ← Voltar ao Dashboard
                    </button>
                </div>
                <h2>Logs de Auditoria</h2>
                <p>Monitor de atividades administrativas em tempo real</p>
            </div>

            {loading && (
                <div className="audit-loading">
                    <p>Carregando dados de auditoria...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    <strong>Erro:</strong> {error}
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {!loading && (
                <>
                    {/* Resumo Executivo */}
                    {summary && (
                        <div className="audit-summary">
                            <h3>Resumo das Últimas 24 Horas</h3>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <h4>{summary.last24Hours?.totalLogs || 0}</h4>
                                    <p>Total de Logs</p>
                                </div>
                                <div className="summary-card">
                                    <h4>{summary.last24Hours?.activeUsers || 0}</h4>
                                    <p>Usuários Ativos</p>
                                </div>
                                <div className="summary-card">
                                    <h4>{summary.security?.criticalLogsCount || 0}</h4>
                                    <p>Logs Críticos</p>
                                </div>
                                <div className="summary-card">
                                    <h4>{summary.last7Days?.averagePerDay || 0}</h4>
                                    <p>Média Diária (7d)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filtros */}
                    <div className="audit-filters">
                        <h4>Filtros</h4>
                        <div className="filters-grid">
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                            >
                                <option value="">Todas as Ações</option>
                                <option value="CREATE">Criação</option>
                                <option value="UPDATE">Atualização</option>
                                <option value="DELETE">Exclusão</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="REGISTER">Registro</option>
                            </select>

                            <select
                                value={filters.resource}
                                onChange={(e) => handleFilterChange('resource', e.target.value)}
                            >
                                <option value="">Todos os Recursos</option>
                                <option value="auth">Autenticação</option>
                                <option value="books">Livros</option>
                                <option value="sermons">Sermões</option>
                                <option value="studies">Estudos</option>
                                <option value="security">Segurança</option>
                            </select>

                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                placeholder="Data Inicial"
                            />

                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                placeholder="Data Final"
                            />

                            <select
                                value={filters.limit}
                                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            >
                                <option value={25}>25 registros</option>
                                <option value={50}>50 registros</option>
                                <option value={100}>100 registros</option>
                                <option value={200}>200 registros</option>
                            </select>
                        </div>

                        <div className="filter-actions">
                            <button onClick={applyFilters} className="btn btn-primary">
                                Aplicar Filtros
                            </button>
                            <button onClick={clearFilters} className="btn btn-success">
                                Limpar
                            </button>
                            <button onClick={() => exportLogs('json')} className="btn btn-success">
                                Exportar JSON
                            </button>
                            <button onClick={() => exportLogs('csv')} className="btn btn-success">
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    {stats && Object.keys(stats).length > 0 && (
                        <div className="audit-stats">
                            <h4>Estatísticas ({stats.timeRange})</h4>
                            <div className="stats-grid">
                                <div className="stat-section">
                                    <h5>Ações Mais Frequentes</h5>
                                    {Object.entries(stats.byAction || {}).slice(0, 5).map(([action, count]) => (
                                        <div key={action} className="stat-item">
                                            <span className={`badge badge-${getActionColor(action)}`}>
                                                {action}
                                            </span>
                                            <span className="count">{count}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="stat-section">
                                    <h5>Recursos Mais Acessados</h5>
                                    {Object.entries(stats.byResource || {}).slice(0, 5).map(([resource, count]) => (
                                        <div key={resource} className="stat-item">
                                            <span className="resource-name">{resource}</span>
                                            <span className="count">{count}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="stat-section">
                                    <h5>Usuários Mais Ativos</h5>
                                    {Object.entries(stats.byUser || {}).slice(0, 5).map(([user, count]) => (
                                        <div key={user} className="stat-item">
                                            <span className="user-name">{user}</span>
                                            <span className="count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de Logs */}
                    <div className="audit-logs-list">
                        <h4>Logs Detalhados ({logs.length} registros)</h4>

                        {logs.length === 0 ? (
                            <div className="no-logs">
                                <p>Nenhum log encontrado com os filtros aplicados.</p>
                            </div>
                        ) : (
                            <div className="logs-table-container">
                                <table className="logs-table">
                                    <thead>
                                        <tr>
                                            <th>Data/Hora</th>
                                            <th>Usuário</th>
                                            <th>Ação</th>
                                            <th>Recurso</th>
                                            <th>Status</th>
                                            <th>IP</th>
                                            <th>Duração</th>
                                            <th>Criticidade</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.traceId} className={log.response.success ? '' : 'error-row'}>
                                                <td className="timestamp">
                                                    {formatDateTime(log.timestamp)}
                                                </td>
                                                <td className="user">
                                                    {log.user ? (
                                                        <div>
                                                            <strong>{log.user.username}</strong>
                                                            <small>({log.user.role})</small>
                                                        </div>
                                                    ) : (
                                                        <span className="anonymous">Anônimo</span>
                                                    )}
                                                </td>
                                                <td className="action">
                                                    <span className={`badge badge-${getActionColor(log.action.type)}`}>
                                                        {log.action.type}
                                                    </span>
                                                </td>
                                                <td className="resource">
                                                    {log.action.resource}
                                                    {log.action.resourceId && (
                                                        <small>#{log.action.resourceId.substring(0, 8)}...</small>
                                                    )}
                                                </td>
                                                <td className="status">
                                                    <span className={`status-badge ${log.response.success ? 'success' : 'error'}`}>
                                                        {log.response.status}
                                                    </span>
                                                </td>
                                                <td className="ip">
                                                    {log.request.ip}
                                                </td>
                                                <td className="duration">
                                                    {log.metadata.duration}ms
                                                </td>
                                                <td className="criticality">
                                                    <span className={`badge badge-${getCriticalityColor(log.action.criticality)}`}>
                                                        {log.action.criticality}
                                                    </span>
                                                </td>
                                                <td className="actions">
                                                    <button
                                                        onClick={() => {
                                                            console.log('Log details:', log);
                                                            // TODO: Implementar modal de detalhes
                                                        }}
                                                        className="btn btn-sm btn-info"
                                                    >
                                                        Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Atividade Recente */}
                    {stats && stats.recentActivity && stats.recentActivity.length > 0 && (
                        <div className="recent-activity">
                            <h4>Atividade Recente</h4>
                            <div className="activity-timeline">
                                {stats.recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-time">
                                            {formatDateTime(activity.timestamp)}
                                        </div>
                                        <div className="activity-content">
                                            <span className={`badge badge-${getActionColor(activity.action)}`}>
                                                {activity.action}
                                            </span>
                                            <span className="activity-resource">{activity.resource}</span>
                                            {activity.user && (
                                                <span className="activity-user">por {activity.user}</span>
                                            )}
                                            <span className={`activity-status ${activity.success ? 'success' : 'error'}`}>
                                                {activity.success ? 'Sucesso' : 'Erro'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AuditLogs;
