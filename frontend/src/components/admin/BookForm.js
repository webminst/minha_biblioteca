// src/components/admin/BookForm.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { extractBooks } from '../../utils/apiResponseHelpers';
import './Form.css'; // Reutiliza o CSS geral de formulários admin

function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  // Estados para os campos do formulário, baseados no seu BookSchema
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState(() => {
    // Valor padrão: data atual no formato YYYY-MM-DD
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [local, setLocal] = useState('');
  const [area, setArea] = useState('');
  const areaOptions = [
    'Teologia Sistemática',
    'Teologia Bíblica',
    'Comentários Bíblicos',
    'Vida Cristã',
    'Apologética',
    'História da Igreja',
    'Biografias',
    'Devocionais',
    'Outros',
  ];
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [personalRating, setPersonalRating] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [purchaseLinks, setPurchaseLinks] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [publicationYear, setPublicationYear] = useState('');
  // const [keyPoints, setKeyPoints] = useState('');
  // const [quotes, setQuotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contentError, setContentError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchBook = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('userToken');
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            API_ENDPOINTS.BOOKS.BY_ID(id),
            config,
          );
          const bookData = response.data.success
            ? response.data.data
            : response.data;

          setTitle(bookData.title || '');
          setSeries(bookData.series || '');
          setTags(bookData.tags ? bookData.tags.join(', ') : '');
          setAuthor(bookData.author || '');
          setDate(
            bookData.date
              ? new Date(bookData.date).toISOString().split('T')[0]
              : '',
          );
          setLocal(bookData.local || '');
          setArea(typeof bookData.area === 'string' ? bookData.area : '');
          setDescription(bookData.description || '');
          setContent(bookData.content || bookData.summary || '');
          setAudioUrl(bookData.audioUrl || '');
          setVideoUrl(bookData.videoUrl || '');
          setImageUrl(bookData.coverImageUrl || bookData.imageUrl || '');
          setPdfUrl(bookData.pdfUrl || '');
          setPublisher(bookData.publisher || '');
          setIsbn(bookData.isbn || '');
          setPageCount(bookData.pageCount ? String(bookData.pageCount) : '');
          setPersonalRating(
            bookData.personalRating ? String(bookData.personalRating) : '',
          );
          setDifficulty(bookData.difficulty || '');
          setPurchaseLinks(
            bookData.purchaseLinks
              ? bookData.purchaseLinks
                .map(
                  l => `${l.store}: ${l.url}${l.price ? ` (${l.price})` : ''}`,
                )
                .join('\n')
              : '',
          );
          setIsPublished(
            bookData.isPublished !== undefined ? bookData.isPublished : true,
          );
          setFeatured(
            bookData.featured !== undefined ? bookData.featured : false,
          );
          setPublicationYear(
            bookData.publicationYear ? String(bookData.publicationYear) : '',
          );
          // setKeyPoints(bookData.keyPoints ? bookData.keyPoints.join('\n') : '');
          // setQuotes(bookData.quotes ? bookData.quotes.map(q => `${q.text}${q.page ? ` (p. ${q.page})` : ''}${q.chapter ? ` [${q.chapter}]` : ''}`).join('\n') : '');
        } catch (err) {
          setError(
            `Erro ao carregar dados do livro: ${
              err.response?.data?.message || err.message}`,
          );
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [id, isEditing]);
  // ...existing state declarations...

  // Função de submit do formulário
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validação do conteúdo obrigatório e tamanho
    const MAX_SUMMARY_LENGTH = 20000;
    const MIN_SUMMARY_LENGTH = 100;
    if (!content || content.length < MIN_SUMMARY_LENGTH) {
      setContentError(
        `O conteúdo/resumo deve ter pelo menos ${MIN_SUMMARY_LENGTH} caracteres.`,
      );
      setLoading(false);
      return;
    } else if (content.length > MAX_SUMMARY_LENGTH) {
      setContentError(
        `O resumo não pode ter mais de ${MAX_SUMMARY_LENGTH} caracteres. Atualmente tem ${content.length} caracteres.`,
      );
      setLoading(false);
      return;
    } else {
      setContentError(null);
    }
    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Usuário não autenticado. Redirecionando para login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Prepara os dados do livro de acordo com o UpdateBookDTO
    const bookData = {
      title: title || undefined,
      author: author || undefined,
      description: description || undefined,
      content: content || undefined,
      summary: content || undefined, // Garante compatibilidade com backend
      area: area || undefined,
      tags: tags
        ? tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
        : undefined,
      series: series || undefined,
      coverImageUrl: imageUrl || undefined,
      pdfUrl: pdfUrl || undefined,
      videoUrl: videoUrl || undefined,
      audioUrl: audioUrl || undefined,
      publisher: publisher || undefined,
      isbn: isbn || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
      personalRating: personalRating ? Number(personalRating) : undefined,
      difficulty: difficulty || undefined,
      purchaseLinks: purchaseLinks
        ? purchaseLinks
          .split('\n')
          .map(l => {
            const [storeUrl, price] = l.split('(');
            const [store, url] = storeUrl.split(':').map(s => s.trim());
            return store && url
              ? {
                store,
                url,
                price: price ? Number(price.replace(/\D/g, '')) : undefined,
              }
              : null;
          })
          .filter(Boolean)
        : undefined,
      isPublished,
      featured,
      publicationYear: publicationYear ? Number(publicationYear) : undefined,
      local: local || undefined,
      date: date || undefined,
    };

    // Remove campos undefined do objeto
    Object.keys(bookData).forEach(key => {
      if (bookData[key] === undefined) {
        delete bookData[key];
      }
    });

    try {
      // Log do objeto enviado para debug
      if (isEditing) {
        console.log('[DEBUG] Atualizando livro:', {
          id,
          bookData,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log('[DEBUG] Criando novo livro:', {
          bookData,
          timestamp: new Date().toISOString(),
        });
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (isEditing) {
        // Usa PUT para atualização, conforme esperado pelo backend
        await axios.put(API_ENDPOINTS.BOOKS.BY_ID(id), bookData, config);
        setSuccess('Livro atualizado com sucesso!');
      } else {
        // Para criação, mantém o POST
        await axios.post(API_ENDPOINTS.BOOKS.BASE, bookData, config);
        setSuccess('Livro criado com sucesso!');
        // Limpa o formulário após a criação
        setTitle('');
        setSeries('');
        setTags('');
        setAuthor('');
        setDate('');
        setLocal('');
        setArea('');
        setDescription('');
        setContent('');
        setAudioUrl('');
        setVideoUrl('');
        setImageUrl('');
        setPdfUrl('');
      }
      // Opcional: redirecionar para a lista de livros após sucesso
      navigate('/admin/livros');
    } catch (err) {
      let errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao processar a requisição';

      // Mensagem amigável para erro 400 de update vazio
      if (
        err.response?.status === 400 &&
        errorMessage.includes('Nenhum campo válido para atualizar')
      ) {
        errorMessage =
          'Nenhuma alteração detectada. Edite algum campo antes de salvar.';
      } else if (!errorMessage.startsWith('Erro ao salvar livro:')) {
        errorMessage = `Erro ao salvar livro: ${errorMessage}`;
      }

      setError(errorMessage);

      // Log detalhado no console para depuração
      console.error('Erro detalhado:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data,
        },
      });

      // Se o token estiver inválido, redireciona para o login
      if (err.response?.status === 401) {
        localStorage.removeItem('userToken');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !error) {
    return (
      <div className='form-container'>
        <p>Carregando dados do livro...</p>
      </div>
    );
  }

  return (
    <div className='form-container'>
      <h2>{isEditing ? 'Editar Livro' : 'Novo Livro'}</h2>
      <form onSubmit={handleSubmit} className='admin-form'>
        {error && <p className='error-message'>{error}</p>}
        {/* Campos obrigatórios */}
        <div className='form-group'>
          <label htmlFor='title'>Título:</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='area'>Área:</label>
          <select
            id='area'
            value={area}
            onChange={e => setArea(e.target.value)}
            disabled={loading}
            required
          >
            <option value=''>Selecione uma área</option>
            {areaOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Campos opcionais agrupados abaixo */}
        <div className='optional-fields'>
          <div className='form-group'>
            <label htmlFor='author'>Autor:</label>
            <input
              type='text'
              id='author'
              value={author}
              onChange={e => setAuthor(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='series'>Série (opcional):</label>
            <input
              type='text'
              id='series'
              value={series}
              onChange={e => setSeries(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='form-row'>
            <div className='form-col'>
              <label htmlFor='isbn'>ISBN</label>
              <input
                type='text'
                id='isbn'
                value={isbn}
                onChange={e => setIsbn(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className='form-col'>
              <label htmlFor='pageCount'>Páginas</label>
              <input
                type='number'
                id='pageCount'
                value={pageCount}
                onChange={e => setPageCount(e.target.value)}
                disabled={loading}
                min='1'
              />
            </div>
            <div className='form-col'>
              <label htmlFor='personalRating'>Avaliação (1-5)</label>
              <input
                type='number'
                id='personalRating'
                value={personalRating}
                onChange={e => setPersonalRating(e.target.value)}
                disabled={loading}
                min='1'
                max='5'
              />
            </div>
            {/* Removido campo 'Ano' duplicado */}
          </div>
          <div className='form-group'>
            <label htmlFor='difficulty'>Dificuldade (opcional):</label>
            <select
              id='difficulty'
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              disabled={loading}
            >
              <option value=''>Selecione</option>
              <option value='Iniciante'>Iniciante</option>
              <option value='Intermediário'>Intermediário</option>
              <option value='Avançado'>Avançado</option>
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor='purchaseLinks'>
              Links de Compra (um por linha, formato: Loja: URL (preço
              opcional)):
            </label>
            <textarea
              id='purchaseLinks'
              value={purchaseLinks}
              onChange={e => setPurchaseLinks(e.target.value)}
              rows='3'
              disabled={loading}
            ></textarea>
          </div>
          <div className='form-group'>
            <div className='form-row'>
              <div className='form-col'>
                <label htmlFor='isPublished'>Publicado?</label>
                <input
                  type='checkbox'
                  id='isPublished'
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  disabled={loading}
                />
              </div>
              <div className='form-col'>
                <label htmlFor='featured'>Destaque?</label>
                <input
                  type='checkbox'
                  id='featured'
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='publicationYear'>
              Ano de Publicação (opcional):
            </label>
            <input
              type='number'
              id='publicationYear'
              value={publicationYear}
              onChange={e => setPublicationYear(e.target.value)}
              disabled={loading}
              min='1900'
              max={new Date().getFullYear()}
            />
          </div>
          {/* Campos 'Pontos-chave' e 'Citações' removidos */}
          <div className='form-group'>
            <label htmlFor='description'>Descrição/Sinopse (opcional):</label>
            <textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows='3'
              disabled={loading}
            ></textarea>
          </div>
          <div className='form-group'>
            <label htmlFor='content'>
              Conteúdo (resumo/trecho em Markdown, obrigatório):
            </label>
            <textarea
              id='content'
              value={content}
              onChange={e => setContent(e.target.value)}
              rows='10'
              disabled={loading}
              maxLength={20000}
              className={contentError ? 'input-error' : ''}
            ></textarea>
            <div className='character-count'>
              {content.length}/20000 caracteres
            </div>
            {contentError && (
              <div className='error-message'>{contentError}</div>
            )}
            <small>Use sintaxe Markdown para formatação.</small>
          </div>
          <div className='form-group'>
            <label htmlFor='pdfUrl'>URL do PDF (e-book, opcional):</label>
            <input
              type='url'
              id='pdfUrl'
              value={pdfUrl}
              onChange={e => setPdfUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='audioUrl'>URL do Áudio Livro (opcional):</label>
            <input
              type='url'
              id='audioUrl'
              value={audioUrl}
              onChange={e => setAudioUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='videoUrl'>
              URL do Vídeo (resenha/trailer, opcional):
            </label>
            <input
              type='url'
              id='videoUrl'
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='imageUrl'>URL da Imagem da Capa (opcional):</label>
            <input
              type='url'
              id='imageUrl'
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='tags'>Tags (separar por vírgula, opcional):</label>
            <input
              type='text'
              id='tags'
              value={tags}
              onChange={e => setTags(e.target.value)}
              disabled={loading}
            />
            <small>Ex: "ficção, teologia, biografia"</small>
          </div>
          <div className='form-group'>
            <label htmlFor='date'>Data de Cadastro:</label>
            <input
              type='date'
              id='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={loading}
              placeholder={(() => {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()}
            />
            <small style={{ color: '#888' }}>
              Padrão:{' '}
              {(() => {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()}{' '}
              (hoje)
            </small>
          </div>
          <div className='form-group'>
            <label htmlFor='local'>Local de Publicação (opcional):</label>
            <input
              type='text'
              id='local'
              value={local}
              onChange={e => setLocal(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <button type='submit' disabled={loading}>
          {loading
            ? isEditing
              ? 'Atualizando...'
              : 'Criando...'
            : isEditing
              ? 'Atualizar Livro'
              : 'Criar Livro'}
        </button>
        <Link to='/admin/livros' className='btn-back'>
          Voltar para a Lista
        </Link>
      </form>
    </div>
  );
}

export default BookForm;
