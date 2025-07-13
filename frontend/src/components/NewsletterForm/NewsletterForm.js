import React, { useState } from 'react';
import jsonp from 'jsonp';
import './NewsletterForm.css';

// Todas as importações acima são utilizadas no componente NewsletterForm.

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'sending', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || email.indexOf('@') === -1) {
      setStatus('error');
      setMessage('Por favor, insira um e-mail válido.');
      return;
    }

    setStatus('sending');
    setMessage('');

    // !!!!! IMPORTANTE: Substitua pela URL de AÇÃO do seu formulário Mailchimp !!!!!
    // Remova o "/post-json" e adicione "&c=?" no final para JSONP
    const mailchimpUrl = 'https://ipb.us17.list-manage.com/subscribe/post?u=1ba241b229abed33a57cc2fe2&amp;id=54e21d70a6&amp;f_id=00a846e0f0'.replace('/post?', '/post-json?');

    jsonp(`${mailchimpUrl}&EMAIL=${encodeURIComponent(email)}`, { param: 'c' }, (err, data) => {
      if (err) {
        setStatus('error');
        setMessage('Ocorreu um erro. Tente novamente mais tarde.');
        console.error("Mailchimp error:", err);
      } else if (data.result !== 'success') {
        setStatus('error');
        setMessage(data.msg.includes("already subscribed") ? "Este e-mail já está inscrito!" : "Ocorreu um erro. Verifique seu e-mail.");
        console.error("Mailchimp result error:", data.msg);
      } else {
        setStatus('success');
        setMessage('Inscrição realizada com sucesso! Verifique seu e-mail para confirmar.');
        setEmail('');
      }
    });
  };

  return (
    <div className="newsletter-form-container">
      <h3>Fique por Dentro!</h3>
      <p>Receba atualizações sobre novos sermões, resumos de livros, estudos e outros recursos diretamente no seu e-mail.</p>
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          required
          className="newsletter-input"
          disabled={status === 'sending'}
        />
        <button type="submit" className="newsletter-button" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando...' : 'Assinar'}
        </button>
      </form>
      {message && (
        <p className={`newsletter-message ${status === 'error' ? 'error' : status === 'success' ? 'success' : ''}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;