import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Componente de estrelas para avaliação

export default function StarRating({ bookId, apiBase = '/api/books' }) {
    const [average, setAverage] = useState(null);
    const [total, setTotal] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasRated, setHasRated] = useState(false);

    // Gera ou recupera um ID único para o dispositivo
    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    // Verifica se o usuário já avaliou este conteúdo
    useEffect(() => {
        const ratings = JSON.parse(localStorage.getItem('userRatings') || '{}');
        if (ratings[bookId]) {
            setUserRating(ratings[bookId]);
            setHasRated(true);
        }
    }, [bookId]);

    // Busca média e total de avaliações
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await fetch(`${apiBase}/${bookId}/ratings`);
                if (!response.ok) throw new Error('Erro ao carregar avaliações');
                const data = await response.json();
                setAverage(data.average);
                setTotal(data.total);
            } catch (err) {
                console.error('Erro ao carregar avaliações:', err);
            }
        };
        
        fetchRatings();
    }, [bookId, apiBase]);

    // Envia avaliação do usuário
    const rate = async (stars) => {
        if (hasRated) return; // Impede múltiplas avaliações
        
        setLoading(true);
        setError('');
        
        try {
            const deviceId = getDeviceId();
            const response = await fetch(`${apiBase}/${bookId}/rate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Device-Id': deviceId // Envia o ID do dispositivo
                },
                body: JSON.stringify({ 
                    stars,
                    deviceId // Também no corpo para compatibilidade
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao registrar avaliação');
            }
            
            // Atualiza o estado local
            setUserRating(stars);
            setHasRated(true);
            
            // Armazena a avaliação no localStorage
            const ratings = JSON.parse(localStorage.getItem('userRatings') || '{}');
            ratings[bookId] = stars;
            localStorage.setItem('userRatings', JSON.stringify(ratings));
            
            // Atualiza a média
            const data = await response.json();
            setAverage(data.average);
            setTotal(data.total);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="star-rating-container">
            <div className="rating-label">Avaliar:</div>
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${(hover || userRating || average) >= star ? 'active' : ''} ${hasRated ? 'disabled' : 'clickable'}`}
                        onMouseEnter={() => !hasRated && setHover(star)}
                        onMouseLeave={() => !hasRated && setHover(0)}
                        onClick={() => !hasRated && rate(star)}
                        title={!hasRated ? `Avaliar com ${star} estrela(s)` : 'Obrigado por avaliar!'}
                    >
                        ★
                    </span>
                ))}
                <span className="rating-text">
                    {average !== null ? `${Number(average).toFixed(1)}/5` : 'Seja o primeiro a avaliar'} ({total})
                </span>
            </div>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Avaliando...</div>}
            <style jsx>{`
                .star-rating-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 10px 0;
                }
                .rating-label {
                    font-weight: bold;
                    white-space: nowrap;
                }
                .stars-container {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }
                .star {
                    font-size: 24px;
                    cursor: pointer;
                    color: #ccc;
                    transition: color 0.2s;
                }
                .star.active {
                    color: #FFD700;
                }
                .star.clickable:hover {
                    color: #FFD700;
                    transform: scale(1.2);
                }
                .star.disabled {
                    cursor: default;
                }
                .rating-text {
                    margin-left: 8px;
                    font-size: 0.9em;
                    color: #666;
                }
                .error-message {
                    color: #ff4444;
                    margin-top: 5px;
                    font-size: 0.9em;
                }
                .loading-message {
                    color: #666;
                    font-style: italic;
                    margin-top: 5px;
                    font-size: 0.9em;
                }
            `}</style>
        </div>
    );
}

StarRating.propTypes = {
    bookId: PropTypes.string.isRequired,
    apiBase: PropTypes.string
};
