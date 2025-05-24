import React from 'react';
import { Link } from 'react-router-dom'; // Para links e botões
import ContentCard from '../components/ContentCard/ContentCard'; // Importa o card reutilizável
import './Home.css'; // Importaremos o CSS para estilização

const featuredItems = [
  {
    id: 'sermon-001',
    title: 'A Graça Suficiente em Meio à Fraqueza',
    type: 'Sermão',
    date: '2024-03-17',
    reference: '2 Coríntios 12:9-10',
    description: 'Uma reflexão sobre como o poder de Deus se aperfeiçoa em nossa fraqueza...', // Descrição mais curta para home
    detailsUrl: '/sermoes/graca-suficiente',
    pdfUrl: '/path/to/sermon-001.pdf'
  },
  {
    id: "redes-sociais-familia-alianca",
    title: "Redes Sociais: Perigos e Oportunidades para a Família.",
    type: "Estudo Bíblico",
    reference: "Ef 4:29, 1 Coríntios 10:31, Romanos 12:2",
    bookLink: "Família da Aliança",
    theme: "Vida Cristã",
    format: "Congresso",
    description: "Uma reflexão sobre o uso das redes sociais à luz da fé cristã.",
    detailsUrl: "/estudos/redes-sociais-familia-alianca",
    pdfUrl: "/estudos/redes-sociais-familia-alianca.pdf"},
  {
    id: "as-institutas-i",
    title: "Institutas da Religião Cristã - Volume 1",
    type: "Resumo de Livro",
    author: "João Calvino",
    description: "Um resumo estruturado da obra monumental...", // Descrição mais curta
    detailsUrl: "livros/institutas-calvino-resumo",
    pdfUrl: "/path/to/book-summary-001.pdf"
  },
];
// --- Fim dos Dados de Exemplo ---


const Home = () => {
  // Caminho da imagem (o mesmo de About.js ou outra foto)
  const profileImageUrl = '/images/pastor-foto.jpeg'; // Verifique se está em public/images/

  return (
    <div className="home-container">

      {/* --- Seção Hero (Apresentação) --- */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Bem-vindo!</h1>
            <p className="hero-subtitle">
              Sou <b>Giovanni Moreira Guimarães</b>, pastor presbiteriano e entusiasta do ensino bíblico.
              Minha Jornada de Fé é um testemunho da graça de Deus, de um encontro transformador com Cristo 
              que me conduziu à Igreja. 
              Marcada por um profundo aprendizado e desafios, essa caminhada culminou no chamado ao 
              ministério pastoral. Hoje, com 25 anos de experiência pastoral e sólida formação teológica, 
              minha paixão é o ensino expositivo da Palavra, fundamentado na fé reformada e com um coração 
              missionário, buscando edificar a Igreja e proclamar o Evangelho.
            </p>
            <p>
              Este espaço é dedicado ao compartilhamento de sermões, estudos,
              análises de livros e outros recursos para edificar sua fé e
              aprofundar seu conhecimento da Palavra de Deus. Aproveite ao máximo!
            </p>
            <Link to="/sobre" className="hero-button">Saiba Mais Sobre Mim</Link>
          </div>
          <div className="hero-image-container">
             <img
                src={profileImageUrl}
                alt="Foto do Pastor [Seu Nome]"
                className="hero-photo"
             />
          </div>
        </div>
      </section>

      {/* --- Seção de Destaques --- */}
      <section className="featured-section">
        <h2>Conteúdo em Destaque</h2>
        <div className="featured-list">
          {featuredItems.map((item) => (
             // Renderiza os cards de destaque
             <ContentCard
                key={item.id}
                title={item.title}
                type={item.type}
                date={item.date}
                // Adaptar a referência se for livro (mostrar autor talvez?)
                reference={item.type === 'Resumo de Livro' ? `Por ${item.author}` : item.reference}
                description={item.description}
                detailsUrl={item.detailsUrl}
                pdfUrl={item.pdfUrl}
              />
          ))}
        </div>
      </section>

      {/* --- Seção de Chamada para Ação (CTA) --- */}
      <section className="cta-section">
        <h2>Explore Mais</h2>
        <p>Navegue pelas diferentes seções para encontrar o conteúdo que mais lhe interessa.</p>
        <div className="cta-buttons">
            <Link to="/sermoes" className="cta-button">Ver Sermões</Link>
            <Link to="/estudos" className="cta-button">Ver Estudos</Link>
            <Link to="/livros" className="cta-button">Ver Livros</Link>
        </div>
      </section>

        {/* --- Opcional: Widget de Agenda (Simples) --- */}
      {/*
      <section className="agenda-widget-section">
            <h2>Próximos Eventos</h2>
            <p>Acompanhe os próximos compromissos públicos.</p>
            {/* Aqui você pode listar 1 ou 2 eventos manualmente ou,
                no futuro, buscar da API do Google Calendar */}
            {/*
            <ul>
                <li><strong>25/03/2024:</strong> Pregação na Igreja X - Tema Y</li>
                <li><strong>01/04/2024:</strong> Palestra sobre Z - Local W</li>
            </ul>
            <Link to="/agenda" className="widget-link">Ver Agenda Completa →</Link>
        </section>
       */}

    </div>
  );
};

export default Home;
