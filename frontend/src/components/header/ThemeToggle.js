import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        // Detecta preferência do usuário ou sistema
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button onClick={toggleTheme} aria-label="Alternar tema" className="theme-toggle-btn">
            {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
        </button>
    );
};

export default ThemeToggle;
