import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: (props) => <span data-testid="fa-icon" {...props} />
}));

describe('Toast', () => {
    const baseProps = {
        id: '1',
        message: 'Mensagem de teste',
        onClose: jest.fn(),
        duration: 1000
    };

    beforeEach(() => {
        jest.useFakeTimers();
        baseProps.onClose.mockClear();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('renderiza mensagem e botão de fechar', () => {
        render(<Toast {...baseProps} />);
        expect(screen.getByText('Mensagem de teste')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument();
    });

    it('renderiza título se fornecido', () => {
        render(<Toast {...baseProps} title="Título" />);
        expect(screen.getByText('Título')).toBeInTheDocument();
    });

    it('chama onClose ao clicar no botão de fechar', () => {
        render(<Toast {...baseProps} />);
        fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(baseProps.onClose).toHaveBeenCalled();
    });

    it('exibe barra de progresso se duration > 0', () => {
        render(<Toast {...baseProps} duration={2000} />);
        expect(screen.getByRole('alert').querySelector('.toast-progress')).toBeInTheDocument();
    });

    it('renderiza ação customizada se fornecida', () => {
        render(<Toast {...baseProps} action={<button>Desfazer</button>} />);
        expect(screen.getByText('Desfazer')).toBeInTheDocument();
    });

    it('aplica classes de tipo corretamente', () => {
        render(<Toast {...baseProps} type="success" />);
        expect(screen.getByRole('alert')).toHaveClass('toast-success');
    });
});
