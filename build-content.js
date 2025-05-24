// build-content.js
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter'); // Para processar frontmatter
const { marked } = require('marked');   // Para converter Markdown para HTML
const markedFootnote = require('marked-footnote'); // Importar a extensão

marked.use(markedFootnote({
  description: 'Ver nota de rodapé', // Texto para o link de volta, se usado
  refMarkers: ['*', '**', '***', '****', '*****', '******'] // Opcional: marcadores
}));


const contentDir = path.join(__dirname, 'content');
const outputDataFile = path.join(__dirname, 'src', 'data', 'generatedData.js');

// Configuração opcional do 'marked' (ex: para adicionar classes a elementos, etc.)
// marked.setOptions({
//   renderer: new marked.Renderer(),
//   highlight: function(code, lang) {
//     const hljs = require('highlight.js');
//     const language = hljs.getLanguage(lang) ? lang : 'plaintext';
//     return hljs.highlight(code, { language }).value;
//   },
//   langPrefix: 'hljs language-', // CSS class prefix for syntax highlighting
//   pedantic: false,
//   gfm: true,
//   breaks: false,
//   sanitize: false, // ATENÇÃO: Se o Markdown vier de fontes não confiáveis, sanitize: true é importante.
//   smartLists: true,
//   smartypants: false,
//   xhtml: false
// });

async function processMarkdownFile(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content: markdownContent } = matter(fileContent); // Extrai frontmatter e conteúdo markdown

  // Converte o conteúdo markdown para HTML
  // Usar marked.parse() se tiver importado como 'const { marked } = require('marked');'
  // Ou apenas marked() se importou como 'const marked = require('marked');'
  const htmlContent = marked.parse(markdownContent);

  // Gera o detailsUrl automaticamente se não estiver no frontmatter (opcional)
  const id = frontmatter.id || path.basename(filePath, '.md');
  const typeDir = path.basename(path.dirname(filePath)); // sermons, studies, books
  const detailsUrl = frontmatter.detailsUrl || `/${typeDir}/${id}`;

  return {
    ...frontmatter, // Todos os dados do frontmatter
    id: id,         // Garante que haja um ID
    fullText: htmlContent, // Conteúdo principal como HTML
    detailsUrl: detailsUrl, // URL de detalhe
  };
}

async function buildContent() {
  try {
    console.log('Iniciando a construção dos dados de conteúdo a partir de Markdown...');

    const sermonFiles = await fs.readdir(path.join(contentDir, 'sermons'));
    const studyFiles = await fs.readdir(path.join(contentDir, 'studies'));
    const bookFiles = await fs.readdir(path.join(contentDir, 'books'));

    const sermonsData = [];
    for (const file of sermonFiles) {
      if (file.endsWith('.md')) {
        const filePath = path.join(contentDir, 'sermons', file);
        const itemData = await processMarkdownFile(filePath);
        sermonsData.push(itemData);
      }
    }

    const studiesData = [];
    for (const file of studyFiles) {
      if (file.endsWith('.md')) {
        const filePath = path.join(contentDir, 'studies', file);
        const itemData = await processMarkdownFile(filePath);
        studiesData.push(itemData);
      }
    }

    const booksData = [];
    for (const file of bookFiles) {
      if (file.endsWith('.md')) {
        const filePath = path.join(contentDir, 'books', file);
        const itemData = await processMarkdownFile(filePath);
        booksData.push(itemData);
      }
    }

    // Ordenar os dados (exemplo: por data para sermões e estudos, se existir 'date')
    sermonsData.sort((a, b) => (a.date && b.date ? new Date(b.date) - new Date(a.date) : 0));
    studiesData.sort((a, b) => (a.date && b.date ? new Date(b.date) - new Date(a.date) : 0));
    // booksData pode ser por título ou autor
    booksData.sort((a, b) => a.title.localeCompare(b.title));


    const findContentByIdFunction = `
export const findContentById = (id) => {
    const allData = [...sermonsData, ...studiesData, ...booksData];
    return allData.find(item => item.id === id);
};`;

    const fileContent = `// Este arquivo é gerado automaticamente. NÃO EDITE DIRETAMENTE.
// Rode 'node build-content.js' (ou o script npm configurado) para atualizar.

export const sermonsData = ${JSON.stringify(sermonsData, null, 2)};

export const studiesData = ${JSON.stringify(studiesData, null, 2)};

export const booksData = ${JSON.stringify(booksData, null, 2)};

${findContentByIdFunction}
`;

    await fs.ensureDir(path.dirname(outputDataFile));
    await fs.writeFile(outputDataFile, fileContent, 'utf-8');

    console.log(`Dados de conteúdo (Markdown) construídos com sucesso em: ${outputDataFile}`);

  } catch (error) {
    console.error('Erro ao construir dados de conteúdo (Markdown):', error);
    process.exit(1);
  }
}

buildContent();