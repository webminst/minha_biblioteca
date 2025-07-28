import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

// Mock do TwoFactorProtectedRoute para isolar o teste
jest.mock('./TwoFactorProtectedRoute', () => ({ children }) => <>{children}</>);

describe('ProtectedRoute', () => {
    it('redireciona para /login se não autenticado', () => {
        render(
            <MemoryRouter initialEntries={["/privado"]}>
                <Routes>
                    <Route path="/privado" element={<ProtectedRoute isAuthenticated={false}><div>Privado</div></ProtectedRoute>} />
                    <Route path="/login" element={<div>Página de Login</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/página de login/i)).toBeInTheDocument();
    });

    it('renderiza children se autenticado', () => {
        render(
            <MemoryRouter initialEntries={["/privado"]}>
                <Routes>
                    <Route path="/privado" element={<ProtectedRoute isAuthenticated={true}><div>Privado</div></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/privado/i)).toBeInTheDocument();
    });

    it('renderiza Outlet se autenticado e sem children', () => {
        render(
            <MemoryRouter initialEntries={["/privado"]}>
                <Routes>
                    <Route element={<ProtectedRoute isAuthenticated={true} />}>
                        <Route path="/privado" element={<div>Outlet Privado</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/outlet privado/i)).toBeInTheDocument();
    });
});
