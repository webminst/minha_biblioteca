// src/data/mockData.js

export const sermonsData = [
    {
      id: 'graca-suficiente',
      title: 'A Graça Suficiente em Meio à Fraqueza',
      type: 'Sermão',
      date: '2024-03-17',
      reference: '2 Coríntios 12:9-10',
      book: '2 Coríntios', // <-- NOVO CAMPO
      series: 'Fundamentos da Graça', // <-- NOVO CAMPO (Opcional)
      tags: ['Graça', 'Fraqueza', 'Paulo'], // <-- NOVO CAMPO (Opcional, para busca/filtro futuro)
      fullText: `...`,
      description: 'Uma reflexão sobre como o poder de Deus se aperfeiçoa em nossa fraqueza...',
      detailsUrl: '/sermoes/graca-suficiente',
      pdfUrl: '/path/to/sermon-001.pdf'
    },
    {
      id: 'bom-pastor',
      title: 'O Bom Pastor e Suas Ovelhas',
      type: 'Sermão',
      date: '2024-03-10',
      reference: 'João 10:1-18',
      book: 'João', // <-- NOVO CAMPO
      // series: null, // Pode não pertencer a uma série
      tags: ['Jesus', 'Pastor', 'Ovelhas', 'Segurança'],
      fullText: '<p>Análise detalhada da passagem de João 10...</p>',
      description: 'Analisando a metáfora de Cristo como o Bom Pastor...',
      detailsUrl: '/sermoes/bom-pastor',
      pdfUrl: '/path/to/sermon-002.pdf'
    },
    {
      id: 'vivendo-pela-fe',
      title: 'Vivendo pela Fé, Não pela Vista',
      type: 'Sermão',
      date: '2024-03-03',
      reference: '2 Coríntios 5:7',
      book: '2 Coríntios', // <-- NOVO CAMPO
      series: 'Fundamentos da Graça', // <-- NOVO CAMPO (Opcional)
      tags: ['Fé', 'Confiança', 'Vista'],
      fullText: '<p>Exploração do significado de andar por fé...</p>',
      description: 'Um chamado a confiar nas promessas de Deus...',
      detailsUrl: '/sermoes/vivendo-pela-fe',
    },
  ];
  
  export const studiesData = [
      {
          id: 'intro-teologia-sistematica',
          title: 'Introdução à Teologia Sistemática',
          type: 'Estudo Bíblico',
          reference: 'Doutrinas Fundamentais', // Mantido para exibição
          bookLink: null, // Pode linkar para um livro específico se for um estudo expositivo
          theme: 'Teologia Sistemática', // <-- NOVO CAMPO
          format: 'Estudo Aprofundado', // Já existia, bom para filtro
          fullText: '<p>Este estudo aborda os pilares...</p>',
          description: 'Uma visão geral das principais doutrinas...',
          detailsUrl: '/estudos/intro-teologia-sistematica',
          pdfUrl: '/path/to/study-001.pdf'
        },
        {
          id: 'devocional-salmo-23',
          title: 'Devocional no Salmo 23',
          type: 'Estudo Bíblico',
          reference: 'Salmo 23', // Mantido
          bookLink: 'Salmos', // <-- NOVO CAMPO (se aplicável)
          theme: 'Vida Cristã', // <-- NOVO CAMPO
          format: 'Devocional', // Já existia
          fullText: '<p>Reflexões versículo a versículo...</p>',
          description: 'Meditações sobre o cuidado e a provisão de Deus...',
          detailsUrl: '/estudos/devocional-salmo-23',
        },
  ];
  
  export const booksData = [
      {
          id: 'cristianismo-puro-simples',
          title: 'Cristianismo Puro e Simples',
          type: 'Resumo de Livro',
          author: 'C.S. Lewis', // Já existia, bom para filtro
          publisher: 'Thomas Nelson Brasil',
          area: 'Apologética', // Já existia, bom para filtro
          fullText: '<p>Análise capítulo a capítulo...</p>',
          description: 'Resumo e análise dos principais argumentos de Lewis...',
          detailsUrl: '/livros/cristianismo-puro-simples',
          pdfUrl: '/path/to/book-summary-001.pdf'
        },
        {
          id: 'institutas-calvino-resumo',
          title: 'Institutas da Religião Cristã (Ed. Cultura Cristã)',
          type: 'Resumo de Livro',
          author: 'João Calvino', // Já existia
          publisher: 'Cultura Cristã',
          area: 'Teologia Sistemática', // Já existia
          fullText: '<p>Um resumo estruturado da obra monumental...</p>',
          description: 'Um guia introdutório e resumo dos temas centrais...',
          detailsUrl: '/livros/institutas-calvino-resumo',
        },
  ];
  
  // Função auxiliar de busca continua a mesma
  export const findContentById = (id) => {
      const allData = [...sermonsData, ...studiesData, ...booksData];
      return allData.find(item => item.id === id);
  }