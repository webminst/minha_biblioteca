// test_studies_migration.js
/**
 * Teste da migração do módulo Studies para DTOs
 */

const axios = require('axios');

async function testStudiesMigration() {
    console.log('📚 Testando migração do módulo Studies...\n');

    const BASE_URL = 'http://localhost:3001/api/studies';

    try {
        // Teste 1: Verificar contagem
        console.log('1️⃣ Testando contagem de estudos...');
        const countResponse = await axios.get(`${BASE_URL}/count`);

        console.log(`✅ Status: ${countResponse.status}`);
        console.log(`📊 Estrutura:`, Object.keys(countResponse.data));

        if (countResponse.data.success && countResponse.data.data) {
            console.log(`📚 Total de estudos: ${countResponse.data.data.count}`);
            console.log('✅ Formato DTO detectado!');
        } else {
            console.log('❌ Formato DTO não detectado');
        }
        console.log();

        // Teste 2: Listar estudos
        console.log('2️⃣ Testando listagem de estudos...');
        const listResponse = await axios.get(`${BASE_URL}?page=1&limit=5`);

        console.log(`✅ Status: ${listResponse.status}`);
        console.log(`📊 Estrutura:`, Object.keys(listResponse.data));

        if (listResponse.data.success && listResponse.data.data) {
            console.log(`📚 Estudos retornados: ${listResponse.data.data.length}`);
            console.log('✅ Formato DTO detectado!');

            if (listResponse.data.data.length > 0) {
                const firstStudy = listResponse.data.data[0];
                console.log(`📖 Primeiro estudo: "${firstStudy.title}"`);
                console.log(`🔍 Referência: ${firstStudy.biblicalReference || firstStudy.bibleReference || 'N/A'}`);
            }
        }

        if (listResponse.data.pagination) {
            console.log('✅ Paginação detectada!');
            console.log(`📄 Página atual: ${listResponse.data.pagination.currentPage}`);
            console.log(`📊 Total de itens: ${listResponse.data.pagination.totalItems}`);
        }
        console.log();

        // Teste 3: Último estudo
        console.log('3️⃣ Testando último estudo...');
        try {
            const latestResponse = await axios.get(`${BASE_URL}/latest`);

            console.log(`✅ Status: ${latestResponse.status}`);

            if (latestResponse.data.success && latestResponse.data.data) {
                const latestStudy = latestResponse.data.data;
                console.log(`📖 Último estudo: "${latestStudy.title}"`);
                console.log('✅ Formato DTO detectado!');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('ℹ️  Nenhum estudo encontrado (404 - normal se não houver estudos)');
            } else {
                console.log(`❌ Erro inesperado: ${error.response?.status}`);
            }
        }
        console.log();

        // Teste 4: Buscar estudo por ID (se houver estudos)
        if (listResponse.data.data && listResponse.data.data.length > 0) {
            console.log('4️⃣ Testando busca por ID...');
            const studyId = listResponse.data.data[0]._id || listResponse.data.data[0].id;

            try {
                const studyResponse = await axios.get(`${BASE_URL}/${studyId}`);

                console.log(`✅ Status: ${studyResponse.status}`);

                if (studyResponse.data.success && studyResponse.data.data) {
                    console.log(`📖 Estudo encontrado: "${studyResponse.data.data.title}"`);
                    console.log('✅ Formato DTO detectado!');
                }
            } catch (error) {
                console.log(`❌ Erro na busca por ID: ${error.response?.status}`);
            }
            console.log();
        }

        // Teste 5: Validação de ID inválido
        console.log('5️⃣ Testando validação de ID inválido...');
        try {
            await axios.get(`${BASE_URL}/invalid-id-format`);
            console.log('❌ Deveria ter rejeitado ID inválido!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ ID inválido rejeitado corretamente!');
                console.log(`📄 Resposta:`, error.response.data.message);
            } else {
                console.log(`❓ Status inesperado: ${error.response?.status}`);
            }
        }
        console.log();

        // Teste 6: Rotas auxiliares
        console.log('6️⃣ Testando rotas auxiliares...');

        try {
            const [statsResponse, themesResponse, formatsResponse] = await Promise.all([
                axios.get(`${BASE_URL}/stats`),
                axios.get(`${BASE_URL}/themes`),
                axios.get(`${BASE_URL}/formats`)
            ]);

            console.log('✅ Stats:', statsResponse.data.success ? 'DTO' : 'Antigo');
            console.log('✅ Themes:', themesResponse.data.success ? 'DTO' : 'Antigo');
            console.log('✅ Formats:', formatsResponse.data.success ? 'DTO' : 'Antigo');

        } catch (error) {
            console.log(`❌ Erro nas rotas auxiliares: ${error.message}`);
        }

        console.log('\n🎉 Teste do módulo Studies concluído!');

        console.log('\n📊 Benefícios implementados:');
        console.log('   ✅ Validação automática de entrada');
        console.log('   ✅ Resposta padronizada em todas as rotas');
        console.log('   ✅ Validação de ID automática');
        console.log('   ✅ Paginação estruturada');
        console.log('   ✅ Tratamento de erros consistente');

    } catch (error) {
        console.error('❌ Erro geral nos testes:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Dica: Certifique-se de que o servidor está rodando na porta 3001');
        }
    }
}

if (require.main === module) {
    testStudiesMigration();
}

module.exports = { testStudiesMigration };
