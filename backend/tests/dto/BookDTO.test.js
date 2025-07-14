// tests/dto/BookDTO.test.js
/**
 * EXEMPLO: Testes para DTOs
 * Demonstra como testar validação e transformação de dados
 */

const {
    CreateBookDTO,
    UpdateBookDTO,
    BookResponseDTO,
    BookSearchDTO
} = require('../../dto');

describe('BookDTO Tests', () => {

    describe('CreateBookDTO', () => {
        const validBookData = {
            title: 'Teologia Sistemática',
            author: 'Wayne Grudem',
            publisher: 'Vida Nova',
            area: 'Teologia Sistemática',
            description: 'Um livro abrangente sobre teologia sistemática cristã.',
            summary: 'Este livro oferece uma visão completa e acessível da teologia cristã, cobrindo temas desde a doutrina de Deus até a escatologia.',
            tags: ['teologia', 'doutrina', 'estudo'],
            publicationYear: 2010,
            personalRating: 5,
            difficulty: 'Intermediário'
        };

        test('deve validar dados válidos com sucesso', () => {
            const result = CreateBookDTO.validateAndCreate(validBookData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.errors).toBeUndefined();
        });

        test('deve rejeitar título muito curto', () => {
            const invalidData = { ...validBookData, title: 'A' };
            const result = CreateBookDTO.validateAndCreate(invalidData);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors.some(e => e.field === 'title')).toBe(true);
        });

        test('deve rejeitar descrição vazia', () => {
            const invalidData = { ...validBookData, description: '' };
            const result = CreateBookDTO.validateAndCreate(invalidData);

            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'description')).toBe(true);
        });

        test('deve normalizar tags (remover duplicatas e converter para lowercase)', () => {
            const dataWithDuplicateTags = {
                ...validBookData,
                tags: ['TEOLOGIA', 'teologia', 'Doutrina', 'doutrina', 'Estudo']
            };

            const dto = new CreateBookDTO(dataWithDuplicateTags);
            dto.validate();
            const transformed = dto.transform();

            expect(transformed.tags).toEqual(['teologia', 'doutrina', 'estudo']);
        });

        test('deve validar ano de publicação dentro do range', () => {
            const futureYear = { ...validBookData, publicationYear: 2030 };
            const result = CreateBookDTO.validateAndCreate(futureYear);

            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'publicationYear')).toBe(true);
        });

        test('deve aceitar rating válido (1-5)', () => {
            const ratings = [1, 2, 3, 4, 5];

            ratings.forEach(rating => {
                const data = { ...validBookData, personalRating: rating };
                const result = CreateBookDTO.validateAndCreate(data);
                expect(result.success).toBe(true);
            });
        });

        test('deve rejeitar rating inválido', () => {
            const invalidRating = { ...validBookData, personalRating: 6 };
            const result = CreateBookDTO.validateAndCreate(invalidRating);

            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'personalRating')).toBe(true);
        });

        test('deve validar área específica', () => {
            const validAreas = [
                'Teologia Sistemática',
                'Teologia Bíblica',
                'Comentários Bíblicos',
                'Vida Cristã',
                'Apologética'
            ];

            validAreas.forEach(area => {
                const data = { ...validBookData, area };
                const result = CreateBookDTO.validateAndCreate(data);
                expect(result.success).toBe(true);
            });
        });

        test('deve rejeitar área inválida', () => {
            const invalidArea = { ...validBookData, area: 'Área Inexistente' };
            const result = CreateBookDTO.validateAndCreate(invalidArea);

            expect(result.success).toBe(false);
        });

        test('deve validar links de compra', () => {
            const dataWithLinks = {
                ...validBookData,
                purchaseLinks: [
                    {
                        store: 'Amazon',
                        url: 'https://amazon.com.br/livro',
                        price: 89.90
                    },
                    {
                        store: 'Vida Nova',
                        url: 'https://vidanova.com.br/livro'
                    }
                ]
            };

            const result = CreateBookDTO.validateAndCreate(dataWithLinks);
            expect(result.success).toBe(true);
        });

        test('deve rejeitar URL inválida nos links', () => {
            const dataWithInvalidUrl = {
                ...validBookData,
                purchaseLinks: [
                    {
                        store: 'Amazon',
                        url: 'url-invalida',
                        price: 89.90
                    }
                ]
            };

            const result = CreateBookDTO.validateAndCreate(dataWithInvalidUrl);
            expect(result.success).toBe(false);
        });
    });

    describe('UpdateBookDTO', () => {
        test('deve aceitar atualização parcial', () => {
            const partialUpdate = {
                title: 'Novo Título',
                personalRating: 4
            };

            const result = UpdateBookDTO.validateAndCreate(partialUpdate);
            expect(result.success).toBe(true);
            expect(result.data.title).toBe('Novo Título');
            expect(result.data.personalRating).toBe(4);
        });

        test('deve rejeitar objeto vazio', () => {
            const result = UpdateBookDTO.validateAndCreate({});
            expect(result.success).toBe(false);
        });

        test('deve aplicar mesmas validações do CreateBookDTO', () => {
            const invalidUpdate = {
                title: 'A', // muito curto
                personalRating: 10 // muito alto
            };

            const result = UpdateBookDTO.validateAndCreate(invalidUpdate);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('BookResponseDTO', () => {
        const mockBookData = {
            _id: '507f1f77bcf86cd799439011',
            title: 'Teologia Sistemática',
            author: 'Wayne Grudem',
            description: 'Descrição do livro',
            summary: 'Resumo do livro',
            tags: ['teologia', 'doutrina'],
            views: 150,
            likes: 25,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15'),
            isPublished: true,
            featured: false
        };

        test('deve transformar dados para formato público', () => {
            const dto = new BookResponseDTO(mockBookData);
            const publicData = dto.toPublicObject();

            expect(publicData.id).toBe(mockBookData._id);
            expect(publicData.title).toBe(mockBookData.title);
            expect(publicData.views).toBe(150);
            expect(publicData.likes).toBe(25);
        });

        test('deve criar versão resumida para listagens', () => {
            const dto = new BookResponseDTO(mockBookData);
            const summaryData = dto.toSummaryObject();

            expect(summaryData.id).toBe(mockBookData._id);
            expect(summaryData.title).toBe(mockBookData.title);
            expect(summaryData.tags).toHaveLength(2); // Máximo 3 tags na versão resumida
            expect(summaryData.description).toMatch(/\.\.\.$/); // Descrição truncada
        });

        test('deve lidar com campos opcionais nulos', () => {
            const dataWithNulls = {
                ...mockBookData,
                publisher: null,
                area: null,
                personalRating: null
            };

            const dto = new BookResponseDTO(dataWithNulls);
            const publicData = dto.toPublicObject();

            expect(publicData.publisher).toBeNull();
            expect(publicData.area).toBeNull();
            expect(publicData.personalRating).toBeNull();
        });
    });

    describe('BookSearchDTO', () => {
        test('deve validar parâmetros de busca válidos', () => {
            const searchParams = {
                search: 'teologia',
                author: 'Wayne Grudem',
                area: 'Teologia Sistemática',
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                featured: true,
                minRating: 3,
                maxRating: 5
            };

            const result = BookSearchDTO.validateAndCreate(searchParams);
            expect(result.success).toBe(true);
        });

        test('deve aplicar valores padrão', () => {
            const minimalSearch = { search: 'teologia' };
            const result = BookSearchDTO.validateAndCreate(minimalSearch);

            expect(result.success).toBe(true);
            expect(result.data.page).toBe(1);
            expect(result.data.limit).toBe(10);
            expect(result.data.sortBy).toBe('createdAt');
            expect(result.data.sortOrder).toBe('desc');
        });

        test('deve validar lógica de ratings', () => {
            const invalidRatingRange = {
                minRating: 5,
                maxRating: 3 // máximo menor que mínimo
            };

            const dto = new BookSearchDTO(invalidRatingRange);
            expect(() => {
                dto.validate();
                dto.transform();
            }).toThrow('Rating mínimo não pode ser maior que o máximo');
        });

        test('deve validar lógica de datas', () => {
            const invalidDateRange = {
                fromDate: new Date('2024-01-15'),
                toDate: new Date('2024-01-01') // data final anterior à inicial
            };

            const dto = new BookSearchDTO(invalidDateRange);
            expect(() => {
                dto.validate();
                dto.transform();
            }).toThrow('Data inicial não pode ser posterior à data final');
        });

        test('deve normalizar tags de busca', () => {
            const searchWithTags = {
                tags: ['TEOLOGIA', 'Doutrina', 'ESTUDO', 'estudo']
            };

            const dto = new BookSearchDTO(searchWithTags);
            dto.validate();
            const transformed = dto.transform();

            expect(transformed.tags).toEqual(['teologia', 'doutrina', 'estudo']);
        });

        test('deve limitar número de tags', () => {
            const tooManyTags = {
                tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] // mais de 5
            };

            const result = BookSearchDTO.validateAndCreate(tooManyTags);
            expect(result.success).toBe(false);
        });

        test('deve validar valores de ordenação', () => {
            const validSorts = ['createdAt', 'updatedAt', 'title', 'views', 'likes'];
            const validOrders = ['asc', 'desc'];

            validSorts.forEach(sortBy => {
                validOrders.forEach(sortOrder => {
                    const searchParams = { sortBy, sortOrder };
                    const result = BookSearchDTO.validateAndCreate(searchParams);
                    expect(result.success).toBe(true);
                });
            });
        });

        test('deve rejeitar valores de ordenação inválidos', () => {
            const invalidSort = { sortBy: 'invalidField' };
            const result = BookSearchDTO.validateAndCreate(invalidSort);
            expect(result.success).toBe(false);

            const invalidOrder = { sortOrder: 'invalidOrder' };
            const result2 = BookSearchDTO.validateAndCreate(invalidOrder);
            expect(result2.success).toBe(false);
        });
    });

    describe('Integração entre DTOs', () => {
        test('deve manter consistência entre Create e Response DTOs', () => {
            const validBookData = {
                title: 'Teologia Sistemática',
                author: 'Wayne Grudem',
                description: 'Descrição completa',
                summary: 'Resumo do livro com pelo menos cinquenta caracteres para passar na validação',
                tags: ['teologia', 'doutrina'],
                personalRating: 5
            };

            // Cria usando CreateDTO
            const createResult = CreateBookDTO.validateAndCreate(validBookData);
            expect(createResult.success).toBe(true);

            // Simula dados salvos no banco
            const savedData = {
                _id: '507f1f77bcf86cd799439011',
                ...createResult.data,
                views: 0,
                likes: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Transforma com ResponseDTO
            const responseDTO = new BookResponseDTO(savedData);
            const publicData = responseDTO.toPublicObject();

            expect(publicData.title).toBe(validBookData.title);
            expect(publicData.author).toBe(validBookData.author);
            expect(publicData.tags).toEqual(validBookData.tags);
        });
    });
});

/**
 * COMANDOS PARA EXECUTAR TESTES:
 * 
 * npm test -- BookDTO.test.js                    # Testa apenas este arquivo
 * npm test -- --verbose BookDTO.test.js          # Com output detalhado
 * npm test -- --coverage BookDTO.test.js         # Com coverage
 * 
 * CONFIGURAÇÃO NECESSÁRIA NO package.json:
 * {
 *   "scripts": {
 *     "test": "jest",
 *     "test:watch": "jest --watch",
 *     "test:coverage": "jest --coverage"
 *   },
 *   "devDependencies": {
 *     "jest": "^29.0.0"
 *   }
 * }
 */
