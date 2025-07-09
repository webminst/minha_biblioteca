// src/components/admin/StudyForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Form.css'; // Reutiliza o CSS geral de formulários admin

function StudyForm() {
    // Estados para os campos do formulário, baseados no seu StudySchema
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [format, setFormat] = useState('');
    const [bibleReference, setBibleReference] = useState('');
    const [series, setSeries] = useState('');
    const [tags, setTags] = useState(''); // Armazenado como string e convertido para array
    const [speaker, setSpeaker] = useState('');
    const [date, setDate] = useState('');
    const [local, setLocal] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams(); // Pega o ID da URL se estiver em modo de edição

    const isEditing = !!id; // Verdadeiro se um ID estiver presente na URL

    useEffect(() => {
        // Se estiver no modo de edição, busca os dados do estudo para preencher o formulário
        if (isEditing) {
            const fetchStudy = async () => {
                setLoading(true);
                setError(null);
                try {
                    const token = localStorage.getItem('userToken');
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(`http://localhost:3002/api/studies/${id}`, config);
                    const studyData = response.data;

                    // Preenche os estados com os dados do estudo
                    setTitle(studyData.title || '');
                    setTheme(studyData.theme || '');
                    setFormat(studyData.format || '');
                    setBibleReference(studyData.bibleReference || '');
                    setSeries(studyData.series || '');
                    setTags(studyData.tags ? studyData.tags.join(', ') : ''); // Converte array para string para o input
                    setSpeaker(studyData.speaker || '');
                    setDate(studyData.date ? new Date(studyData.date).toISOString().split('T')[0] : '');
                    setLocal(studyData.local || '');
                    setDescription(studyData.description || '');
                    setContent(studyData.content || '');
                    setAudioUrl(studyData.audioUrl || '');
                    setVideoUrl(studyData.videoUrl || '');
                    setPdfUrl(studyData.pdfUrl || '');
                } catch (err) {
                    setError('Erro ao carregar dados do estudo: ' + (err.response?.data?.message || err.message));
                    console.error('Erro ao buscar estudo para edição:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudy();
        }
    }, [id, isEditing]); // Dependências do useEffect

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Converte a string de tags de volta para um array para enviar ao backend
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const studyData = {
            title,
            theme,
            format,
            bibleReference,
            series,
            tags: tagsArray, // Envia como array
            speaker,
            date,
            local,
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
                await axios.patch(`http://localhost:3002/api/studies/${id}`, studyData, config);
                setSuccess('Estudo atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:3002/api/studies', studyData, config);
                setSuccess('Estudo criado com sucesso!');
                // Limpa o formulário após a criação
                setTitle('');
                setTheme('');
                setFormat('');
                setBibleReference('');
                setSeries('');
                setTags('');
                setSpeaker('');
                setDate('');
                setLocal('');
                setDescription('');
                setContent('');
                setAudioUrl('');
                setVideoUrl('');
                setPdfUrl('');
            }
            // Opcional: redirecionar para a lista de estudos após sucesso
            navigate('/admin/estudos');
        } catch (err) {
            setError('Erro ao salvar estudo: ' + (err.response?.data?.message || err.message));
            console.error('Erro ao salvar estudo:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Carregando dados do estudo...</p>;

    return (
        <div className="form-container">
            <h2>{isEditing ? 'Editar Estudo' : 'Novo Estudo'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Campos obrigatórios */}
                <div className="form-group">
                    <label htmlFor="title">Título:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="theme">Tema:</label>
                    <input type="text" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="format">Formato:</label>
                    <input type="text" id="format" value={format} onChange={(e) => setFormat(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="bibleReference">Referência Bíblica:</label>
                    <input type="text" id="bibleReference" value={bibleReference} onChange={(e) => setBibleReference(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Conteúdo (Markdown):</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10" required disabled={loading}></textarea>
                    <small>Use sintaxe Markdown para formatação.</small>
                </div>

                {/* Campos opcionais */}
                <div className="form-group">
                    <label htmlFor="series">Série (opcional):</label>
                    <input type="text" id="series" value={series} onChange={(e) => setSeries(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="tags">Tags (separar por vírgula, opcional):</label>
                    <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} disabled={loading} />
                    <small>Ex: "oração, fé, discipulado"</small>
                </div>
                <div className="form-group">
                    <label htmlFor="speaker">Ministrante (opcional, padrão: 'Giovanni Guimarães'):</label>
                    <input type="text" id="speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="date">Data (opcional):</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="local">Local (opcional):</label>
                    <input type="text" id="local" value={local} onChange={(e) => setLocal(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Descrição/Resumo (opcional):</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={loading}></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="audioUrl">URL do Áudio (opcional):</label>
                    <input type="url" id="audioUrl" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="videoUrl">URL do Vídeo (opcional):</label>
                    <input type="url" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="pdfUrl">URL do PDF (opcional):</label>
                    <input type="url" id="pdfUrl" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} disabled={loading} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Estudo' : 'Criar Estudo')}
                </button>
                <Link to="/admin/estudos" className="btn-back">Voltar para a Lista</Link>
            </form>
        </div>
    );
}

export default StudyForm;