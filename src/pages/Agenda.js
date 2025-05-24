import React from 'react';
import './Agenda.css';

const Agenda = () => {
  <iframe src="https://calendar.google.com/calendar/embed?src=webgigio%40gmail.com&ctz=America%2FFortaleza" title="Agenda Pastoral" style={{border: 0}} width="800" height="600" frameborder="0" scrolling="no"></iframe>
  const googleCalendarEmbedCode = `
    <!-- COLE SEU CÓDIGO IFRAME DO GOOGLE CALENDAR AQUI -->
    <p style="color:red; font-weight:bold;"><iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FFortaleza&showPrint=0&title=Agenda%20Pastoral&src=d2ViZ2lnaW9AZ21haWwuY29t&color=%234285F4" style="border:solid 1px #777" width="800" height="600" frameborder="0" scrolling="no"></iframe>
    <!-- Exemplo de como deve ficar depois de colar:
    <iframe src="URL_DO_SEU_CALENDARIO" style="border:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>
    -->
  `;

  return (
    <div>
      <h1>Agenda Pastoral</h1>
      <p>Confira os próximos eventos públicos, pregações e compromissos:</p>

      {/* Renderiza o HTML do iframe diretamente */}
      {/* Certifique-se que o calendário está público ou configurado para permitir incorporação */}
      <div
        className="google-calendar-container"
        style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}
        dangerouslySetInnerHTML={{ __html: googleCalendarEmbedCode }}
      />
    </div>
  );
};
export default Agenda;