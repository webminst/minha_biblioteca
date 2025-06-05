import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './Contact.css';

// Todas as importações acima são utilizadas no componente Contact.
// --- Estados para o Formulário de Contato ---
// login?: webgigio@gmail.com - Senha: Giggio57#
const Contact = () => {
  // --- Estados para o Formulário de Contato ---
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState({
    submitting: false,
    succeeded: false,
    error: null,
  });

  // --- Estados para o Formulário de Pedido de Oração ---
  const [prayerFormData, setPrayerFormData] = useState({
    name: '',
    request: '',
  });
  const [prayerStatus, setPrayerStatus] = useState({
    submitting: false,
    succeeded: false,
    error: null,
  });

  // --- Handlers para o Formulário de Contato ---
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ submitting: true, succeeded: false, error: null });

    // !!!!! IMPORTANTE: Substitua pelo SEU endpoint do Formspree para CONTATO !!!!!
    const contactFormEndpoint = 'https://formspree.io/f/mnnddjyk';

    try {
      const response = await fetch(contactFormEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(contactFormData),
      });

      if (response.ok) {
        setContactStatus({ submitting: false, succeeded: true, error: null });
        setContactFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        const errorMessage = data.errors?.map((err) => err.message).join(', ') || 'Ocorreu um erro ao enviar.';
        setContactStatus({ submitting: false, succeeded: false, error: errorMessage });
      }
    } catch (error) {
      console.error('Erro no envio do formulário de contato:', error);
      setContactStatus({ submitting: false, succeeded: false, error: 'Não foi possível conectar ao servidor. Tente novamente.' });
    }
  };

  // --- Handlers para o Formulário de Pedido de Oração ---
  const handlePrayerChange = (e) => {
    const { name, value } = e.target;
    setPrayerFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePrayerSubmit = async (e) => {
    e.preventDefault();
    setPrayerStatus({ submitting: true, succeeded: false, error: null });

    // !!!!! IMPORTANTE: Substitua pelo SEU endpoint do Formspree para ORAÇÃO !!!!!
    const prayerFormEndpoint = 'https://formspree.io/f/xqaqqeva';

    try {
      const response = await fetch(prayerFormEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...prayerFormData,
          name: prayerFormData.name || 'Anônimo'
        }),
      });

      if (response.ok) {
        setPrayerStatus({ submitting: false, succeeded: true, error: null });
        setPrayerFormData({ name: '', request: '' });
      } else {
        const data = await response.json();
        const errorMessage = data.errors?.map((err) => err.message).join(', ') || 'Ocorreu um erro ao enviar.';
        setPrayerStatus({ submitting: false, succeeded: false, error: errorMessage });
      }
    } catch (error) {
      console.error('Erro no envio do formulário de oração:', error);
      setPrayerStatus({ submitting: false, succeeded: false, error: 'Não foi possível conectar ao servidor. Tente novamente.' });
    }
  };

  return (
    <div className="contact-container">
      <h1>Contato</h1>

      <section className="contact-info">
        <h2>Informações</h2>
        <p>
          Para entrar em contato diretamente, envie um e-mail para: <br />
          <a href="mailto:webminst@hotmail.com">webminst@hotmail.com</a>
        </p>
      </section>

      <hr className="section-divider" />

      {/* --- Formulário de Contato --- */}
      <section className="form-section">
        <h2>Envie sua Mensagem</h2>
        <form onSubmit={handleContactSubmit}>
          <div className="form-group">
            <label htmlFor="contact-name" className="form-label">Nome:</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              className="form-input"
              value={contactFormData.name}
              onChange={handleContactChange}
              required
              disabled={contactStatus.submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-email" className="form-label">E-mail:</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              className="form-input"
              value={contactFormData.email}
              onChange={handleContactChange}
              required
              disabled={contactStatus.submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-subject" className="form-label">Assunto:</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              className="form-input"
              value={contactFormData.subject}
              onChange={handleContactChange}
              required
              disabled={contactStatus.submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-message" className="form-label">Mensagem:</label>
            <textarea
              id="contact-message"
              name="message"
              className="form-textarea"
              rows="5"
              value={contactFormData.message}
              onChange={handleContactChange}
              required
              disabled={contactStatus.submitting}
            ></textarea>
          </div>

          {/* --- Mensagens de Status (Contato) --- */}
          {contactStatus.succeeded && (
            <p className="form-status success">Mensagem enviada com sucesso! Obrigado.</p>
          )}
          {contactStatus.error && (
            <p className="form-status error">Erro: {contactStatus.error}</p>
          )}

          <button type="submit" className="form-button" disabled={contactStatus.submitting}>
            {contactStatus.submitting ? 'Enviando...' : (
              <>
                Enviar Mensagem <FontAwesomeIcon icon={faPaperPlane} className="icon-after-text" />
              </>
            )}
          </button>
        </form>
      </section>

      <hr className="section-divider" />

      {/* --- Formulário de Pedido de Oração --- */}
      <section className="form-section">
        <h2>Pedido de Oração</h2>
        <p className="prayer-note">
          Seu pedido será tratado com respeito e confidencialidade pela equipe pastoral.
          Deixar o nome é opcional.
        </p>
        <form onSubmit={handlePrayerSubmit}>
          <div className="form-group">
            <label htmlFor="prayer-name" className="form-label">Nome (Opcional):</label>
            <input
              type="text"
              id="prayer-name"
              name="name"
              className="form-input"
              value={prayerFormData.name}
              onChange={handlePrayerChange}
              disabled={prayerStatus.submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="prayer-request" className="form-label">Seu Pedido:</label>
            <textarea
              id="prayer-request"
              name="request"
              className="form-textarea"
              rows="5"
              value={prayerFormData.request}
              onChange={handlePrayerChange}
              required
              disabled={prayerStatus.submitting}
            ></textarea>
          </div>

          {/* --- Mensagens de Status (Oração) --- */}
          {prayerStatus.succeeded && (
            <p className="form-status success">Pedido de oração enviado com sucesso.</p>
          )}
          {prayerStatus.error && (
            <p className="form-status error">Erro: {prayerStatus.error}</p>
          )}

          <button type="submit" className="form-button" disabled={prayerStatus.submitting}>
            {prayerStatus.submitting ? 'Enviando...' : (
              <>
                Enviar Pedido <FontAwesomeIcon icon={faPaperPlane} className="icon-after-text" />
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;