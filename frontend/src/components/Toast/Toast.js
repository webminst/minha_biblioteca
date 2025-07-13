// src/components/Toast/Toast.js
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationTriangle,
    faInfoCircle,
    faTimes,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './Toast.css';

/**
 * Componente Toast individual
 */
const Toast = ({
    id,
    message,
    type = 'info',
    duration = 4000,
    onClose,
    title,
    action
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Animação de entrada
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Remove o toast
    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300); // Tempo da animação de saída
    };

    // Ícones por tipo
    const icons = {
        success: faCheckCircle,
        error: faExclamationCircle,
        warning: faExclamationTriangle,
        info: faInfoCircle
    };

    return (
        <div
            className={`
        toast 
        toast-${type} 
        ${isVisible ? 'toast-visible' : ''} 
        ${isLeaving ? 'toast-leaving' : ''}
      `}
            role="alert"
            aria-live="polite"
        >
            {/* Ícone */}
            <div className="toast-icon">
                <FontAwesomeIcon icon={icons[type]} />
            </div>

            {/* Conteúdo */}
            <div className="toast-content">
                {title && <div className="toast-title">{title}</div>}
                <div className="toast-message">{message}</div>
                {action && (
                    <div className="toast-action">
                        {action}
                    </div>
                )}
            </div>

            {/* Botão fechar */}
            <button
                className="toast-close"
                onClick={handleClose}
                aria-label="Fechar notificação"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Barra de progresso (se tiver duração) */}
            {duration > 0 && (
                <div
                    className="toast-progress"
                    style={{ animationDuration: `${duration}ms` }}
                />
            )}
        </div>
    );
};

export default Toast;
