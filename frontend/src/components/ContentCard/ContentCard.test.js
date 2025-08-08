import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContentCard from './ContentCard';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: props => <span data-testid='fa-icon' {...props} />,
}));

describe('ContentCard', () => {
  const baseProps = {
    title: 'Título Exemplo',
    type: 'Resumo de Livro',
    date: '2025-07-28',
    reference: 'João 3:16',
    description: 'Descrição do conteúdo',
    detailsUrl: '/livros/1',
    pdfUrl: 'http://exemplo.com/arquivo.pdf',
    coverImageUrl: 'http://exemplo.com/capa.jpg',
    author: 'Autor Exemplo',
    book: { _id: '1' },
  };

  it('renderiza título, descrição e links', () => {
    render(
      <MemoryRouter>
        <ContentCard {...baseProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Título Exemplo')).toBeInTheDocument();
    expect(screen.getByText('Descrição do conteúdo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver detalhes/i })).toHaveAttribute(
      'href',
      '/livros/1',
    );
    expect(screen.getByRole('link', { name: /baixar pdf/i })).toHaveAttribute(
      'href',
      'http://exemplo.com/arquivo.pdf',
    );
  });

  it('renderiza capa do livro se fornecida', () => {
    render(
      <MemoryRouter>
        <ContentCard {...baseProps} />
      </MemoryRouter>,
    );
    expect(screen.getByAltText(/capa de título exemplo/i)).toBeInTheDocument();
  });

  it('renderiza autor para Resumo de Livro', () => {
    render(
      <MemoryRouter>
        <ContentCard {...baseProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/por: autor exemplo/i)).toBeInTheDocument();
  });

  it('renderiza referência para Sermão', () => {
    render(
      <MemoryRouter>
        <ContentCard
          {...baseProps}
          type='Sermão'
          sermon={{ _id: '2' }}
          reference='Mateus 5:9'
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Mateus 5:9')).toBeInTheDocument();
  });

  it('renderiza referência para Estudo Bíblico', () => {
    render(
      <MemoryRouter>
        <ContentCard
          {...baseProps}
          type='Estudo Bíblico'
          study={{ _id: '3' }}
          reference='Salmos 23'
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Salmos 23')).toBeInTheDocument();
  });

  it('aplica classe with-cover para Resumo de Livro com capa', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentCard {...baseProps} />
      </MemoryRouter>,
    );
    expect(container.querySelector('.content-card')).toHaveClass('with-cover');
  });
});
