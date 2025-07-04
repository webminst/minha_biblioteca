import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para links e botões
import ContentCard from '../components/ContentCard/ContentCard'; // Importa o card reutilizável
import axios from 'axios'; // Para fazer requisições à API
import './Home.css'; // Importaremos o CSS para estilização


const Home = () => {
  // Estados para gerenciar os dados
  const [latestSermon, setLatestSermon] = useState(null);
  const [latestStudy, setLatestStudy] = useState(null);
  const [latestBook, setLatestBook] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Caminho da imagem (o mesmo de About.js ou outra foto)
  const profileImageUrl = '/images/pastor-foto.jpeg'; // Verifique se está em public/images/

  // Função para buscar o último sermão da API
  const fetchLatestSermon = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sermons/latest');
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar último sermão:', err);
      return null;
    }
  };

  // Função para buscar o último estudo da API
  const fetchLatestStudy = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/studies/latest');
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar último estudo:', err);
      return null;
    }
  };

  // Função para buscar o último livro da API
  const fetchLatestBook = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/books/latest');
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar último livro:', err);
      return null;
    }
  };

  // useEffect para carregar dados ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const sermon = await fetchLatestSermon();
        const study = await fetchLatestStudy();
        const book = await fetchLatestBook();

        // Monta os itens em destaque com os últimos conteúdos se existirem
        const items = [];

        if (sermon) {
          items.push({
            id: sermon._id,
            title: sermon.title,
            type: 'Sermão',
            date: sermon.date,
            reference: sermon.bibleReference,
            description: sermon.description,
            detailsUrl: `/sermoes/${sermon._id}`,
            pdfUrl: sermon.pdfUrl,
            sermon: sermon // Passa o objeto completo
          });
          setLatestSermon(sermon);
        }

        if (study) {
          items.push({
            id: study._id,
            title: study.title,
            type: 'Estudo Bíblico',
            date: study.date,
            reference: study.bibleReference,
            description: study.description,
            detailsUrl: `/estudos/${study._id}`,
            pdfUrl: study.pdfUrl,
            speaker: study.speaker, // Adiciona o speaker
            study: study // Passa o objeto completo
          });
          setLatestStudy(study);
        }

        if (book) {
          items.push({
            id: book._id,
            title: book.title,
            type: 'Resumo de Livro',
            date: book.date,
            author: book.author,
            description: book.description,
            detailsUrl: `/livros/${book._id}`,
            pdfUrl: book.pdfUrl,
            book: book // Passa o objeto completo
          });
          setLatestBook(book);
        }

        // Se não houver conteúdo dinâmico, adiciona itens estáticos como fallback
        if (items.length === 0) {
          items.push(
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
              pdfUrl: "/estudos/redes-sociais-familia-alianca.pdf"
            },
            {
              id: "as-institutas-i",
              title: "Institutas da Religião Cristã - Volume 1",
              type: "Resumo de Livro",
              author: "João Calvino",
              description: "Um resumo estruturado da obra monumental...",
              detailsUrl: "livros/institutas-calvino-resumo",
              pdfUrl: "/path/to/book-summary-001.pdf"
            }
          );
        }

        setFeaturedItems(items);
      } catch (err) {
        setError('Erro ao carregar conteúdo em destaque');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        {loading && <p>Carregando conteúdo em destaque...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
              // Passa os objetos completos para o card
              sermon={item.sermon}
              study={item.study}
              book={item.book}
              author={item.author}
              speaker={item.speaker}
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
