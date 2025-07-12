// Script para verificar detalhes de um estudo específico via API
const axios = require('axios');

async function checkStudyDetails() {
    try {
        // Pegar o primeiro estudo da lista
        const studyId = '686548babad326d7a38f2025';

        console.log(`📖 Buscando detalhes do estudo ${studyId}...`);
        const response = await axios.get(`http://localhost:3002/api/studies/${studyId}`);

        console.log('\n📋 Dados completos do estudo:');
        console.log(JSON.stringify(response.data, null, 2));

        console.log('\n🔍 Verificando campos específicos:');
        console.log(`- _id: ${response.data._id}`);
        console.log(`- title: ${response.data.title}`);
        console.log(`- reference: ${response.data.reference} (tipo: ${typeof response.data.reference})`);
        console.log(`- theme: ${response.data.theme}`);
        console.log(`- format: ${response.data.format}`);

        // Verificar se o campo existe mas está vazio
        if (response.data.hasOwnProperty('reference')) {
            console.log('✅ Campo "reference" existe no documento');
            if (response.data.reference === null) {
                console.log('⚠️  Valor é null');
            } else if (response.data.reference === undefined) {
                console.log('⚠️  Valor é undefined');
            } else if (response.data.reference === '') {
                console.log('⚠️  Valor é string vazia');
            } else {
                console.log(`✅ Valor: "${response.data.reference}"`);
            }
        } else {
            console.log('❌ Campo "reference" não existe no documento');
        }

    } catch (error) {
        console.error('❌ Erro ao buscar estudo:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        } else {
            console.error('Mensagem:', error.message);
        }
    }
}

console.log('🔍 Verificando detalhes de um estudo específico...');
checkStudyDetails();
