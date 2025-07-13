import React from 'react';
import './Agenda.css';
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';

/**
 * Componente Agenda - Página de calendário pastoral
 * Exibe o calendário do Google incorporado com eventos públicos, 
 * pregações e compromissos pastorais
 */
const Agenda = () => {
  // URL do calendário Google incorporado com configurações específicas
  const googleCalendarEmbedCode = `
    <iframe 
      src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FFortaleza&showPrint=0&title=Agenda%20Pastoral&src=d2ViZ2lnaW9AZ21haWwuY29t&color=%234285F4" 
      style="border:solid 1px #777" 
      width="800" 
      height="600" 
      frameborder="0" 
      scrolling="no">
    </iframe>
  `;

  return (
    <div className="agenda-page">
      {/* Cabeçalho da página com título e descrição */}
      <header className="agenda-header">
        <h1>Agenda Pastoral</h1>
        <p>Confira os próximos eventos públicos, pregações e compromissos pastorais.</p>
      </header>

      {/* Container do calendário Google incorporado */}
      <section className="calendar-section">
        <div
          className="google-calendar-container"
          dangerouslySetInnerHTML={{ __html: googleCalendarEmbedCode }}
        />
      </section>

      {/* Informações adicionais sobre o calendário */}
      <footer className="agenda-footer">
        <p>
          <strong>Nota:</strong> Este calendário mostra apenas eventos públicos.
          Para participar de algum evento ou obter mais informações, entre em contato.
        </p>
      </footer>

      <NewsletterSection />
      <SupportSection />
    </div>
  );
};

export default Agenda;