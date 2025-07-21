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
        
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            // Preparar os dados do formulário
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            const studyData = {
                title: title.trim(),
                theme: theme.trim(),
                format: format.trim(),
                biblicalReference: biblicalReference.trim(),
                series: series ? series.trim() : undefined,
                tags: tagsArray,
                speaker: speaker ? speaker.trim() : undefined,
                date: date || undefined,
                local: local ? local.trim() : undefined,
                description: description ? description.trim() : undefined,
                content: content.trim(),
                audioUrl: audioUrl ? audioUrl.trim() : undefined,
                videoUrl: videoUrl ? videoUrl.trim() : undefined,
                pdfUrl: pdfUrl ? pdfUrl.trim() : undefined,
                type: type || 'Temático',
            };

            console.log('Enviando dados para a API:', studyData);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            if (isEditing) {
                console.log(`Atualizando estudo com ID: ${id}`);
                const response = await axios.patch(
                    API_ENDPOINTS.STUDIES.BY_ID(id), 
                    studyData, 
                    config
                );
                
                console.log('Resposta da API (atualização):', response.data);
                setSuccess('Estudo atualizado com sucesso!');
            } else {
                console.log('Criando novo estudo');
                const response = await axios.post(
                    API_ENDPOINTS.STUDIES.BASE, 
                    studyData, 
                    config
                );
                
                console.log('Resposta da API (criação):', response.data);
                setSuccess('Estudo criado com sucesso!');
                
                // Limpar o formulário apenas em caso de criação bem-sucedida
                setTitle('');
                setTheme('');
                setFormat('Estudo');
                setBiblicalReference('');
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
            
            // Redireciona após 1.5 segundos para mostrar a mensagem de sucesso
            setTimeout(() => {
                navigate('/admin/estudos');
            }, 1500);
            
        } catch (err) {
            console.error('Erro ao salvar estudo:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                statusText: err.response?.statusText,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data
                }
            });
            
            const errorMessage = err.response?.data?.message || 
                             err.response?.data?.error || 
                             err.message || 
                             'Ocorreu um erro ao salvar o estudo. Tente novamente mais tarde.';
            
            setError(`Erro ao salvar estudo: ${errorMessage}`);
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