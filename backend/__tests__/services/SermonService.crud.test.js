jest.mock('../../models/Sermon', () => jest.fn());
const Sermon = require('../../models/Sermon');
const SermonService = require('../../services/SermonService');
const { AppError } = require('../../middleware/errorHandler');
// Métodos estáticos mockados
Sermon.findOne = jest.fn();
Sermon.findById = jest.fn();
Sermon.findByIdAndUpdate = jest.fn();
Sermon.findByIdAndDelete = jest.fn();

describe('SermonService - Métodos de criação, atualização e deleção', () => {
  afterEach(() => jest.clearAllMocks());

  it('deve criar um novo sermão', async () => {
    const mockSermonData = { title: 'Novo Sermão', bibleReference: 'João 3:16' };
    const mockUserId = 'user123';
    Sermon.findOne.mockResolvedValue(null); // Não existe duplicado
    const mockSave = jest.fn().mockResolvedValue({ ...mockSermonData, _id: 'id123', createdBy: mockUserId });
    Sermon.mockImplementation(() => ({ save: mockSave }));
    const result = await SermonService.create(mockSermonData, mockUserId);
    expect(result.title).toBe('Novo Sermão');
    expect(result.bibleReference).toBe('João 3:16');
    expect(result.createdBy).toBe(mockUserId);
    expect(mockSave).toHaveBeenCalled();
  });

  it('deve lançar erro ao criar sermão duplicado', async () => {
    const mockSermonData = { title: 'Duplicado', bibleReference: 'João 3:16' };
    const mockUserId = 'user123';
    Sermon.findOne.mockResolvedValue({ title: 'Duplicado', bibleReference: 'João 3:16' });
    await expect(SermonService.create(mockSermonData, mockUserId)).rejects.toThrow(AppError);
  });

  it('deve atualizar um sermão existente', async () => {
    const mockId = 'id123';
    const mockUserId = 'user123';
    const mockSermon = { _id: mockId, title: 'Antigo', bibleReference: 'João 3:16' };
    Sermon.findById.mockResolvedValue(mockSermon);
    Sermon.findOne.mockResolvedValue(null); // Não existe duplicado
    Sermon.findByIdAndUpdate.mockResolvedValue({ ...mockSermon, title: 'Atualizado', updatedBy: mockUserId });
    const result = await SermonService.update(mockId, { title: 'Atualizado', bibleReference: 'João 3:16' }, mockUserId);
    expect(result.title).toBe('Atualizado');
    expect(result.updatedBy).toBe(mockUserId);
  });

  it('deve lançar erro ao atualizar sermão inexistente', async () => {
    Sermon.findById.mockResolvedValue(null);
    await expect(SermonService.update('notfound', { title: 'Novo', bibleReference: 'João 3:16' }, 'user123')).rejects.toThrow(AppError);
  });

  it('deve deletar um sermão existente', async () => {
    const mockId = 'id123';
    const mockSermon = { _id: mockId, title: 'Sermão', bibleReference: 'João 3:16' };
    Sermon.findById.mockResolvedValue(mockSermon);
    Sermon.findByIdAndDelete.mockResolvedValue(mockSermon);
    const result = await SermonService.delete(mockId);
    expect(result.message).toBe('Sermão excluído com sucesso');
    expect(result.deletedSermon._id).toBe(mockId);
  });

  it('deve lançar erro ao deletar sermão inexistente', async () => {
    Sermon.findById.mockResolvedValue(null);
    await expect(SermonService.delete('notfound')).rejects.toThrow(AppError);
  });
});
