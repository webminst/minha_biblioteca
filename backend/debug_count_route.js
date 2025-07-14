// debug_count_route.js
/**
 * Debug específico da rota /api/books/count
 */

const axios = require('axios');

async function debugCountRoute() {
    console.log('🔍 Debugando rota /api/books/count...\n');

    try {
        const response = await axios.get('http://localhost:3001/api/books/count');

        console.log('📊 Status:', response.status);
        console.log('📄 Resposta completa:', JSON.stringify(response.data, null, 2));
        console.log('🔢 Total de livros:', response.data.count || response.data.data?.count || 'undefined');

        // Verificar se a estrutura está correta
        if (response.data.success !== undefined) {
            console.log('✅ Formato DTO detectado');
        } else {
            console.log('⚠️  Formato antigo detectado');
        }

    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        if (error.response) {
            console.error('📄 Resposta de erro:', error.response.data);
        }
    }
}

async function debugListRoute() {
    console.log('\n🔍 Debugando rota /api/books...\n');

    try {
        const response = await axios.get('http://localhost:3001/api/books?limit=5');

        console.log('📊 Status:', response.status);
        console.log('📄 Estrutura da resposta:', Object.keys(response.data));

        if (response.data.data) {
            console.log('📚 Número de livros retornados:', response.data.data.length);

            if (response.data.data.length > 0) {
                console.log('📖 Primeiro livro:', {
                    title: response.data.data[0].title,
                    author: response.data.data[0].author,
                    id: response.data.data[0]._id || response.data.data[0].id
                });
            } else {
                console.log('❌ Array de livros está vazio');
            }
        } else {
            console.log('❌ Propriedade "data" não encontrada na resposta');
        }

    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        if (error.response) {
            console.error('📄 Resposta de erro:', error.response.data);
        }
    }
}

async function runDebug() {
    await debugCountRoute();
    await debugListRoute();

    console.log('\n💡 Possíveis causas do problema:');
    console.log('   1. Banco de dados vazio');
    console.log('   2. Problema na conexão com MongoDB');
    console.log('   3. Erro na migração das rotas');
    console.log('   4. Problema no Service ou Model');
}

if (require.main === module) {
    runDebug();
}

module.exports = { debugCountRoute, debugListRoute };
