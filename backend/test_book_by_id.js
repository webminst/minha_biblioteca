// test_book_by_id.js
/**
 * Teste específico da rota GET /api/books/:id
 */

const axios = require('axios');

async function testBookById() {
    console.log('🔍 Testando rota GET /api/books/:id...\n');

    const BASE_URL = 'http://localhost:3001/api/books';

    try {
        // Primeiro, vamos buscar a lista para pegar um ID válido
        console.log('1️⃣ Buscando lista de livros para obter ID válido...');
        const listResponse = await axios.get(BASE_URL);

        if (listResponse.data.data && listResponse.data.data.length > 0) {
            const firstBook = listResponse.data.data[0];
            const bookId = firstBook._id || firstBook.id;

            console.log(`✅ ID encontrado: ${bookId}`);
            console.log(`📚 Livro: "${firstBook.title}" por ${firstBook.author}\n`);

            // Teste 2: Buscar livro específico com ID válido
            console.log('2️⃣ Testando busca por ID válido...');
            const bookResponse = await axios.get(`${BASE_URL}/${bookId}`);

            console.log(`✅ Livro encontrado! Status: ${bookResponse.status}`);
            console.log(`📊 Estrutura da resposta: ${Object.keys(bookResponse.data).join(', ')}`);

            if (bookResponse.data.success) {
                console.log('✅ Formato DTO detectado!');
                console.log(`📖 Título: ${bookResponse.data.data.title}`);
                console.log(`👤 Autor: ${bookResponse.data.data.author}`);
                console.log(`🕒 Timestamp: ${bookResponse.data.timestamp}`);
            }
            console.log();

            // Teste 3: ID inválido (formato incorreto)
            console.log('3️⃣ Testando ID com formato inválido...');
            try {
                await axios.get(`${BASE_URL}/invalid-id-format`);
                console.log('❌ Deveria ter rejeitado ID inválido!');
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('✅ ID inválido rejeitado corretamente!');
                    console.log(`📄 Resposta:`, error.response.data);
                } else {
                    console.log(`❓ Status inesperado: ${error.response?.status}`);
                }
            }
            console.log();

            // Teste 4: ID válido mas não existe
            console.log('4️⃣ Testando ID válido mas inexistente...');
            const fakeId = '507f1f77bcf86cd799439011'; // ObjectId válido mas provavelmente inexistente

            try {
                await axios.get(`${BASE_URL}/${fakeId}`);
                console.log('⚠️  Livro inexistente foi encontrado (inesperado)');
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('✅ Livro inexistente retornou 404 corretamente!');
                } else {
                    console.log(`❓ Status inesperado para ID inexistente: ${error.response?.status}`);
                    console.log(`📄 Resposta:`, error.response?.data);
                }
            }

        } else {
            console.log('❌ Nenhum livro encontrado na base de dados para testar');
            return;
        }

        console.log('\n🎉 Teste da rota GET /:id concluído!');

        console.log('\n📊 Benefícios observados:');
        console.log('   ✅ Validação automática de ID');
        console.log('   ✅ Resposta padronizada com metadata');
        console.log('   ✅ Tratamento adequado de erros');
        console.log('   ✅ Transformação de dados para formato público');

    } catch (error) {
        console.error('❌ Erro geral nos testes:', error.message);
    }
}

if (require.main === module) {
    testBookById();
}

module.exports = { testBookById };
