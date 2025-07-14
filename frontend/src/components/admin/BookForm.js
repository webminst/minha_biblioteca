// src/components/admin/BookForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { extractBooks } from '../../utils/apiResponseHelpers';
import './Form.css'; // Reutiliza o CSS geral de formulários admin

function BookForm() {
    // Estados para os campos do formulário, baseados no seu BookSchema
    const [title, setTitle] = useState('');
    const [series, setSeries] = useState('');
    const [tags, setTags] = useState(''); // Armazenado como string e convertido para array
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');
    const [local, setLocal] = useState('');
    const [area, setArea] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams(); // Pega o ID da URL se estiver em modo de edição

    const isEditing = !!id; // Verdadeiro se um ID estiver presente na URL

    useEffect(() => {
        // Se estiver no modo de edição, busca os dados do livro para preencher o formulário
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
                    const response = await axios.get(API_ENDPOINTS.BOOKS.BY_ID(id), config);
                    // Extrai dados usando helper com compatibilidade DTO
                    const bookData = extractBooks([response.data])[0] || (response.data.success ? response.data.data : response.data);

                    // Preenche os estados com os dados do livro
                    setTitle(bookData.title || '');
                    setSeries(bookData.series || '');
                    setTags(bookData.tags ? bookData.tags.join(', ') : ''); // Converte array para string
                    setAuthor(bookData.author || '');
                    setDate(bookData.date ? new Date(bookData.date).toISOString().split('T')[0] : '');
                    setLocal(bookData.local || '');
                    setArea(bookData.area || '');
                    setDescription(bookData.description || '');
                    setContent(bookData.content || '');
                    setAudioUrl(bookData.audioUrl || '');
                    setVideoUrl(bookData.videoUrl || '');
                    setImageUrl(bookData.imageUrl || '');
                    setPdfUrl(bookData.pdfUrl || '');
                } catch (err) {
                    setError('Erro ao carregar dados do livro: ' + (err.response?.data?.message || err.message));
                    console.error('Erro ao buscar livro para edição:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBook();
        }
    }, [id, isEditing]); // Dependências do useEffect

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Converte a string de tags de volta para um array para enviar ao backend
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const bookData = {
            title,
            series,
            tags: tagsArray, // Envia como array
            author,
            date,
            local,
            area,
            description,
            content,
            audioUrl,
            videoUrl,
            imageUrl,
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
                await axios.patch(API_ENDPOINTS.BOOKS.BY_ID(id), bookData, config);
                setSuccess('Livro atualizado com sucesso!');
            } else {
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
            setError('Erro ao salvar livro: ' + (err.response?.data?.message || err.message));
            console.error('Erro ao salvar livro:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Carregando dados do livro...</p>;

    return (
        <div className="form-container">
            <h2>{isEditing ? 'Editar Livro' : 'Novo Livro'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="form-group">
                    <label htmlFor="title">Título:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Autor (opcional):</label>
                    <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="series">Série (opcional):</label>
                    <input type="text" id="series" value={series} onChange={(e) => setSeries(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="area">Área (opcional):</label>
                    <input type="text" id="area" value={area} onChange={(e) => setArea(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição/Sinopse (opcional):</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={loading}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Conteúdo (resumo/trecho em Markdown, opcional):</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10" disabled={loading}></textarea>
                    <small>Use sintaxe Markdown para formatação.</small>
                </div>

                <div className="form-group">
                    <label htmlFor="pdfUrl">URL do PDF (e-book, opcional):</label>
                    <input type="url" id="pdfUrl" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="audioUrl">URL do Áudio Livro (opcional):</label>
                    <input type="url" id="audioUrl" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="videoUrl">URL do Vídeo (resenha/trailer, opcional):</label>
                    <input type="url" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">URL da Imagem da Capa (opcional):</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags (separar por vírgula, opcional):</label>
                    <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} disabled={loading} />
                    <small>Ex: "ficção, teologia, biografia"</small>
                </div>

                <div className="form-group">
                    <label htmlFor="date">Data de Publicação (opcional):</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="local">Local de Publicação (opcional):</label>
                    <input type="text" id="local" value={local} onChange={(e) => setLocal(e.target.value)} disabled={loading} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Livro' : 'Criar Livro')}
                </button>
                <Link to="/admin/livros" className="btn-back">Voltar para a Lista</Link>
            </form>
        </div>
    );
}

export default BookForm;