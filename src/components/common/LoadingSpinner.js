// src/components/common/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'medium',
    message = 'Carregando...',
    overlay = false,
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const containerClasses = overlay
        ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        : 'flex flex-col items-center justify-center p-8';

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="flex flex-col items-center space-y-4">
                {/* Spinner animado */}
                <div className={`${sizeClasses[size]} animate-spin`}>
                    <svg
                        className="w-full h-full text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>

                {/* Mensagem de loading */}
                {message && (
                    <p className="text-gray-600 text-sm font-medium animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// Componente específico para loading de conteúdo
export const ContentLoader = ({ lines = 3, className = '' }) => {
    return (
        <div className={`animate-pulse space-y-4 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
};

// Componente para loading de cards
export const CardLoader = ({ count = 3, className = '' }) => {
    return (
        <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse">
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSpinner;
