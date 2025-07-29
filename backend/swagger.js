// backend/swagger.js

const swaggerJSDoc = require('swagger-jsdoc');

const options = {

    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pastor Portfolio API',
            version: '3.1.0',
            description: 'Documentação automática dos endpoints REST do Pastor Portfolio',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor local',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b7c2e1f1a2b3c4d5e6f7a8' },
                        title: { type: 'string', example: 'Teologia Sistemática' },
                        author: { type: 'string', example: 'Wayne Grudem' },
                        publisher: { type: 'string', example: 'Vida Nova' },
                        year: { type: 'integer', example: 2020 },
                        area: { type: 'string', example: 'Teologia' },
                        summary: { type: 'string', example: 'Resumo da obra...' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Sermon: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b7c2e1f1a2b3c4d5e6f7b9' },
                        title: { type: 'string', example: 'A Graça de Deus' },
                        series: { type: 'string', example: 'Série Romanos' },
                        reference: { type: 'string', example: 'Romanos 8:28' },
                        speaker: { type: 'string', example: 'Pr. Giovanni' },
                        date: { type: 'string', format: 'date' },
                        content: { type: 'string', example: 'Texto do sermão...' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Study: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b7c2e1f1a2b3c4d5e6f7c0' },
                        title: { type: 'string', example: 'Estudo sobre Fé' },
                        theme: { type: 'string', example: 'Fé' },
                        format: { type: 'string', example: 'PDF' },
                        reference: { type: 'string', example: 'Hebreus 11' },
                        content: { type: 'string', example: 'Conteúdo do estudo...' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                AuthRequest: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', example: 'admin@exemplo.com' },
                        password: { type: 'string', example: 'senha123' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '64b7c2e1f1a2b3c4d5e6f7d1' },
                                email: { type: 'string', example: 'admin@exemplo.com' },
                                name: { type: 'string', example: 'Administrador' }
                            }
                        }
                    }
                }
            }
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
