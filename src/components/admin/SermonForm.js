// src/components/admin/SermonForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Form.css'; // CSS geral para formulários admin

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
                    const response = await axios.get(API_ENDPOINTS.SERMONS.BY_ID(id), config);
                    const sermonData = response.data;

                    setTitle(sermonData.title || '');
                    setBibleReference(sermonData.bibleReference || '');
                    // Formata a data para YYYY-MM-DD para o input type="date"
                    setDate(sermonData.date ? new Date(sermonData.date).toISOString().split('T')[0] : '');
                    setDescription(sermonData.description || '');
                    setContent(sermonData.content || '');
                    setAudioUrl(sermonData.audioUrl || '');
                    setVideoUrl(sermonData.videoUrl || '');
                    setPdfUrl(sermonData.pdfUrl || '');
                    setTags((sermonData.tags || []).join(', '));
                    setSpeaker(sermonData.speaker || '');
                    setLocal(sermonData.local || '');
                    setBook(sermonData.book || '');
                    setSeries(sermonData.series || '');
                } catch (err) {
                    setError('Erro ao carregar dados do sermão: ' + (err.response?.data?.message || err.message));
                    console.error('Erro ao buscar sermão para edição:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSermon();
        }
    }, [id, isEditing]); // Refaz o efeito se o ID mudar ou se isEditing mudar

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const sermonData = {
            title,
            bibleReference,
            series,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean), // transforma string em array
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
            navigate('/admin/sermoes');
        } catch (err) {
            setError('Erro ao salvar sermão: ' + (err.response?.data?.message || err.message));
            console.error('Erro ao salvar sermão:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Carregando dados do sermão...</p>; // Apenas para edição inicial

    return (
        <div className="form-container">
            <h2>{isEditing ? 'Editar Sermão' : 'Novo Sermão'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="form-group">
                    <label htmlFor="title">Título:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bibleReference">Referência Bíblica:</label>
                    <input
                        type="text"
                        id="bibleReference"
                        value={bibleReference}
                        onChange={(e) => setBibleReference(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição (Resumo):</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        disabled={loading}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Conteúdo (Markdown):</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="10"
                        disabled={loading}
                    ></textarea>
                    <small>Use sintaxe Markdown para formatação (negrito, itálico, listas, etc.).</small>
                </div>

                <div className="form-group">
                    <label htmlFor="pdfUrl">URL do PDF:</label>
                    <input
                        type="url"
                        id="pdfUrl"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="audioUrl">URL do Áudio:</label>
                    <input
                        type="url"
                        id="audioUrl"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="videoUrl">URL do Vídeo:</label>
                    <input
                        type="url"
                        id="videoUrl"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags (separadas por vírgula):</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        disabled={loading}
                        placeholder="Ex: Fé, Graça, Esperança"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="speaker">Pregador:</label>
                    <input
                        type="text"
                        id="speaker"
                        value={speaker}
                        onChange={e => setSpeaker(e.target.value)}
                        disabled={loading}
                        placeholder="Nome do pregador"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="local">Local:</label>
                    <input
                        type="text"
                        id="local"
                        value={local}
                        onChange={e => setLocal(e.target.value)}
                        disabled={loading}
                        placeholder="Local do sermão"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Data:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="book">Livro:</label>
                    <input
                        type="text"
                        id="book"
                        value={book}
                        onChange={(e) => setBook(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="series">Série:</label>
                    <input
                        type="text"
                        id="series"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Sermão' : 'Criar Sermão')}
                </button>
                <Link to="/admin/sermoes" className="btn-back">Voltar para a Lista</Link>
            </form>
        </div>
    );
}

export default SermonForm;