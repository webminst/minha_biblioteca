jest.mock('../../models/Study', () => jest.fn());
const Study = require('../../models/Study');
const StudyService = require('../../services/StudyService');
const { AppError } = require('../../middleware/errorHandler');
// Métodos estáticos mockados
Study.findOne = jest.fn();
Study.findById = jest.fn();
Study.findByIdAndUpdate = jest.fn();
Study.findByIdAndDelete = jest.fn();

describe('StudyService - Métodos de criação, atualização e deleção', () => {
  afterEach(() => jest.clearAllMocks());

  it('deve criar um novo estudo', async () => {
    const mockStudyData = { title: 'Novo Estudo', theme: 'Graça', biblicalReference: 'Efésios 2:8' };
    const mockUserId = 'user123';
    Study.findOne.mockResolvedValue(null); // Não existe duplicado
    const mockSave = jest.fn().mockResolvedValue({ ...mockStudyData, reference: 'Efésios 2:8', _id: 'id123', createdBy: mockUserId });
    Study.mockImplementation(() => ({ save: mockSave }));
    const result = await StudyService.create(mockStudyData, mockUserId);
    expect(result.title).toBe('Novo Estudo');
    expect(result.theme).toBe('Graça');
    expect(result.reference).toBe('Efésios 2:8');
    expect(result.createdBy).toBe(mockUserId);
    expect(mockSave).toHaveBeenCalled();
  });

  it('deve lançar erro ao criar estudo duplicado', async () => {
    const mockStudyData = { title: 'Duplicado', theme: 'Graça', biblicalReference: 'Efésios 2:8' };
    const mockUserId = 'user123';
    Study.findOne.mockResolvedValue({ title: 'Duplicado', theme: 'Graça' });
    await expect(StudyService.create(mockStudyData, mockUserId)).rejects.toThrow(AppError);
  });

  it('deve atualizar um estudo existente', async () => {
    const mockId = 'id123';
    const mockUserId = 'user123';
    const mockStudy = { _id: mockId, title: 'Antigo', theme: 'Graça' };
    Study.findById.mockResolvedValue(mockStudy);
    Study.findOne.mockResolvedValue(null); // Não existe duplicado
    Study.findByIdAndUpdate.mockResolvedValue({ ...mockStudy, title: 'Atualizado', updatedBy: mockUserId });
    const result = await StudyService.update(mockId, { title: 'Atualizado', theme: 'Graça' }, mockUserId);
    expect(result.title).toBe('Atualizado');
    expect(result.updatedBy).toBe(mockUserId);
  });

  it('deve lançar erro ao atualizar estudo inexistente', async () => {
    Study.findById.mockResolvedValue(null);
    await expect(StudyService.update('notfound', { title: 'Novo', theme: 'Graça' }, 'user123')).rejects.toThrow(AppError);
  });

  it('deve deletar um estudo existente', async () => {
    const mockId = 'id123';
    const mockStudy = { _id: mockId, title: 'Estudo', theme: 'Graça' };
    Study.findById.mockResolvedValue(mockStudy);
    Study.findByIdAndDelete.mockResolvedValue(mockStudy);
    const result = await StudyService.delete(mockId);
    expect(result.message).toBe('Estudo excluído com sucesso');
    expect(result.deletedStudy._id).toBe(mockId);
  });

  it('deve lançar erro ao deletar estudo inexistente', async () => {
    Study.findById.mockResolvedValue(null);
    await expect(StudyService.delete('notfound')).rejects.toThrow(AppError);
  });
});
