import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterForm from './NewsletterForm';

jest.mock('jsonp', () => jest.fn());
import jsonp from 'jsonp';

describe('NewsletterForm', () => {
  beforeEach(() => {
    jsonp.mockReset();
  });

  it('renderiza campos e botão', () => {
    render(<NewsletterForm />);
    expect(
      screen.getByPlaceholderText(/seu melhor e-mail/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /assinar/i }),
    ).toBeInTheDocument();
  });

  it('valida e-mail vazio ou inválido', async () => {
    render(<NewsletterForm />);
    fireEvent.change(screen.getByPlaceholderText(/seu melhor e-mail/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assinar/i }));
    expect(
      await screen.findByText(/insira um e-mail válido/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/seu melhor e-mail/i), {
      target: { value: 'foo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assinar/i }));
    expect(
      await screen.findByText(/insira um e-mail válido/i),
    ).toBeInTheDocument();
  });

  it('exibe mensagem de sucesso ao inscrever', async () => {
    jsonp.mockImplementation((url, opts, cb) => {
      cb(null, { result: 'success' });
    });
    render(<NewsletterForm />);
    fireEvent.change(screen.getByPlaceholderText(/seu melhor e-mail/i), {
      target: { value: 'foo@bar.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assinar/i }));
    expect(
      await screen.findByText(/inscrição realizada com sucesso/i),
    ).toBeInTheDocument();
  });

  it('exibe mensagem de erro se já inscrito', async () => {
    jsonp.mockImplementation((url, opts, cb) => {
      cb(null, { result: 'error', msg: 'already subscribed' });
    });
    render(<NewsletterForm />);
    fireEvent.change(screen.getByPlaceholderText(/seu melhor e-mail/i), {
      target: { value: 'foo@bar.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assinar/i }));
    expect(await screen.findByText(/já está inscrito/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro genérica em falha', async () => {
    jsonp.mockImplementation((url, opts, cb) => {
      cb(new Error('fail'), null);
    });
    render(<NewsletterForm />);
    fireEvent.change(screen.getByPlaceholderText(/seu melhor e-mail/i), {
      target: { value: 'foo@bar.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assinar/i }));
    expect(await screen.findByText(/ocorreu um erro/i)).toBeInTheDocument();
  });
});
