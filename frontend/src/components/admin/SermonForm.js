// src/components/admin/SermonForm.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Form.css'; // CSS geral para formulários admin
import SermonFormFields from './SermonFormFields';

function SermonForm() {
  const [title, setTitle] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [book, setBook] = useState('');
  const [series, setSeries] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [tags, setTags] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL se estiver em modo de edição (ex: /editar/:id)

  const isEditing = !!id; // Verdadeiro se um ID estiver presente na URL

  useEffect(() => {
    // Se estiver no modo de edição, busca os dados do sermão para preencher o formulário
    if (isEditing) {
      const handleSermonError = (err) => {
        setError(
          `Erro ao carregar dados do sermão: ${err.response?.data?.message || err.message}`,
        );
      };
      const setFieldOrDefault = (setter, value, def = '') => setter(value || def);
      const setSermonFields = (sermonData) => {
        setFieldOrDefault(setTitle, sermonData.title);
        setFieldOrDefault(setBibleReference, sermonData.bibleReference);
        setFieldOrDefault(setDate, sermonData.date ? new Date(sermonData.date).toISOString().split('T')[0] : '');
        setFieldOrDefault(setDescription, sermonData.description);
        setFieldOrDefault(setContent, sermonData.content);
        setFieldOrDefault(setAudioUrl, sermonData.audioUrl);
        setFieldOrDefault(setVideoUrl, sermonData.videoUrl);
        setFieldOrDefault(setPdfUrl, sermonData.pdfUrl);
        setFieldOrDefault(setTags, (sermonData.tags || []).join(', '));
        setFieldOrDefault(setSpeaker, sermonData.speaker);
        setFieldOrDefault(setLocal, sermonData.local);
        setFieldOrDefault(setBook, sermonData.book);
        setFieldOrDefault(setSeries, sermonData.series);
      };
      const fetchSermon = async () => {
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
            API_ENDPOINTS.SERMONS.BY_ID(id),
            config,
          );
          const sermonData = response.data.success
            ? response.data.data
            : response.data;
          setSermonFields(sermonData);
        } catch (err) {
          handleSermonError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSermon();
    }
  }, [id, isEditing]); // Refaz o efeito se o ID mudar ou se isEditing mudar

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const sermonData = {
      title,
      bibleReference,
      series,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean), // transforma string em array
      speaker,
      date,
      local,
      description,
      content,
      audioUrl,
      videoUrl,
      pdfUrl,
      book,
    };

    try {
      const token = localStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (isEditing) {
        await axios.patch(API_ENDPOINTS.SERMONS.BY_ID(id), sermonData, config);
        setSuccess('Sermão atualizado com sucesso!');
      } else {
        await axios.post(API_ENDPOINTS.SERMONS.BASE, sermonData, config);
        setSuccess('Sermão criado com sucesso!');
        // Limpa o formulário após a criação
        setTitle('');
        setBibleReference('');
        setDate('');
        setDescription('');
        setContent('');
        setAudioUrl('');
        setVideoUrl('');
        setPdfUrl('');
        setTags('');
        setSpeaker('');
        setLocal('');
      }
      // Opcional: redirecionar para a lista de sermões após sucesso
      navigate('/admin/sermons');
    } catch (err) {
      setError(
        `Erro ao salvar sermão: ${err.response?.data?.message || err.message}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditing) return <p>Carregando dados do sermão...</p>; // Apenas para edição inicial

  return (
    <div className='form-container'>
      <h2>{isEditing ? 'Editar Sermão' : 'Novo Sermão'}</h2>
      <form onSubmit={handleSubmit} className='admin-form'>
        {error && <p className='error-message'>{error}</p>}
        {success && <p className='success-message'>{success}</p>}
        <SermonFormFields
          title={title} setTitle={setTitle}
          bibleReference={bibleReference} setBibleReference={setBibleReference}
          book={book} setBook={setBook}
          series={series} setSeries={setSeries}
          date={date} setDate={setDate}
          description={description} setDescription={setDescription}
          content={content} setContent={setContent}
          audioUrl={audioUrl} setAudioUrl={setAudioUrl}
          videoUrl={videoUrl} setVideoUrl={setVideoUrl}
          pdfUrl={pdfUrl} setPdfUrl={setPdfUrl}
          tags={tags} setTags={setTags}
          speaker={speaker} setSpeaker={setSpeaker}
          local={local} setLocal={setLocal}
          loading={loading}
        />

        <button type='submit' disabled={loading}>
          {loading
            ? isEditing
              ? 'Atualizando...'
              : 'Criando...'
            : isEditing
              ? 'Atualizar Sermão'
              : 'Criar Sermão'}
        </button>
        <Link to='/admin/sermons' className='btn-back'>
          Voltar para a Lista
        </Link>
      </form>
    </div>
  );
}

export default SermonForm;
