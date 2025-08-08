import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Estilos em objeto JavaScript
const styles = {
  starRatingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
  },
  ratingLabel: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  starsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  star: {
    fontSize: '24px',
    cursor: 'pointer',
    color: '#ccc',
    transition: 'color 0.2s, transform 0.2s',
  },
  starActive: {
    color: '#FFD700',
  },
  starHover: {
    color: '#FFD700',
    transform: 'scale(1.2)',
  },
  starDisabled: {
    cursor: 'default',
  },
  ratingText: {
    marginLeft: '8px',
    fontSize: '0.9em',
    color: '#666',
  },
  errorMessage: {
    color: '#ff4444',
    marginTop: '5px',
    fontSize: '0.9em',
  },
  loadingMessage: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: '5px',
    fontSize: '0.9em',
  },
};

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
      deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
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
  const rate = async stars => {
    if (hasRated) return; // Impede múltiplas avaliações

    setLoading(true);
    setError('');

    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${apiBase}/${bookId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId, // Envia o ID do dispositivo
        },
        body: JSON.stringify({
          stars,
          deviceId, // Também no corpo para compatibilidade
        }),
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
    <div style={styles.starRatingContainer} data-testid='star-rating'>
      <div style={styles.ratingLabel}>Avaliar:</div>
      <div style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => {
          const isActive = (hover || userRating || average) >= star;
          const isClickable = !hasRated;

          return (
            <span
              key={star}
              data-testid={`star-${star}`}
              style={{
                ...styles.star,
                ...(isActive ? styles.starActive : {}),
                ...(isClickable && hover === star ? styles.starHover : {}),
                ...(hasRated ? styles.starDisabled : {}),
              }}
              onMouseEnter={() => isClickable && setHover(star)}
              onMouseLeave={() => isClickable && setHover(0)}
              onClick={() => isClickable && rate(star)}
              title={
                isClickable
                  ? `Avaliar com ${star} estrela(s)`
                  : 'Obrigado por avaliar!'
              }
              role='button'
              tabIndex={isClickable ? 0 : -1}
              aria-label={
                isClickable
                  ? `Avaliar com ${star} estrelas`
                  : `Avaliado com ${userRating} estrelas`
              }
            >
              ★
            </span>
          );
        })}
        <span style={styles.ratingText} data-testid='rating-text'>
          {average !== null
            ? `${Number(average).toFixed(1)}/5`
            : 'Seja o primeiro a avaliar'}{' '}
          ({total})
        </span>
      </div>
      {error && (
        <div style={styles.errorMessage} data-testid='error-message'>
          {error}
        </div>
      )}
      {loading && <div style={styles.loadingMessage}>Avaliando...</div>}
    </div>
  );
}

StarRating.propTypes = {
  bookId: PropTypes.string.isRequired,
  apiBase: PropTypes.string,
};
