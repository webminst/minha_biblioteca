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
    const areaOptions = [
        'Teologia Sistemática',
        'Teologia Bíblica',
        'Comentários Bíblicos',
        'Vida Cristã',
        'Apologética',
        'História da Igreja',
        'Biografias',
        'Devocionais',
        'Outros'
    ];

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
                    // Para endpoints BY_ID, o dado vem diretamente em response.data.data
                    const bookData = response.data.success ? response.data.data : response.data;

                    // Preenche os estados com os dados do livro
                    setTitle(bookData.title || '');
                    setSeries(bookData.series || '');
                    setTags(bookData.tags ? bookData.tags.join(', ') : ''); // Converte array para string
                    setAuthor(bookData.author || '');
                    setDate(bookData.date ? new Date(bookData.date).toISOString().split('T')[0] : '');
                    setLocal(bookData.local || '');
                    // Log para depuração do valor retornado pelo backend
                    console.log('Valor retornado de bookData.area:', bookData.area);
                    let areaValue = typeof bookData.area === 'string' ? bookData.area : '';
                    // Garante que o valor está entre as opções válidas
                    if (!areaOptions.includes(areaValue)) {
                        console.warn('Área recebida não está entre as opções válidas:', areaValue);
                        areaValue = '';
                    }
                    setArea(areaValue);
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

        // Validação do tamanho máximo do conteúdo (igual ao backend)
        const MAX_SUMMARY_LENGTH = 20000;
        if (content && content.length > MAX_SUMMARY_LENGTH) {
            setError(`O resumo não pode ter mais de ${MAX_SUMMARY_LENGTH} caracteres. Atualmente tem ${content.length} caracteres.`);
            setLoading(false);
            return;
        }

        // Verifica se o usuário está autenticado
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
            summary: content || undefined,
            area: area || undefined,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : undefined,
            series: series || undefined,
            imageUrl: imageUrl || undefined,
            pdfUrl: pdfUrl || undefined,
            videoUrl: videoUrl || undefined,
            audioUrl: audioUrl || undefined,
            // Inclui apenas os campos que têm valor
        };

        // Remove campos undefined do objeto
        Object.keys(bookData).forEach(key => {
            if (bookData[key] === undefined) {
                delete bookData[key];
            }
        });

        try {
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
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error?.message ||
                err.response?.data?.error ||
                err.message ||
                'Erro ao processar a requisição';

            setError(`Erro ao salvar livro: ${errorMessage}`);

            // Log detalhado no console para depuração
            console.error('Erro detalhado:', {
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

            // Se o token estiver inválido, redireciona para o login
            if (err.response?.status === 401) {
                localStorage.removeItem('userToken');
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };


    if (loading && isEditing && !error) return <p>Carregando dados do livro...</p>;
    // Se houver erro, mostra o formulário com a mensagem de erro

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
                    <label htmlFor="area">Área:</label>
                    <select id="area" value={area} onChange={e => setArea(e.target.value)} disabled={loading} required>
                        <option value="">Selecione uma área</option>
                        {areaOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição/Sinopse (opcional):</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={loading}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Conteúdo (resumo/trecho em Markdown, opcional):</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="10"
                        disabled={loading}
                        maxLength={10000}
                    ></textarea>
                    <div className="character-count">
                        {content.length}/10000 caracteres
                    </div>
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