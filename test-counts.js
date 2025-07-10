// test-counts.js - Script para testar as rotas de contagem
const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function testCounts() {
    console.log('🧪 Testando rotas de contagem...\n');

    try {
        // Testar contagem de sermões
        console.log('📊 Testando contagem de sermões...');
        const sermonsCount = await axios.get(`${API_BASE}/sermons/count`);
        console.log(`✅ Sermões: ${sermonsCount.data.count} item(s)`);

        // Testar contagem de estudos
        console.log('📊 Testando contagem de estudos...');
        const studiesCount = await axios.get(`${API_BASE}/studies/count`);
        console.log(`✅ Estudos: ${studiesCount.data.count} item(s)`);

        // Testar contagem de livros
        console.log('📊 Testando contagem de livros...');
        const booksCount = await axios.get(`${API_BASE}/books/count`);
        console.log(`✅ Livros: ${booksCount.data.count} item(s)`);

        const total = sermonsCount.data.count + studiesCount.data.count + booksCount.data.count;
        console.log(`\n📈 Total de itens cadastrados: ${total}`);

        console.log('\n✅ Todas as rotas de contagem estão funcionando!');

    } catch (error) {
        console.error('❌ Erro ao testar contadores:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar o teste
testCounts();
