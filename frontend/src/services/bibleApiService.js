/**
 * Serviço para integração com APIs bíblicas
 * Suporte para múltiplas APIs incluindo versões em português
 */

// APIs disponíveis
const BIBLE_API_BASE_URL = 'https://bible-api.com';
const BIBLIA_API_BASE_URL = 'https://www.abibliadigital.com.br/api';

// Cache simples para evitar requisições repetidas
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

/**
 * Traduções disponíveis
 */
export const AVAILABLE_TRANSLATIONS = {
  ara: 'Almeida Revista e Atualizada (Português)',
  acf: 'Almeida Corrigida Fiel (Português)',
  nvi: 'Nova Versão Internacional (Português)',
  kjv: 'King James Version (Inglês)',
  web: 'World English Bible (Inglês)',
};

/**
 * Mapeamento de livros bíblicos em português para IDs da API
 */
const BOOK_MAPPING_PT = {
  // Antigo Testamento
  genesis: 'gn',
  gênesis: 'gn',
  gn: 'gn',
  exodo: 'ex',
  êxodo: 'ex',
  ex: 'ex',
  levitico: 'lv',
  levítico: 'lv',
  lv: 'lv',
  numeros: 'nm',
  números: 'nm',
  nm: 'nm',
  deuteronomio: 'dt',
  deuteronômio: 'dt',
  dt: 'dt',
  josue: 'js',
  josué: 'js',
  js: 'js',
  juizes: 'jz',
  juízes: 'jz',
  jz: 'jz',
  rute: 'rt',
  rt: 'rt',
  '1samuel': '1sm',
  '1 samuel': '1sm',
  '1sm': '1sm',
  '2samuel': '2sm',
  '2 samuel': '2sm',
  '2sm': '2sm',
  '1reis': '1rs',
  '1 reis': '1rs',
  '1rs': '1rs',
  '2reis': '2rs',
  '2 reis': '2rs',
  '2rs': '2rs',
  '1cronicas': '1cr',
  '1 crônicas': '1cr',
  '1cr': '1cr',
  '2cronicas': '2cr',
  '2 crônicas': '2cr',
  '2cr': '2cr',
  esdras: 'ed',
  ed: 'ed',
  neemias: 'ne',
  ne: 'ne',
  ester: 'et',
  et: 'et',
  jo: 'jó',
  jó: 'jó',
  salmos: 'sl',
  sl: 'sl',
  proverbios: 'pv',
  provérbios: 'pv',
  pv: 'pv',
  eclesiastes: 'ec',
  ec: 'ec',
  cantares: 'ct',
  cantico: 'ct',
  ct: 'ct',
  isaias: 'is',
  isaías: 'is',
  is: 'is',
  jeremias: 'jr',
  jr: 'jr',
  lamentacoes: 'lm',
  lamentações: 'lm',
  lm: 'lm',
  ezequiel: 'ez',
  ez: 'ez',
  daniel: 'dn',
  dn: 'dn',
  oseias: 'os',
  oséias: 'os',
  os: 'os',
  joel: 'jl',
  jl: 'jl',
  amos: 'am',
  amós: 'am',
  am: 'am',
  obadias: 'ob',
  ob: 'ob',
  jonas: 'jn',
  jn: 'jn',
  miqueias: 'mq',
  mq: 'mq',
  naum: 'na',
  na: 'na',
  habacuque: 'hc',
  hc: 'hc',
  sofonias: 'sf',
  sf: 'sf',
  ageu: 'ag',
  ag: 'ag',
  zacarias: 'zc',
  zc: 'zc',
  malaquias: 'ml',
  ml: 'ml',

  // Novo Testamento
  mateus: 'mt',
  mt: 'mt',
  marcos: 'mc',
  mc: 'mc',
  lucas: 'lc',
  lc: 'lc',
  joao: 'jo',
  joão: 'jo',
  jo: 'jo',
  atos: 'at',
  at: 'at',
  romanos: 'rm',
  rm: 'rm',
  '1corintios': '1co',
  '1 coríntios': '1co',
  '1co': '1co',
  '2corintios': '2co',
  '2 coríntios': '2co',
  '2co': '2co',
  galatas: 'gl',
  gálatas: 'gl',
  gl: 'gl',
  efesios: 'ef',
  efésios: 'ef',
  ef: 'ef',
  filipenses: 'fp',
  fp: 'fp',
  colossenses: 'cl',
  cl: 'cl',
  '1tessalonicenses': '1ts',
  '1 tessalonicenses': '1ts',
  '1ts': '1ts',
  '2tessalonicenses': '2ts',
  '2 tessalonicenses': '2ts',
  '2ts': '2ts',
  '1timoteo': '1tm',
  '1 timóteo': '1tm',
  '1tm': '1tm',
  '2timoteo': '2tm',
  '2 timóteo': '2tm',
  '2tm': '2tm',
  tito: 'tt',
  tt: 'tt',
  filemom: 'fm',
  fm: 'fm',
  hebreus: 'hb',
  hb: 'hb',
  tiago: 'tg',
  tg: 'tg',
  '1pedro': '1pe',
  '1 pedro': '1pe',
  '1pe': '1pe',
  '2pedro': '2pe',
  '2 pedro': '2pe',
  '2pe': '2pe',
  '1joao': '1jo',
  '1 joão': '1jo',
  '1jo': '1jo',
  '2joao': '2jo',
  '2 joão': '2jo',
  '2jo': '2jo',
  '3joao': '3jo',
  '3 joão': '3jo',
  '3jo': '3jo',
  judas: 'jd',
  jd: 'jd',
  apocalipse: 'ap',
  ap: 'ap',
};

/**
 * Função para buscar versículos usando API brasileira (A Bíblia Digital)
 */
const fetchVerseBrazilianAPI = async (
  book,
  chapter,
  verse,
  version = 'ara',
) => {
  try {
    const url = `${BIBLIA_API_BASE_URL}/verses/${version}/${book}/${chapter}/${verse}`;

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE', // Token será necessário para produção
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    return {
      reference: `${book} ${chapter}:${verse}`,
      text: data.text,
      book: data.book.name,
      chapter: data.chapter,
      verse: data.number,
      translation: version,
    };
  } catch (error) {
    console.warn('Erro na API brasileira, usando fallback:', error);
    return null;
  }
};

/**
 * Dados de fallback para versículos populares em português
 */
const FALLBACK_VERSES_PT = {
  'joão 3:16': {
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    reference: 'João 3:16',
    book: 'João',
    chapter: 3,
    verse: 16,
    translation: 'ara',
  },
  'salmos 23:1': {
    text: 'O Senhor é o meu pastor; nada me faltará.',
    reference: 'Salmos 23:1',
    book: 'Salmos',
    chapter: 23,
    verse: 1,
    translation: 'ara',
  },
  'filipenses 4:13': {
    text: 'Posso todas as coisas naquele que me fortalece.',
    reference: 'Filipenses 4:13',
    book: 'Filipenses',
    chapter: 4,
    verse: 13,
    translation: 'ara',
  },
  'jeremias 29:11': {
    text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
    reference: 'Jeremias 29:11',
    book: 'Jeremias',
    chapter: 29,
    verse: 11,
    translation: 'ara',
  },
  'romanos 8:28': {
    text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    reference: 'Romanos 8:28',
    book: 'Romanos',
    chapter: 8,
    verse: 28,
    translation: 'ara',
  },
  'provérbios 3:5-6': {
    text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    reference: 'Provérbios 3:5-6',
    book: 'Provérbios',
    chapter: 3,
    verse: '5-6',
    translation: 'ara',
  },
  'isaías 40:31': {
    text: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    reference: 'Isaías 40:31',
    book: 'Isaías',
    chapter: 40,
    verse: 31,
    translation: 'ara',
  },
  'mateus 28:19-20': {
    text: 'Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo; ensinando-as a guardar todas as coisas que eu vos tenho mandado; e eis que eu estou convosco todos os dias, até à consumação dos séculos.',
    reference: 'Mateus 28:19-20',
    book: 'Mateus',
    chapter: 28,
    verse: '19-20',
    translation: 'ara',
  },
};

/**
 * Limpa itens expirados do cache
 */
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

/**
 * Normaliza referência bíblica para formato da API
 * @param {string} reference - Referência bíblica (ex: "João 3:16", "Mateus 5:1-10")
 * @returns {string} - Referência normalizada
 */
export const normalizeReference = reference => {
  if (!reference) return '';

  // Remove acentos e converte para formato esperado pela API
  const bookMappings = {
    gênesis: 'genesis',
    êxodo: 'exodus',
    levítico: 'leviticus',
    números: 'numbers',
    deuteronômio: 'deuteronomy',
    josué: 'joshua',
    juízes: 'judges',
    rute: 'ruth',
    samuel: 'samuel',
    reis: 'kings',
    crônicas: 'chronicles',
    esdras: 'ezra',
    neemias: 'nehemiah',
    ester: 'esther',
    jó: 'job',
    salmos: 'psalms',
    provérbios: 'proverbs',
    eclesiastes: 'ecclesiastes',
    cantares: 'song+of+solomon',
    isaías: 'isaiah',
    jeremias: 'jeremiah',
    lamentações: 'lamentations',
    ezequiel: 'ezekiel',
    daniel: 'daniel',
    oséias: 'hosea',
    joel: 'joel',
    amós: 'amos',
    obadias: 'obadiah',
    jonas: 'jonah',
    miquéias: 'micah',
    naum: 'nahum',
    habacuque: 'habakkuk',
    sofonias: 'zephaniah',
    ageu: 'haggai',
    zacarias: 'zechariah',
    malaquias: 'malachi',
    mateus: 'matthew',
    marcos: 'mark',
    lucas: 'luke',
    joão: 'john',
    atos: 'acts',
    romanos: 'romans',
    coríntios: 'corinthians',
    gálatas: 'galatians',
    efésios: 'ephesians',
    filipenses: 'philippians',
    colossenses: 'colossians',
    tessalonicenses: 'thessalonians',
    timóteo: 'timothy',
    tito: 'titus',
    filemom: 'philemon',
    hebreus: 'hebrews',
    tiago: 'james',
    pedro: 'peter',
    judas: 'jude',
    apocalipse: 'revelation',
  };

  let normalized = reference.toLowerCase().trim();

  // Substitui nomes de livros
  for (const [portuguese, english] of Object.entries(bookMappings)) {
    if (normalized.includes(portuguese)) {
      normalized = normalized.replace(portuguese, english);
      break;
    }
  }

  // Remove espaços extras e formata para URL
  return normalized.replace(/\s+/g, '+');
};

/**
 * Busca versículo(s) na API bíblica
 * @param {string} reference - Referência bíblica
 * @param {string} translation - Tradução (padrão: 'almeida')
 * @returns {Promise<Object>} - Dados do versículo
 */
export const fetchVerse = async (reference, translation = 'ara') => {
  try {
    clearExpiredCache();

    const normalizedRef = normalizeReference(reference);
    const cacheKey = `${normalizedRef}-${translation}`;

    // Verifica cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    let result = null;

    // Para traduções em português, tenta o fallback primeiro
    if (['ara', 'acf', 'nvi'].includes(translation)) {
      const fallbackKey = normalizedRef.toLowerCase();
      if (FALLBACK_VERSES_PT[fallbackKey]) {
        result = FALLBACK_VERSES_PT[fallbackKey];
      }
    }

    // Se não encontrou no fallback, tenta a API internacional
    if (!result) {
      try {
        const url = `${BIBLE_API_BASE_URL}/${encodeURIComponent(normalizedRef)}?translation=${translation === 'ara' ? 'almeida' : translation}`;
        const response = await fetch(url);

        if (response.ok) {
          result = await response.json();
        }
      } catch (apiError) {
        console.warn('Erro na API internacional:', apiError);
      }
    }

    // Se ainda não encontrou, usa um fallback genérico
    if (!result) {
      result = {
        reference: normalizedRef,
        text: `Versículo não encontrado para a referência "${normalizedRef}". Verifique se a referência está correta e tente novamente.`,
        book: normalizedRef.split(' ')[0],
        chapter: 1,
        verse: 1,
        translation,
        isError: true,
      };
    }

    // Adiciona ao cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error('Erro ao buscar versículo:', error);
    throw new Error(
      'Não foi possível buscar o versículo. Verifique a referência e tente novamente.',
    );
  }
};

/**
 * Valida se uma referência bíblica é válida
 * @param {string} reference - Referência para validar
 * @param {string} translation - Tradução para teste
 * @returns {Promise<boolean>} - True se válida
 */
export const validateReference = async (reference, translation = 'almeida') => {
  try {
    const result = await fetchVerse(reference, translation);
    return result && result.verses && result.verses.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Busca versículo aleatório
 * @param {string} translation - Tradução (padrão: 'almeida')
 * @param {string} testament - 'OT' para Antigo, 'NT' para Novo, null para ambos
 * @returns {Promise<Object>} - Dados do versículo aleatório
 */
export const fetchRandomVerse = async (
  translation = 'ara',
  testament = null,
) => {
  try {
    // Lista de versículos populares para seleção aleatória
    const popularVerses = [
      'João 3:16',
      'Salmos 23:1',
      'Filipenses 4:13',
      'Jeremias 29:11',
      'Romanos 8:28',
      'Provérbios 3:5-6',
      'Isaías 40:31',
      'Mateus 28:19-20',
      'Efésios 2:8-9',
      '1 João 4:19',
      'Josué 1:9',
      'Salmos 46:1',
      'Mateus 11:28-30',
      'Romanos 10:9',
      '2 Timóteo 3:16',
      'Hebreus 11:1',
    ];

    const randomIndex = Math.floor(Math.random() * popularVerses.length);
    const randomReference = popularVerses[randomIndex];

    return await fetchVerse(randomReference, translation);
  } catch (error) {
    console.error('Erro ao buscar versículo aleatório:', error);
    throw new Error('Não foi possível buscar versículo aleatório.');
  }
};

/**
 * Extrai informações de uma referência bíblica
 * @param {string} reference - Referência bíblica
 * @returns {Object} - Objeto com livro, capítulo, versículos
 */
export const parseReference = reference => {
  if (!reference) return null;

  const regex = /^(\d?\s*\w+)\s+(\d+):?(\d+)?(?:-(\d+))?(?:,(\d+))?/i;
  const match = reference.match(regex);

  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    startVerse: match[3] ? parseInt(match[3]) : null,
    endVerse: match[4] ? parseInt(match[4]) : null,
    additionalVerse: match[5] ? parseInt(match[5]) : null,
    original: reference,
  };
};

/**
 * Formata dados do versículo para exibição
 * @param {Object} verseData - Dados da API
 * @returns {Object} - Dados formatados
 */
export const formatVerseData = verseData => {
  if (!verseData || !verseData.verses) return null;

  return {
    reference: verseData.reference,
    text: verseData.text,
    translation: verseData.translation_name,
    verses: verseData.verses.map(verse => ({
      book_id: verse.book_id,
      book_name: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    })),
  };
};

/**
 * Busca múltiplas referências em lote
 * @param {Array<string>} references - Array de referências
 * @param {string} translation - Tradução
 * @returns {Promise<Array>} - Array com resultados
 */
export const fetchMultipleVerses = async (
  references,
  translation = 'almeida',
) => {
  const promises = references.map(ref =>
    fetchVerse(ref, translation).catch(error => ({
      reference: ref,
      error: error.message,
    })),
  );

  return await Promise.all(promises);
};

/**
 * Obtém estatísticas do cache
 * @returns {Object} - Estatísticas do cache
 */
export const getCacheStats = () => {
  clearExpiredCache();
  return {
    size: cache.size,
    maxAge: CACHE_DURATION / 1000 / 60, // em minutos
  };
};

/**
 * Limpa todo o cache
 */
export const clearCache = () => {
  cache.clear();
};
