// src/pages/SupportPage.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCopy } from '@fortawesome/free-solid-svg-icons'; // Ícone de coração e copiar
import './SupportPage.css'; // Criaremos este CSS

const SupportPage = () => {
  const pixKey = "webminst@hotmail.com"; // Sua chave PIX (E-mail)
  const bankName = "Caixa Econômica Federal"; // Adicione o nome do seu banco
  const accountHolderName = "Giovanni Moreira Guimarães"; // Adicione seu nome completo

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey)
      .then(() => {
        alert(`Chave PIX "${pixKey}" copiada para a área de transferência!`);
      })
      .catch(err => {
        console.error('Erro ao copiar a chave PIX: ', err);
        alert('Erro ao copiar a chave PIX. Por favor, copie manualmente.');
      });
  };

  return (
    <div className="support-container">
      <h1>
        <FontAwesomeIcon icon={faHeart} style={{ marginRight: '10px', color: 'var(--color-green-ipb)' }} />
        Apoie este Ministério
      </h1>

      <div className="support-intro">
        <p>
          Se o conteúdo compartilhado neste espaço tem sido uma bênção para sua vida e
          você deseja contribuir para a manutenção e expansão deste ministério de ensino,
          sua generosidade é muito bem-vinda.
        </p>
        <p>
          As contribuições ajudam a cobrir os custos de hospedagem do site, aquisição de
          novos livros para estudo e resumo, ferramentas para produção de conteúdo e,
          eventualmente, a dedicação de mais tempo para criar e compartilhar
          recursos que edifiquem o corpo de Cristo.
        </p>
        <p>
          Sua semente plantada aqui frutificará no avanço do Evangelho!
        </p>
      </div>

      <div className="pix-donation-section">
        <h2>Contribua via PIX</h2>
        <p>
          Você pode fazer sua contribuição de forma rápida e segura utilizando a chave PIX abaixo:
        </p>
        <div className="pix-key-container">
          <p className="pix-label">Chave PIX (E-mail):</p>
          <div className="pix-key-value-wrapper">
            <strong className="pix-key-value">{pixKey}</strong>
            <button onClick={copyToClipboard} className="copy-pix-button" title="Copiar Chave PIX">
              <FontAwesomeIcon icon={faCopy} /> Copiar
            </button>
          </div>
        </div>
        <div className="pix-details">
            <p><strong>Titular:</strong> {accountHolderName}</p>
            <p><strong>Instituição:</strong> {bankName}</p>
        </div>
        <p className="pix-instructions">
          Ao realizar a transferência, por favor, verifique se o nome do titular confere
          antes de confirmar. Deus o abençoe por sua generosidade!
        </p>
        <img src="/images/Chave PIX - E-mail.jpg" alt="QR Code PIX" className="pix-qrcode"/>
      </div>

      <div className="alternative-support">
        <h2>Outras Formas de Apoio</h2>
        <p>
          Além de contribuições financeiras, você também pode apoiar este ministério:
        </p>
        <ul>
          <li>Orando por este trabalho e por aqueles que são alcançados por ele.</li>
          <li>Compartilhando os sermões, estudos e recursos com amigos e familiares.</li>
          <li>Enviando seu feedback, sugestões de temas ou testemunhos.</li>
        </ul>
      </div>

      <div className="thank-you-note">
        <p>
          <strong>Muito obrigado pelo seu apoio e encorajamento!</strong>
        </p>
        <p><em>"Cada um contribua segundo propôs no seu coração; não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria." (2 Coríntios 9:7)</em></p>
      </div>
    </div>
  );
};

export default SupportPage;