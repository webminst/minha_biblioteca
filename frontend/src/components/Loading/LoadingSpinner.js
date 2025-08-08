// src/components/Loading/LoadingSpinner.js
import './Loading.css';

/**
 * Componente de Loading Spinner
 * Spinner animado para indicar carregamento
 */
const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text = 'Carregando...',
}) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className={`loading-spinner ${color}`}></div>
      {text && <p className='loading-text'>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
