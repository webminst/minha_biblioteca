// src/components/admin/SermonFormFields.js
import PropTypes from 'prop-types';

function handleInputChange(setter) {
    return function (e) {
        setter(e.target.value);
    };
}

function SermonFormFields({
    title, setTitle,
    bibleReference, setBibleReference,
    book, setBook,
    series, setSeries,
    date, setDate,
    description, setDescription,
    content, setContent,
    audioUrl, setAudioUrl,
    videoUrl, setVideoUrl,
    pdfUrl, setPdfUrl,
    tags, setTags,
    speaker, setSpeaker,
    local, setLocal,
    loading,
}) {
    return (
        <>
            <div className='form-group'>
                <label htmlFor='title'>Título:</label>
                <input type='text' id='title' value={title} onChange={handleInputChange(setTitle)} required disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='bibleReference'>Referência Bíblica:</label>
                <input type='text' id='bibleReference' value={bibleReference} onChange={handleInputChange(setBibleReference)} required disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='description'>Descrição (Resumo):</label>
                <textarea id='description' value={description} onChange={handleInputChange(setDescription)} rows='3' disabled={loading}></textarea>
            </div>
            <div className='form-group'>
                <label htmlFor='content'>Conteúdo (Markdown):</label>
                <textarea id='content' value={content} onChange={handleInputChange(setContent)} rows='10' disabled={loading}></textarea>
                <small>Use sintaxe Markdown para formatação (negrito, itálico, listas, etc.).</small>
            </div>
            <div className='form-group'>
                <label htmlFor='pdfUrl'>URL do PDF:</label>
                <input type='url' id='pdfUrl' value={pdfUrl} onChange={handleInputChange(setPdfUrl)} disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='audioUrl'>URL do Áudio:</label>
                <input type='url' id='audioUrl' value={audioUrl} onChange={handleInputChange(setAudioUrl)} disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='videoUrl'>URL do Vídeo:</label>
                <input type='url' id='videoUrl' value={videoUrl} onChange={handleInputChange(setVideoUrl)} disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='tags'>Tags (separadas por vírgula):</label>
                <input type='text' id='tags' value={tags} onChange={handleInputChange(setTags)} disabled={loading} placeholder='Ex: Fé, Graça, Esperança' />
            </div>
            <div className='form-group'>
                <label htmlFor='speaker'>Pregador:</label>
                <input type='text' id='speaker' value={speaker} onChange={handleInputChange(setSpeaker)} disabled={loading} placeholder='Nome do pregador' />
            </div>
            <div className='form-group'>
                <label htmlFor='local'>Local:</label>
                <input type='text' id='local' value={local} onChange={handleInputChange(setLocal)} disabled={loading} placeholder='Local do sermão' />
            </div>
            <div className='form-group'>
                <label htmlFor='date'>Data:</label>
                <input type='date' id='date' value={date} onChange={handleInputChange(setDate)} disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='book'>Livro:</label>
                <input type='text' id='book' value={book} onChange={handleInputChange(setBook)} disabled={loading} />
            </div>
            <div className='form-group'>
                <label htmlFor='series'>Série:</label>
                <input type='text' id='series' value={series} onChange={handleInputChange(setSeries)} disabled={loading} />
            </div>
        </>
    );
}

SermonFormFields.propTypes = {
    title: PropTypes.string.isRequired,
    setTitle: PropTypes.func.isRequired,
    bibleReference: PropTypes.string.isRequired,
    setBibleReference: PropTypes.func.isRequired,
    book: PropTypes.string.isRequired,
    setBook: PropTypes.func.isRequired,
    series: PropTypes.string.isRequired,
    setSeries: PropTypes.func.isRequired,
    date: PropTypes.string.isRequired,
    setDate: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    setDescription: PropTypes.func.isRequired,
    content: PropTypes.string.isRequired,
    setContent: PropTypes.func.isRequired,
    audioUrl: PropTypes.string.isRequired,
    setAudioUrl: PropTypes.func.isRequired,
    videoUrl: PropTypes.string.isRequired,
    setVideoUrl: PropTypes.func.isRequired,
    pdfUrl: PropTypes.string.isRequired,
    setPdfUrl: PropTypes.func.isRequired,
    tags: PropTypes.string.isRequired,
    setTags: PropTypes.func.isRequired,
    speaker: PropTypes.string.isRequired,
    setSpeaker: PropTypes.func.isRequired,
    local: PropTypes.string.isRequired,
    setLocal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default SermonFormFields;
