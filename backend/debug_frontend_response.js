// debug_frontend_response.js
/**
 * Teste para verificar exatamente o que o frontend está recebendo
 */

const axios = require('axios');

async function debugFrontendResponse() {
    console.log('🔍 Debugando resposta que o frontend recebe...\n');

    try {
        // Simula exatamente a requisição que o frontend faz
        const params = {
            page: 1,
            limit: 8
        };

        const response = await axios.get('http://localhost:3001/api/books', { params });

        console.log('📊 Status:', response.status);
        console.log('📄 Estrutura da resposta:');
        console.log(JSON.stringify(response.data, null, 2));

        console.log('\n🔍 Verificando o que o frontend está buscando:');

        // Verifica se a resposta tem a estrutura que o frontend espera
        if (response.data.books) {
            console.log('✅ Frontend encontrará: response.data.books');
            console.log('📚 Livros encontrados:', response.data.books.length);
        } else {
            console.log('❌ Frontend NÃO encontrará: response.data.books');
        }

        // Verifica a nova estrutura DTO
        if (response.data.data) {
            console.log('✅ Nova estrutura DTO: response.data.data');
            console.log('📚 Livros na nova estrutura:', response.data.data.length);
        } else {
            console.log('❌ Nova estrutura DTO não encontrada');
        }

        // Verifica paginação
        if (response.data.pagination) {
            console.log('✅ Paginação encontrada:', response.data.pagination);
        } else {
            console.log('❌ Paginação não encontrada');
        }

        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   O frontend está buscando "response.data.books"');
        console.log('   Mas a API agora retorna "response.data.data"');
        console.log('   → ESTE É O PROBLEMA! ←');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

if (require.main === module) {
    debugFrontendResponse();
}

module.exports = { debugFrontendResponse };
