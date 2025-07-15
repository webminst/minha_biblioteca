// src/pages/admin/Audit.js
/**
 * Página de Auditoria Administrativa
 * Centraliza acesso aos logs e relatórios de auditoria
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditLogs from '../../components/admin/AuditLogs';
import axios from 'axios';
import './Audit.css';

const Audit = () => {
    const navigate = useNavigate();
    const [systemHealth, setSystemHealth] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSystemInfo();
    }, []);

    const loadSystemInfo = async () => {
        try {
            const [healthResponse, configResponse] = await Promise.all([
                axios.get('/api/audit/health'),
                axios.get('/api/audit/config')
            ]);

            setSystemHealth(healthResponse.data.data);
            setConfig(configResponse.data.data);
        } catch (error) {
            console.error('Erro ao carregar informações do sistema:', error);
        } finally {
            setLoading(false);
        }
    };

    const performCleanup = async () => {
        try {
            await axios.post('/api/audit/cleanup');
            alert('Limpeza de logs executada com sucesso!');
        } catch (error) {
            alert('Erro ao executar limpeza: ' + error.response?.data?.message);
        }
    };

    if (loading) {
        return (
            <div className="audit-page-loading">
                <div className="spinner"></div>
                <p>Carregando painel de auditoria...</p>
            </div>
        );
    }

    return (
        <div className="audit-page">
            {/* Botão Voltar */}
            <div className="page-header-top">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="btn btn-secondary btn-back"
                >
                    ← Voltar ao Dashboard
                </button>
            </div>

            {/* Header da Página */}
            <div className="audit-page-header">
                <h1>Painel de Auditoria</h1>
                <p>Monitor completo de atividades administrativas e segurança do sistema</p>
            </div>

            {/* Status do Sistema */}
            <div className="system-status">
                <h3>Status do Sistema de Auditoria</h3>
                <div className="status-grid">
                    <div className={`status-card ${systemHealth?.status === 'healthy' ? 'healthy' : 'degraded'}`}>
                        <h4>Status Geral</h4>
                        <p className="status-value">
                            {systemHealth?.status === 'healthy' ? 'Saudável' : 'Degradado'}
                        </p>
                    </div>

                    <div className={`status-card ${systemHealth?.components?.redis?.status === 'up' ? 'healthy' : 'degraded'}`}>
                        <h4>Redis</h4>
                        <p className="status-value">
                            {systemHealth?.components?.redis?.connected ? 'Conectado' : 'Desconectado'}
                        </p>
                    </div>

                    <div className="status-card healthy">
                        <h4>Serviço de Auditoria</h4>
                        <p className="status-value">Ativo</p>
                        <small>Uptime: {Math.floor(systemHealth?.components?.auditService?.uptime || 0)}s</small>
                    </div>

                    <div className="status-card healthy">
                        <h4>Configuração</h4>
                        <p className="status-value">
                            {config?.storage?.strategy || 'N/A'}
                        </p>
                        <small>
                            {config?.performance?.async ? 'Assíncrono' : 'Síncrono'} |
                            TTL: {config?.storage?.redis?.ttl || 'N/A'}s
                        </small>
                    </div>
                </div>
            </div>

            {/* Configurações Ativas */}
            {config && (
                <div className="audit-config">
                    <h3>Configurações Ativas</h3>
                    <div className="config-grid">
                        <div className="config-section">
                            <h4>Logging</h4>
                            <ul>
                                <li><strong>Nível:</strong> {config.logging.level}</li>
                                <li><strong>Ações Habilitadas:</strong> {config.logging.enabledActions.length}</li>
                                <li><strong>Recursos Monitorados:</strong> {config.logging.enabledResources.join(', ')}</li>
                            </ul>
                        </div>

                        <div className="config-section">
                            <h4>Armazenamento</h4>
                            <ul>
                                <li><strong>Estratégia:</strong> {config.storage.strategy}</li>
                                <li><strong>TTL Redis:</strong> {config.storage.redis.ttl}s</li>
                                <li><strong>Max Logs:</strong> {config.storage.redis.maxLogs}</li>
                            </ul>
                        </div>

                        <div className="config-section">
                            <h4>Performance</h4>
                            <ul>
                                <li><strong>Assíncrono:</strong> {config.performance.async ? 'Sim' : 'Não'}</li>
                                <li><strong>Buffer:</strong> {config.performance.buffer ? 'Ativo' : 'Inativo'}</li>
                                <li><strong>Interval Batch:</strong> {config.performance.batchInterval}ms</li>
                            </ul>
                        </div>

                        <div className="config-section">
                            <h4>Alertas</h4>
                            <ul>
                                <li><strong>Status:</strong> {config.alerts.enabled ? 'Habilitados' : 'Desabilitados'}</li>
                                <li><strong>Regras Ativas:</strong> {config.alerts.rules.length}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Ações de Manutenção */}
            <div className="maintenance-actions">
                <h3>Ações de Manutenção</h3>
                <div className="actions-grid">
                    <button
                        onClick={performCleanup}
                        className="maintenance-btn cleanup"
                    >
                        Limpar Logs Antigos
                    </button>

                    <button
                        onClick={loadSystemInfo}
                        className="maintenance-btn refresh"
                    >
                        Atualizar Status
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="maintenance-btn restart"
                    >
                        Recarregar Painel
                    </button>
                </div>
            </div>

            {/* Componente Principal de Logs */}
            <AuditLogs />

            {/* Footer Informativo */}
            <div className="audit-footer">
                <p>
                    Sistema de Auditoria do aplicativo Minha Biblioteca v1.0 |
                    Gerado em {new Date().toLocaleString('pt-BR')} |
                    <strong>Documento Confidencial</strong></p>
                <p>Acesso restrito a administradores
                </p>
            </div>
        </div>
    );
};

export default Audit;
