import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Componente de estrelas para avaliação

export default function StarRating({ bookId, userToken, apiBase = '/api/books' }) {
    const [average, setAverage] = useState(null);
    const [total, setTotal] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Busca média e total de avaliações
    useEffect(() => {
        fetch(`${apiBase}/${bookId}/ratings`)
            .then(res => res.json())
            .then(data => {
                setAverage(data.average);
                setTotal(data.total);
            });
    }, [bookId, apiBase]);

    // Envia avaliação do usuário
    const rate = async (stars) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${apiBase}/${bookId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
                },
                body: JSON.stringify({ stars })
            });
            if (!res.ok) throw new Error('Erro ao registrar avaliação');
            setUserRating(stars);
            // Atualiza média
            const data = await fetch(`${apiBase}/${bookId}/ratings`).then(r => r.json());
            setAverage(data.average);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        style={{
                            cursor: userToken ? 'pointer' : 'default',
                            color: (hover || userRating || average) >= star ? '#FFD700' : '#ccc',
                            fontSize: 24
                        }}
                        onMouseEnter={() => userToken && setHover(star)}
                        onMouseLeave={() => userToken && setHover(0)}
                        onClick={() => userToken && rate(star)}
                        title={userToken ? `Avaliar com ${star} estrela(s)` : 'Faça login para avaliar'}
                    >
                        ★
                    </span>
                ))}
                <span style={{ marginLeft: 8 }}>
                    {average ? `${average} / 5` : 'Sem avaliações'} ({total})
                </span>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {loading && <div>Avaliando...</div>}
        </div>
    );
}

StarRating.propTypes = {
    bookId: PropTypes.string.isRequired,
    userToken: PropTypes.string,
    apiBase: PropTypes.string
};
