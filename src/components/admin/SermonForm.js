// src/components/admin/SermonForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Form.css'; // CSS geral para formulários admin

function SermonForm() {
    const [title, setTitle] = useState('');
    const [bibleReference, setBibleReference] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
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
                    const response = await axios.get(`http://localhost:3001/api/sermons/${id}`, config);
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
            date, // Enviar a data como string YYYY-MM-DD para o backend está ok
            description,
            content,
            audioUrl,
            videoUrl,
            pdfUrl,
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
                await axios.patch(`http://localhost:3001/api/sermons/${id}`, sermonData, config);
                setSuccess('Sermão atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:3001/api/sermons', sermonData, config);
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
                    <label htmlFor="pdfUrl">URL do PDF:</label>
                    <input
                        type="url"
                        id="pdfUrl"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
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