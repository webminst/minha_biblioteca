import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

jest.mock('./ThemeToggle', () => () => (
  <div data-testid='theme-toggle'>ThemeToggle</div>
));
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid='fa-icon'>icon</span>,
}));

describe('Header', () => {
  it('renderiza logo, navegação e busca', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByAltText(/logo minha biblioteca/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText(/buscar/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('abre e fecha menu mobile', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const toggle = screen.getByLabelText(/abrir menu/i);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('envia busca e limpa campo', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const input = screen.getAllByPlaceholderText(/buscar/i)[0];
    fireEvent.change(input, { target: { value: 'sermão' } });
    expect(input.value).toBe('sermão');
    fireEvent.submit(input.form);
    expect(input.value).toBe('');
  });
});
