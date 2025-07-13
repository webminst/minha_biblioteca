import React from 'react';
import BibleSearchSimple from '../components/BibleSearch/BibleSearchSimple';
import './BiblePage.css';

/**
 * Página dedicada para busca e estudo de versículos bíblicos
 * Integra o componente BibleSearch com layout completo
 */
const BiblePage = () => {
    return (
        <div className="bible-page">
            <div className="bible-content">
                {/* Seção de busca principal */}
                <section className="search-section">
                    <BibleSearchSimple />
                </section>
            </div>
        </div>
    );
};

export default BiblePage;
