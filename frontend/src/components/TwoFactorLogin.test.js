import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TwoFactorLogin from './TwoFactorLogin';

describe('TwoFactorLogin', () => {
  it('renderiza campo de código e botão', () => {
    render(<TwoFactorLogin onSubmit={jest.fn()} email='user@email.com' />);
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /verificar/i }),
    ).toBeInTheDocument();
  });

  it('chama onSubmit com código TOTP válido', () => {
    const onSubmit = jest.fn();
    render(<TwoFactorLogin onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      code: '123456',
      isBackupCode: false,
    });
  });

  it('chama onSubmit com código de backup válido', () => {
    const onSubmit = jest.fn();
    render(<TwoFactorLogin onSubmit={onSubmit} isBackupCodeMode={true} />);
    const input = screen.getByPlaceholderText('XXXXXXXX');
    fireEvent.change(input, { target: { value: 'ABCD1234' } });
    fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      code: 'ABCD1234',
      isBackupCode: true,
    });
  });

  it('não chama onSubmit com código TOTP inválido', () => {
    const onSubmit = jest.fn();
    render(<TwoFactorLogin onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('não chama onSubmit com código de backup inválido', () => {
    const onSubmit = jest.fn();
    render(<TwoFactorLogin onSubmit={onSubmit} isBackupCodeMode={true} />);
    const input = screen.getByPlaceholderText('XXXXXXXX');
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
