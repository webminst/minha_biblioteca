// test_frontend_backend_integration.js
/**
 * Teste da integração frontend-backend após migração DTO
 */

const axios = require('axios');

async function testFrontendBackendIntegration() {
    console.log('🔗 Testando integração Frontend-Backend...\n');

    try {
        // Simula exatamente a requisição que o frontend faz
        console.log('1️⃣ Testando requisição da página de livros...');
        const booksParams = {
            page: 1,
            limit: 8
        };

        const booksResponse = await axios.get('http://localhost:3001/api/books', {
            params: booksParams
        });

        console.log('✅ Status:', booksResponse.status);
        console.log('📊 Estrutura:', Object.keys(booksResponse.data));

        // Simula o que o helper extractBooks deveria fazer
        const { data } = booksResponse;
        let books = [];

        if (data.success && data.data) {
            books = Array.isArray(data.data) ? data.data : [];
            console.log('✅ Helper detectaria formato DTO');
        } else if (data.books) {
            books = Array.isArray(data.books) ? data.books : [];
            console.log('✅ Helper detectaria formato intermediário');
        } else {
            books = Array.isArray(data) ? data : [];
            console.log('✅ Helper detectaria formato antigo');
        }

        console.log(`📚 Livros extraídos: ${books.length}`);

        if (books.length > 0) {
            console.log(`📖 Primeiro livro: "${books[0].title}" por ${books[0].author}`);
            console.log('✅ Frontend deveria mostrar livros!');
        } else {
            console.log('❌ Nenhum livro extraído - Frontend mostrará "Nenhum livro encontrado"');
        }

        console.log('\n2️⃣ Testando requisição da home page...');

        const latestResponse = await axios.get('http://localhost:3001/api/books/latest');
        console.log('✅ Status latest:', latestResponse.status);
        console.log('📊 Estrutura latest:', Object.keys(latestResponse.data));

        // Simula o processamento da Home.js
        let latestBook = null;
        if (latestResponse.data.success && latestResponse.data.data) {
            latestBook = latestResponse.data.data;
            console.log('✅ Home detectaria formato DTO');
        } else {
            latestBook = latestResponse.data;
            console.log('✅ Home detectaria formato antigo');
        }

        if (latestBook && latestBook.title) {
            console.log(`📖 Último livro: "${latestBook.title}"`);
            console.log('✅ Home deveria mostrar o livro!');
        } else {
            console.log('❌ Último livro não extraído corretamente');
        }

        console.log('\n🎯 RESULTADO:');
        if (books.length > 0 && latestBook) {
            console.log('✅ INTEGRAÇÃO OK - Frontend deveria mostrar livros');
        } else {
            console.log('❌ PROBLEMA NA INTEGRAÇÃO - Investigar logs do frontend');
        }

    } catch (error) {
        console.error('❌ Erro na integração:', error.message);
    }
}

if (require.main === module) {
    testFrontendBackendIntegration();
}

module.exports = { testFrontendBackendIntegration };
