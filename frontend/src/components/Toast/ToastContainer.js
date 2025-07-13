// src/components/Toast/ToastContainer.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
import './Toast.css';

/**
 * Context para gerenciar notificações Toast
 */
const ToastContext = createContext();

/**
 * Hook para usar o sistema de Toast
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de ToastProvider');
    }
    return context;
};

/**
 * Provider do sistema de Toast
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Adiciona um novo toast
    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const duration = options.duration || (type === 'error' ? 6000 : 4000);

        const toast = {
            id,
            message,
            type,
            duration,
            ...options
        };

        setToasts(prev => [...prev, toast]);

        // Remove automaticamente após o tempo especificado
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    // Remove um toast específico
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Remove todos os toasts
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Funções de conveniência
    const showSuccess = useCallback((message, options) => {
        return addToast(message, 'success', options);
    }, [addToast]);

    const showError = useCallback((message, options) => {
        return addToast(message, 'error', options);
    }, [addToast]);

    const showWarning = useCallback((message, options) => {
        return addToast(message, 'warning', options);
    }, [addToast]);

    const showInfo = useCallback((message, options) => {
        return addToast(message, 'info', options);
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

/**
 * Container que renderiza todos os toasts
 */
const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};
