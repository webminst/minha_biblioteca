const { CreateSermonDTO } = require('../../dto/sermons/SermonDTO');

describe('CreateSermonDTO', () => {
  it('valida dados válidos corretamente', () => {
    const dto = new CreateSermonDTO({
      title: 'Sermão Teste',
      speaker: 'Pr. João',
      biblicalReference: 'João 3:16',
      book: 'João',
      chapter: 3,
      startVerse: 16,
      endVerse: 17,
      summary: 'Resumo válido com mais de vinte caracteres.',
      content: 'Conteúdo do sermão com mais de 100 caracteres para passar na validação do DTO. '.repeat(2),
      outline: [
        { point: 'Introdução', subPoints: ['Sub 1'], scripture: 'João 3:16' },
      ],
      date: '2023-07-27',
      tags: ['fé', 'vida'],
      series: 'Série de Teste',
    });
    const result = dto.validate();
    expect(result.isValid).toBe(true);
    expect(result.data.title).toBe('Sermão Teste');
  });

  it('retorna erros para campos obrigatórios ausentes', () => {
    const dto = new CreateSermonDTO({});
    const result = dto.validate();
    expect(result.isValid).toBe(false);
    const fields = result.errors.map(e => e.field);
    expect(fields).toContain('title');
    expect(fields).toContain('biblicalReference');
    expect(fields).toContain('content');
  });

  it('valida limites de tamanho dos campos', () => {
    const dto = new CreateSermonDTO({
      title: 'A',
      biblicalReference: 'B',
      description: 'Curto',
      content: 'Pequeno',
    });
    const result = dto.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'title')).toBe(true);
    expect(result.errors.some(e => e.field === 'biblicalReference')).toBe(true);
    expect(result.errors.some(e => e.field === 'content')).toBe(true);
  });
});
