// src/components/admin/StudyForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { extractStudies } from '../../utils/apiResponseHelpers';

function StudyForm() {
    // Estados para os campos do formulário, baseados no seu StudySchema
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [format, setFormat] = useState('Estudo');
    const formatOptions = [
        'Estudo',
        'Palestra',
        'Conferência',
        'Outros'
    ];
    const [biblicalReference, setBiblicalReference] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [application, setApplication] = useState('');
    const [series, setSeries] = useState('');
    const [tags, setTags] = useState('');
    const [speaker, setSpeaker] = useState('Giovanni Guimarães');
    const [date, setDate] = useState('');
    const [local, setLocal] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [type, setType] = useState('Temático');
    const studyTypeOptions = [
        'Exegético',
        'Temático',
        'Devocional',
        'Doutrinário',
        'Biográfico',
        'Profético',
        'Apologético',
        'Histórico',
        'Prático',
        'Missionário',
        'Evangelístico',
        'Outros'
    ];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    useEffect(() => {
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
                    const response = await axios.get(API_ENDPOINTS.STUDIES.BY_ID(id), config);
                    const studyData = response.data.success ? response.data.data : response.data;
                    setTitle(studyData.title || '');
                    setTheme(studyData.theme || '');
                    setFormat(studyData.format || 'Estudo');
                    setBiblicalReference(studyData.biblicalReference || '');
                    setIntroduction(studyData.introduction || '');
                    setApplication(studyData.application || '');
                    setSeries(studyData.series || '');
                    setTags(studyData.tags ? studyData.tags.join(', ') : '');
                    setSpeaker(studyData.speaker || '');
                    setDate(studyData.date ? new Date(studyData.date).toISOString().split('T')[0] : '');
                    setLocal(studyData.local || '');
                    setDescription(studyData.description || '');
                    setContent(studyData.content || '');
                    setAudioUrl(studyData.audioUrl || '');
                    setVideoUrl(studyData.videoUrl || '');
                    setPdfUrl(studyData.pdfUrl || '');
                    setType(studyData.type || 'Temático');
                } catch (err) {
                    setError('Erro ao carregar dados do estudo: ' + (err.response?.data?.message || err.message));
                    console.error('Erro ao buscar estudo para edição:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudy();
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const studyData = {
            title,
            theme,
            format,
            biblicalReference,
            series,
            tags: tagsArray,
            speaker,
            date,
            local,
            description,
            content,
            introduction,
            application,
            audioUrl,
            videoUrl,
            pdfUrl,
            type,
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
                await axios.patch(API_ENDPOINTS.STUDIES.BY_ID(id), studyData, config);
                setSuccess('Estudo atualizado com sucesso!');
            } else {
                await axios.post(API_ENDPOINTS.STUDIES.BASE, studyData, config);
                setSuccess('Estudo criado com sucesso!');
                setTitle('');
                setTheme('');
                setFormat('Estudo');
                setBiblicalReference('');
                setIntroduction('');
                setApplication('');
                setSeries('');
                setTags('');
                setSpeaker('Giovanni Guimarães');
                setDate('');
                setLocal('');
                setDescription('');
                setContent('');
                setAudioUrl('');
                setVideoUrl('');
                setPdfUrl('');
                setType('Temático');
            }
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

                <div className="form-group">
                    <label htmlFor="title">Título:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="biblicalReference">Referência Bíblica:</label>
                    <input type="text" id="biblicalReference" value={biblicalReference} onChange={(e) => setBiblicalReference(e.target.value)} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="introduction">Introdução:</label>
                    <textarea id="introduction" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows="4" required disabled={loading}></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="application">Aplicação Prática:</label>
                    <textarea id="application" value={application} onChange={(e) => setApplication(e.target.value)} rows="3" required disabled={loading}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="series">Série (opcional):</label>
                    <input type="text" id="series" value={series} onChange={(e) => setSeries(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="theme">Tema:</label>
                    <input type="text" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição/Resumo (opcional):</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={loading}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Conteúdo (Markdown):</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10" required disabled={loading}></textarea>
                    <small>Use sintaxe Markdown para formatação.</small>
                </div>

                <div className="form-group">
                    <label htmlFor="pdfUrl">URL do PDF (opcional):</label>
                    <input type="url" id="pdfUrl" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="audioUrl">URL do Áudio (opcional):</label>
                    <input type="url" id="audioUrl" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="videoUrl">URL do Vídeo (opcional):</label>
                    <input type="url" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: 16 }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 0 }}>
                        <label htmlFor="type">Tipo de Estudo:</label>
                        <select
                            id="type"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            required
                            disabled={loading}
                        >
                            {studyTypeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: 0 }}>
                        <label htmlFor="format">Formato:</label>
                        <select
                            id="format"
                            value={format}
                            onChange={e => setFormat(e.target.value)}
                            required
                            disabled={loading}
                        >
                            {formatOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
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

                <button type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Estudo' : 'Criar Estudo')}
                </button>
                <Link to="/admin/estudos" className="btn-back">Voltar para a Lista</Link>
            </form>
        </div>
    );
}

export default StudyForm;