// test_books_route.js
/**
 * Teste específico da rota de books migrada
 */

const axios = require('axios');

async function testBooksRoute() {
    console.log('🧪 Testando rota de books migrada...\n');

    const BASE_URL = 'http://localhost:3001/api/books';

    try {
        // Teste 1: GET /books (deve funcionar sem autenticação)
        console.log('1️⃣ Testando GET /books...');
        const getResponse = await axios.get(BASE_URL);
        console.log(`✅ GET funcionando! Status: ${getResponse.status}`);
        console.log(`📊 Estrutura da resposta:`, Object.keys(getResponse.data));

        if (getResponse.data.books) {
            console.log(`📚 Total de livros retornados: ${getResponse.data.books.length}`);
        }
        console.log();

        // Teste 2: POST /books (vai falhar por falta de auth, mas podemos ver a validação)
        console.log('2️⃣ Testando POST /books (sem autenticação)...');

        const testBookData = {
            title: 'A', // Dados inválidos para testar validação
            author: '',
            description: 'muito curto',
            summary: 'resumo curto'
        };

        try {
            await axios.post(BASE_URL, testBookData);
            console.log('❌ POST deveria ter falhado!');
        } catch (error) {
            if (error.response) {
                console.log(`✅ POST rejeitado corretamente! Status: ${error.response.status}`);
                console.log('📄 Resposta de erro:', JSON.stringify(error.response.data, null, 2));

                // Verificar se está usando formato DTO
                const hasSuccessField = 'success' in error.response.data;
                const hasErrorsArray = Array.isArray(error.response.data.errors);

                if (hasSuccessField || hasErrorsArray) {
                    console.log('✅ Formato de resposta DTO detectado!');
                } else {
                    console.log('⚠️  Resposta ainda não está usando formato DTO completo');
                }
            } else {
                console.log('❌ Erro de conexão:', error.message);
            }
        }
        console.log();

        // Teste 3: Dados válidos mas sem autenticação
        console.log('3️⃣ Testando POST com dados válidos (sem autenticação)...');

        const validBookData = {
            title: 'Livro de Teste para Validação de DTOs',
            author: 'Autor de Teste',
            description: 'Esta é uma descrição válida que atende aos critérios mínimos de caracteres estabelecidos pelo DTO.',
            summary: 'Este é um resumo válido que contém pelo menos cinquenta caracteres conforme exigido pela validação do DTO para garantir que o conteúdo seja adequado.'
        };

        try {
            await axios.post(BASE_URL, validBookData);
            console.log('❌ POST deveria ter falhado por falta de autenticação!');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Autenticação funcionando! Status 401 (Unauthorized)');
                console.log('📄 Resposta:', error.response.data);
            } else if (error.response && error.response.status === 400) {
                console.log('⚠️  Dados válidos foram rejeitados pela validação DTO:');
                console.log('📄 Erros:', error.response.data);
            } else {
                console.log(`❓ Status inesperado: ${error.response?.status}`);
                console.log('📄 Resposta:', error.response?.data);
            }
        }

        console.log('\n🎉 Teste da rota migrada concluído!');

    } catch (error) {
        console.error('❌ Erro geral nos testes:', error.message);
    }
}

// Executa o teste
if (require.main === module) {
    testBooksRoute();
}

module.exports = { testBooksRoute };
