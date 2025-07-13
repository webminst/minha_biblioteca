// src/pages/SupportPage.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCopy } from '@fortawesome/free-solid-svg-icons';
import './SupportPage.css';

/**
 * Componente SupportPage - Página de apoio ao ministério
 * Permite contribuições via PIX e apresenta outras formas de apoio
 * Inclui funcionalidade para copiar chave PIX para área de transferência
 */
const SupportPage = () => {
  // Dados para contribuição via PIX - obtidos de variáveis de ambiente
  const pixKey = process.env.REACT_APP_PIX_KEY;
  const bankName = process.env.REACT_APP_BANK_NAME || "Caixa Econômica Federal";
  const accountHolderName = process.env.REACT_APP_ACCOUNT_HOLDER || "Pastor";

  // Verificação se as informações sensíveis estão configuradas
  const isPixConfigured = pixKey && pixKey !== "sua_chave_pix_aqui";

  // Função para copiar chave PIX para área de transferência
  const copyToClipboard = () => {
    if (!isPixConfigured) {
      alert('Informações de PIX não configuradas. Entre em contato pelo formulário.');
      return;
    }

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
      {/* Título principal com ícone */}
      <h1>
        <FontAwesomeIcon icon={faHeart} style={{ marginRight: '10px', color: 'var(--color-green-ipb)' }} />
        Apoie este Ministério
      </h1>

      {/* Seção de introdução e propósito */}
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

      {/* Seção de contribuição via PIX */}
      <div className="pix-donation-section">
        <h2>Contribua via PIX</h2>
        <p>
          Você pode fazer sua contribuição de forma rápida e segura utilizando a chave PIX abaixo:
        </p>

        {/* Container da chave PIX com botão de copiar */}
        <div className="pix-key-container">
          <p className="pix-label">Chave PIX (E-mail):</p>
          <div className="pix-key-value-wrapper">
            <strong className="pix-key-value">
              {isPixConfigured ? pixKey : "Entre em contato para informações de PIX"}
            </strong>
            <button
              onClick={copyToClipboard}
              className={`copy-pix-button ${!isPixConfigured ? 'disabled' : ''}`}
              title={isPixConfigured ? "Copiar Chave PIX" : "PIX não configurado"}
              disabled={!isPixConfigured}
            >
              <FontAwesomeIcon icon={faCopy} /> {isPixConfigured ? 'Copiar' : 'N/A'}
            </button>
          </div>
        </div>

        {/* Detalhes da conta PIX */}
        <div className="pix-details">
          <p><strong>Titular:</strong> {accountHolderName}</p>
          <p><strong>Instituição:</strong> {bankName}</p>
        </div>

        {/* Instruções de segurança */}
        <p className="pix-instructions">
          Ao realizar a transferência, por favor, verifique se o nome do titular confere
          antes de confirmar. Deus o abençoe por sua generosidade!
        </p>

        {/* QR Code para PIX */}
        <img
          src="/images/Chave PIX - E-mail.jpg"
          alt="QR Code PIX para contribuição"
          className="pix-qrcode"
        />
      </div>

      {/* Seção de formas alternativas de apoio */}
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

      {/* Mensagem de agradecimento com versículo bíblico */}
      <div className="thank-you-note">
        <p>
          <strong>Muito obrigado pelo seu apoio e encorajamento!</strong>
        </p>
        <p>
          <em>
            "Cada um contribua segundo propôs no seu coração; não com tristeza ou por necessidade;
            porque Deus ama ao que dá com alegria." (2 Coríntios 9:7)
          </em>
        </p>
      </div>
    </div>
  );
};

export default SupportPage;