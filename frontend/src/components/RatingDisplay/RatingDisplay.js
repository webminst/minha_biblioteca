import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './RatingDisplay.css';

/**
 * Componente para exibir a média de avaliações sem permitir interação
 */
const RatingDisplay = ({ average, total, size = 'medium' }) => {
  // Se não houver avaliações, não exibe nada
  if (average === null || average === undefined || total === 0) {
    return null;
  }

  // Define o tamanho baseado na prop
  const sizeStyles = {
    small: {
      starSize: '16px',
      fontSize: '0.8rem',
      gap: '2px'
    },
    medium: {
      starSize: '20px',
      fontSize: '0.9rem',
      gap: '4px'
    }
  };

  const { starSize, fontSize, gap } = sizeStyles[size] || sizeStyles.medium;
  const fullStars = Math.round(average);

  return (
    <div className="rating-display" style={{ fontSize, gap }}>
      <div className="stars" style={{ '--star-size': starSize, '--gap': gap }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= fullStars ? 'filled' : ''}`}
            style={{
              color: star <= fullStars ? '#FFD700' : '#e0e0e0',
              fontSize: starSize,
              width: starSize,
              height: starSize,
              lineHeight: starSize
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="rating-text" style={{ fontSize: `calc(${fontSize} * 0.9)` }}>
        {average.toFixed(1)} ({total})
      </span>
    </div>
  );
};

RatingDisplay.propTypes = {
  average: PropTypes.number,
  total: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium'])
};

export default RatingDisplay;
