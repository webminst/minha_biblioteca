import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

// Mock window.scrollTo
beforeAll(() => {
    window.scrollTo = jest.fn();
});

afterEach(() => {
    window.scrollTo.mockClear();
});

describe('ScrollToTop', () => {
    it('chama window.scrollTo ao mudar pathname', () => {
        const TestComponent = ({ path }) => (
            <MemoryRouter initialEntries={[path]}>
                <ScrollToTop />
            </MemoryRouter>
        );
        render(<TestComponent path="/foo" />);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('chama window.scrollTo ao mudar search', () => {
        const TestComponent = ({ path }) => (
            <MemoryRouter initialEntries={[path]}>
                <ScrollToTop />
            </MemoryRouter>
        );
        render(<TestComponent path="/foo?bar=1" />);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
