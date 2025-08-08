// src/components/Loading/SkeletonLoader.js
import './Loading.css';

/**
 * Componente de Skeleton Loading
 * Mostra placeholders animados enquanto o conteúdo carrega
 */

// Skeleton básico
export const Skeleton = ({ width, height, className = '' }) => (
  <div className={`skeleton ${className}`} style={{ width, height }} />
);

// Skeleton para texto
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={className}>
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className={`skeleton skeleton-text ${
          index === 0 ? 'title' : index === lines - 1 ? 'short' : 'line'
        }`}
      />
    ))}
  </div>
);

// Skeleton para card de conteúdo
export const SkeletonContentCard = () => (
  <div className='skeleton-content-card'>
    <div className='skeleton-header'>
      <div className='skeleton skeleton-text title' style={{ width: '60%' }} />
      <div
        className='skeleton skeleton-button'
        style={{ width: '80px', height: '30px' }}
      />
    </div>

    <div className='skeleton skeleton-text subtitle' style={{ width: '40%' }} />

    <div className='skeleton-content'>
      <div className='skeleton skeleton-text line' />
      <div className='skeleton skeleton-text line' />
      <div className='skeleton skeleton-text short' />
    </div>

    <div className='skeleton-footer'>
      <div
        className='skeleton skeleton-text'
        style={{ width: '100px', height: '20px' }}
      />
      <div
        className='skeleton skeleton-button'
        style={{ width: '100px', height: '35px' }}
      />
    </div>
  </div>
);

// Skeleton para lista de administração
export const SkeletonAdminList = ({ items = 5 }) => (
  <div className='skeleton-admin-list'>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className='skeleton-admin-item'>
        <div className='skeleton-info'>
          <div
            className='skeleton skeleton-text title'
            style={{ width: '70%' }}
          />
          <div
            className='skeleton skeleton-text'
            style={{ width: '50%', height: '16px' }}
          />
          <div
            className='skeleton skeleton-text'
            style={{ width: '30%', height: '14px' }}
          />
        </div>
        <div className='skeleton-actions'>
          <div
            className='skeleton skeleton-button'
            style={{ width: '70px', height: '32px' }}
          />
          <div
            className='skeleton skeleton-button'
            style={{ width: '70px', height: '32px' }}
          />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para formulário
export const SkeletonForm = () => (
  <div className='skeleton-form'>
    <div
      className='skeleton skeleton-text title'
      style={{ width: '40%', marginBottom: '2rem' }}
    />

    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} style={{ marginBottom: '1.5rem' }}>
        <div
          className='skeleton skeleton-text'
          style={{ width: '20%', height: '16px', marginBottom: '0.5rem' }}
        />
        <div
          className='skeleton'
          style={{ width: '100%', height: '40px', borderRadius: '4px' }}
        />
      </div>
    ))}

    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
      <div
        className='skeleton skeleton-button'
        style={{ width: '120px', height: '40px' }}
      />
      <div
        className='skeleton skeleton-button'
        style={{ width: '100px', height: '40px' }}
      />
    </div>
  </div>
);

// Skeleton para página de detalhes
export const SkeletonDetail = () => (
  <div className='skeleton-detail'>
    {/* Botão voltar */}
    <div
      className='skeleton skeleton-button'
      style={{ width: '80px', height: '35px', marginBottom: '2rem' }}
    />

    {/* Título */}
    <div
      className='skeleton skeleton-text title'
      style={{ width: '80%', marginBottom: '1rem' }}
    />

    {/* Subtitle */}
    <div
      className='skeleton skeleton-text subtitle'
      style={{ width: '60%', marginBottom: '2rem' }}
    />

    {/* Metadados */}
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
      <div
        className='skeleton skeleton-text'
        style={{ width: '120px', height: '20px' }}
      />
      <div
        className='skeleton skeleton-text'
        style={{ width: '150px', height: '20px' }}
      />
      <div
        className='skeleton skeleton-text'
        style={{ width: '100px', height: '20px' }}
      />
    </div>

    {/* Conteúdo */}
    <div>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className='skeleton skeleton-text line'
          style={{
            marginBottom: '1rem',
            width: index === 7 ? '60%' : '100%',
          }}
        />
      ))}
    </div>

    {/* Botões de ação */}
    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
      <div
        className='skeleton skeleton-button'
        style={{ width: '140px', height: '40px' }}
      />
      <div
        className='skeleton skeleton-button'
        style={{ width: '120px', height: '40px' }}
      />
    </div>
  </div>
);

// Skeleton para grid de cards
export const SkeletonGrid = ({ columns = 3, items = 6 }) => (
  <div
    className='skeleton-grid'
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '1.5rem',
      marginTop: '2rem',
    }}
  >
    {Array.from({ length: items }, (_, index) => (
      <SkeletonContentCard key={index} />
    ))}
  </div>
);

// Componente principal que escolhe o tipo de skeleton
const SkeletonLoader = ({
  type = 'content',
  items = 5,
  columns = 3,
  className = '',
}) => {
  const skeletonComponents = {
    content: <SkeletonContentCard />,
    'admin-list': <SkeletonAdminList items={items} />,
    form: <SkeletonForm />,
    detail: <SkeletonDetail />,
    grid: <SkeletonGrid columns={columns} items={items} />,
    text: <SkeletonText lines={items} />,
  };

  return (
    <div className={`skeleton-container ${className}`}>
      {skeletonComponents[type] || skeletonComponents.content}
    </div>
  );
};

export default SkeletonLoader;
