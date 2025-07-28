import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

jest.mock('../header/Header', () => () => <header data-testid="mock-header">Header</header>);
jest.mock('../footer/Footer', () => () => <footer data-testid="mock-footer">Footer</footer>);
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Outlet: () => <div data-testid="mock-outlet">Outlet content</div>
}));

describe('Layout', () => {
    it('renderiza Header, Outlet e Footer', () => {
        render(
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    it('usa as classes CSS corretas', () => {
        const { container } = render(
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        );
        expect(container.querySelector('.layout-container')).toBeInTheDocument();
        expect(container.querySelector('.main-content')).toBeInTheDocument();
    });
});
