import { CreateBookDTO } from '../../dto/books/BookDTO';

describe('CreateBookDTO', () => {
  it('valida dados válidos corretamente', () => {
    const dto = new CreateBookDTO({
      title: 'Livro Teste',
      author: 'Autor Teste',
      publisher: 'Editora',
      description: 'Descrição válida com mais de 10 caracteres.',
      summary: 'Este é um resumo válido que possui mais de cinquenta caracteres para passar na validação do DTO.',
      keyPoints: ['Ponto 1', 'Ponto 2'],
      publicationYear: 2020,
    });
    const result = dto.validate();
    expect(result.isValid).toBe(true);
    expect(result.data.title).toBe('Livro Teste');
  });

  it('retorna erros para campos obrigatórios ausentes', () => {
    const dto = new CreateBookDTO({});
    const result = dto.validate();
    expect(result.isValid).toBe(false);
    const fields = result.errors.map(e => e.field);
    expect(fields).toContain('title');
    expect(fields).toContain('author');
    expect(fields).toContain('description');
    expect(fields).toContain('summary');
  });

  it('valida limites de tamanho dos campos', () => {
    const dto = new CreateBookDTO({
      title: 'A',
      author: 'B',
      description: 'Curto',
      summary: 'Pequeno',
    });
    const result = dto.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'title')).toBe(true);
    expect(result.errors.some(e => e.field === 'author')).toBe(true);
    expect(result.errors.some(e => e.field === 'description')).toBe(true);
    expect(result.errors.some(e => e.field === 'summary')).toBe(true);
  });
});
