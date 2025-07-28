import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
    it('renderiza o texto de direitos autorais', () => {
        render(<Footer />);
        expect(screen.getByText(/2024 Pastor Portfolio/i)).toBeInTheDocument();
        expect(screen.getByText(/todos os direitos reservados/i)).toBeInTheDocument();
    });

    it('usa a classe CSS correta', () => {
        const { container } = render(<Footer />);
        const footer = container.querySelector('footer');
        expect(footer).toHaveClass('app-footer');
    });
});
