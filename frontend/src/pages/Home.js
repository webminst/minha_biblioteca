import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard/ContentCard';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './Home.css';
import NewsletterSection from '../components/NewsletterSection/NewsletterSection';
import SupportSection from '../components/SupportSection/SupportSection';
import {
  extractSermons,
  extractStudies,
  extractBooks,
} from '../utils/apiResponseHelpers';

/**
 * Componente Home - Página inicial do portfólio pastoral
 * Exibe seção hero com apresentação, conteúdo em destaque e chamadas para ação
 * Busca automaticamente os últimos sermões, estudos e livros da API
 */
const Home = () => {
  // Estados para gerenciar os dados dos últimos conteúdos
  const [latestSermon, setLatestSermon] = useState(null);
  const [latestStudy, setLatestStudy] = useState(null);
  const [latestBook, setLatestBook] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Caminho da imagem do perfil
  const profileImageUrl = '/images/pastor-foto.jpeg';

  // Função para buscar o último sermão da API
  const fetchLatestSermon = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SERMONS.LATEST);
      // Para endpoints /latest, o dado vem diretamente em response.data.data
      return response.data.success ? response.data.data : response.data;
    } catch (err) {
      console.error('Erro ao buscar último sermão:', err);
      return null;
    }
  };

  // Função para buscar o último estudo da API
  const fetchLatestStudy = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDIES.LATEST);
      // Para endpoints /latest, o dado vem diretamente em response.data.data
      return response.data.success ? response.data.data : response.data;
    } catch (err) {
      console.error('Erro ao buscar último estudo:', err);
      return null;
    }
  };

  // Função para buscar o último livro da API
  const fetchLatestBook = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BOOKS.LATEST);
      // Para endpoints /latest, o dado vem diretamente em response.data.data
      return response.data.success ? response.data.data : response.data;
    } catch (err) {
      console.error('Erro ao buscar último livro:', err);
      return null;
    }
  };

  // Carrega dados ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Busca os últimos conteúdos de cada tipo
        const sermon = await fetchLatestSermon();
        const study = await fetchLatestStudy();
        const book = await fetchLatestBook();

        // Monta os itens em destaque com os últimos conteúdos
        const items = [];

        // Adiciona último sermão se existir
        if (sermon) {
          items.push({
            id: sermon._id,
            title: sermon.title,
            type: 'Sermão',
            date: sermon.date,
            reference: sermon.bibleReference, // Manter como está para sermões
            description: sermon.description,
            detailsUrl: `/sermoes/${sermon._id}`,
            pdfUrl: sermon.pdfUrl,
            sermon,
          });
          setLatestSermon(sermon);
        }

        // Adiciona último estudo se existir
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
            speaker: study.speaker,
            study,
          });
          setLatestStudy(study);
        }

        // Adiciona último livro se existir
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
            book,
          });
          setLatestBook(book);
        }

        // Fallback: adiciona itens estáticos se não houver conteúdo dinâmico
        if (items.length === 0) {
          items.push(
            {
              id: 'redes-sociais-familia-alianca',
              title: 'Redes Sociais: Perigos e Oportunidades para a Família.',
              type: 'Estudo Bíblico',
              reference: 'Ef 4:29, 1 Coríntios 10:31, Romanos 12:2',
              description:
                'Uma reflexão sobre o uso das redes sociais à luz da fé cristã.',
              detailsUrl: '/estudos/redes-sociais-familia-alianca',
              pdfUrl: '/estudos/redes-sociais-familia-alianca.pdf',
            },
            {
              id: 'as-institutas-i',
              title: 'Institutas da Religião Cristã - Volume 1',
              type: 'Resumo de Livro',
              author: 'João Calvino',
              description:
                'Um resumo estruturado da obra monumental de Calvino.',
              detailsUrl: 'livros/institutas-calvino-resumo',
              pdfUrl: '/path/to/book-summary-001.pdf',
            },
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
    <div className='home-container'>
      {/* Seção Hero - Apresentação principal */}
      <section className='hero-section'>
        <div className='hero-content'>
          <div className='hero-text'>
            <h1>Bem-vindo!</h1>
            <p className='hero-subtitle'>
              Sou <b>Giovanni Moreira Guimarães</b>, pastor presbiteriano e
              entusiasta do ensino bíblico. Minha Jornada de Fé é um testemunho
              da graça de Deus, de um encontro transformador com Cristo que me
              conduziu à Igreja. Marcada por um profundo aprendizado e desafios,
              essa caminhada culminou no chamado ao ministério pastoral. Hoje,
              com 25 anos de experiência pastoral e sólida formação teológica,
              minha paixão é o ensino expositivo da Palavra, fundamentado na fé
              reformada e com um coração missionário, buscando edificar a Igreja
              e proclamar o Evangelho.
            </p>
            <p>
              Este espaço é dedicado ao compartilhamento de sermões, estudos,
              análises de livros e outros recursos para edificar sua fé e
              aprofundar seu conhecimento da Palavra de Deus. Aproveite ao
              máximo!
            </p>
            <Link to='/sobre' className='hero-button'>
              Saiba Mais Sobre Mim
            </Link>
          </div>

          {/* Foto do pastor */}
          <div className='hero-image-container'>
            <img
              src={profileImageUrl}
              alt='Foto do Pastor Giovanni Moreira Guimarães'
              className='hero-photo'
            />
          </div>
        </div>
      </section>

      {/* Seção de Conteúdo em Destaque */}
      <section className='featured-section'>
        <h2>Conteúdo em Destaque</h2>

        {/* Estados de carregamento e erro */}
        {loading && <p>Carregando conteúdo em destaque...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Lista de itens em destaque */}
        <div className='featured-list'>
          {featuredItems.map(item => (
            <ContentCard
              key={item.id}
              title={item.title}
              type={item.type}
              date={item.date}
              reference={
                item.type === 'Resumo de Livro'
                  ? `Por ${item.author}`
                  : item.reference
              }
              description={item.description}
              detailsUrl={item.detailsUrl}
              pdfUrl={item.pdfUrl}
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
      <section className='cta-section'>
        <h2>Explore Mais</h2>
        <p>
          Navegue pelas diferentes seções para encontrar o conteúdo que mais lhe
          interessa.
        </p>
        <div className='cta-buttons'>
          <Link to='/sermoes' className='cta-button'>
            Ver Sermões
          </Link>
          <Link to='/estudos' className='cta-button'>
            Ver Estudos
          </Link>
          <Link to='/livros' className='cta-button'>
            Ver Livros
          </Link>
        </div>
      </section>

      <NewsletterSection />
      <SupportSection />

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
