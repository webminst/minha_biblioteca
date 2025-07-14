// test_studies_frontend_integration.js
/**
 * Teste da integração frontend-backend para Studies
 */

const axios = require('axios');

async function testStudiesFrontendIntegration() {
    console.log('🔗 Testando integração Studies Frontend-Backend...\n');

    try {
        // Simula requisição da página de estudos
        console.log('1️⃣ Testando requisição da página de estudos...');
        const studiesParams = {
            page: 1,
            limit: 8
        };

        const studiesResponse = await axios.get('http://localhost:3001/api/studies', {
            params: studiesParams
        });

        console.log('✅ Status:', studiesResponse.status);
        console.log('📊 Estrutura:', Object.keys(studiesResponse.data));

        // Simula o que o helper extractStudies deveria fazer
        const { data } = studiesResponse;
        let studies = [];

        if (data.success && data.data) {
            studies = Array.isArray(data.data) ? data.data : [];
            console.log('✅ Helper detectaria formato DTO');
        } else if (data.studies) {
            studies = Array.isArray(data.studies) ? data.studies : [];
            console.log('✅ Helper detectaria formato intermediário');
        } else {
            studies = Array.isArray(data) ? data : [];
            console.log('✅ Helper detectaria formato antigo');
        }

        console.log(`📚 Estudos extraídos: ${studies.length}`);

        if (studies.length > 0) {
            console.log(`📖 Primeiro estudo: "${studies[0].title}"`);
            console.log(`🔍 Tema: ${studies[0].theme || 'N/A'}`);
            console.log('✅ Frontend deveria mostrar estudos!');
        } else {
            console.log('❌ Nenhum estudo extraído - Frontend mostrará "Nenhum estudo encontrado"');
        }

        console.log('\n2️⃣ Testando requisição da home page...');

        const latestResponse = await axios.get('http://localhost:3001/api/studies/latest');
        console.log('✅ Status latest:', latestResponse.status);
        console.log('📊 Estrutura latest:', Object.keys(latestResponse.data));

        // Simula o processamento da Home.js
        let latestStudy = null;
        if (latestResponse.data.success && latestResponse.data.data) {
            latestStudy = latestResponse.data.data;
            console.log('✅ Home detectaria formato DTO');
        } else {
            latestStudy = latestResponse.data;
            console.log('✅ Home detectaria formato antigo');
        }

        if (latestStudy && latestStudy.title) {
            console.log(`📖 Último estudo: "${latestStudy.title}"`);
            console.log('✅ Home deveria mostrar o estudo!');
        } else {
            console.log('❌ Último estudo não extraído corretamente');
        }

        console.log('\n🎯 RESULTADO:');
        if (studies.length > 0 && latestStudy) {
            console.log('✅ INTEGRAÇÃO STUDIES OK - Frontend deveria mostrar estudos');
        } else {
            console.log('❌ PROBLEMA NA INTEGRAÇÃO STUDIES - Investigar logs do frontend');
        }

    } catch (error) {
        console.error('❌ Erro na integração:', error.message);
    }
}

if (require.main === module) {
    testStudiesFrontendIntegration();
}

module.exports = { testStudiesFrontendIntegration };
