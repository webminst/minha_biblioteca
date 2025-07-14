// test_studies_formats_endpoint.js
/**
 * Teste específico das rotas de formatos e temas dos estudos
 */

const axios = require('axios');

async function testFormatsAndThemes() {
    console.log('🔍 Testando rotas de formatos e temas...\n');

    try {
        // Teste da rota /formats
        console.log('1️⃣ Testando /api/studies/formats...');
        const formatsResponse = await axios.get('http://localhost:3001/api/studies/formats');

        console.log('✅ Status formats:', formatsResponse.status);
        console.log('📊 Estrutura formats:', Object.keys(formatsResponse.data));

        if (formatsResponse.data.success && formatsResponse.data.data) {
            console.log('✅ Formato DTO detectado para formats');
            console.log(`📝 Formatos encontrados: ${Array.isArray(formatsResponse.data.data) ? formatsResponse.data.data.length : 'Não é array'}`);
            console.log('📄 Dados:', formatsResponse.data.data);
        } else {
            console.log('❌ Formato DTO não detectado para formats');
            console.log('📄 Dados diretos:', formatsResponse.data);
        }
        console.log();

        // Teste da rota /themes
        console.log('2️⃣ Testando /api/studies/themes...');
        const themesResponse = await axios.get('http://localhost:3001/api/studies/themes');

        console.log('✅ Status themes:', themesResponse.status);
        console.log('📊 Estrutura themes:', Object.keys(themesResponse.data));

        if (themesResponse.data.success && themesResponse.data.data) {
            console.log('✅ Formato DTO detectado para themes');
            console.log(`📝 Temas encontrados: ${Array.isArray(themesResponse.data.data) ? themesResponse.data.data.length : 'Não é array'}`);
            console.log('📄 Dados:', themesResponse.data.data);
        } else {
            console.log('❌ Formato DTO não detectado para themes');
            console.log('📄 Dados diretos:', themesResponse.data);
        }

        console.log('\n📋 Como o frontend deveria processar:');

        // Simula o processamento do frontend
        const formatsData = formatsResponse.data.success && formatsResponse.data.data
            ? formatsResponse.data.data
            : (formatsResponse.data || []);

        const themesData = themesResponse.data.success && themesResponse.data.data
            ? themesResponse.data.data
            : (themesResponse.data || []);

        console.log(`✅ formatsData processado: ${Array.isArray(formatsData) ? 'É array' : 'NÃO é array'} - ${formatsData.length || 0} itens`);
        console.log(`✅ themesData processado: ${Array.isArray(themesData) ? 'É array' : 'NÃO é array'} - ${themesData.length || 0} itens`);

    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        if (error.response) {
            console.error('📄 Resposta de erro:', error.response.data);
        }
    }
}

if (require.main === module) {
    testFormatsAndThemes();
}

module.exports = { testFormatsAndThemes };
