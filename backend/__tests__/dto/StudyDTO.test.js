const { CreateStudyDTO } = require('../../dto/studies/StudyDTO');

describe('CreateStudyDTO', () => {
    it('valida dados válidos corretamente', () => {
        const dto = new CreateStudyDTO({
            title: 'Estudo Teste',
            biblicalReference: 'Efésios 2:8',
            book: 'Efésios',
            chapter: 2,
            startVerse: 8,
            endVerse: 10,
            theme: 'Graça',
            format: 'Estudo',
            content: 'Conteúdo do estudo com mais de 100 caracteres para passar na validação do DTO. '.repeat(2),
            sections: [
                { title: 'Seção 1', content: 'Conteúdo da seção com mais de 10 caracteres.' }
            ],
            questions: [
                { question: 'Pergunta de reflexão com mais de 10 caracteres?', type: 'reflexão' }
            ],
            type: 'Temático'
        });
        const result = dto.validate();
        expect(result.isValid).toBe(true);
        expect(result.data.title).toBe('Estudo Teste');
    });

    it('retorna erros para campos obrigatórios ausentes', () => {
        const dto = new CreateStudyDTO({});
        const result = dto.validate();
        expect(result.isValid).toBe(false);
        const fields = result.errors.map(e => e.field);
        expect(fields).toContain('title');
        expect(fields).toContain('biblicalReference');
        expect(fields).toContain('content');
    });

    it('valida limites de tamanho dos campos', () => {
        const dto = new CreateStudyDTO({
            title: 'A',
            biblicalReference: 'B',
            description: 'Curto',
            content: 'Pequeno'
        });
        const result = dto.validate();
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'title')).toBe(true);
        expect(result.errors.some(e => e.field === 'biblicalReference')).toBe(true);
        expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });
});
