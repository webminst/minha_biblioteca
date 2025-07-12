// Script para testar criação de estudo e verificar se o campo 'reference' está funcionando
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

// Dados de teste para criar um estudo
const testStudyData = {
    title: 'Teste de Referência Bíblica',
    reference: 'João 3:16-17',
    theme: 'Vida Cristã',
    format: 'Estudo Expositivo',
    description: 'Teste para verificar se o campo reference está funcionando corretamente',
    content: 'Conteúdo de teste'
};

async function testStudyCreation() {
    try {
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso!');

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        console.log('\n📝 Criando estudo de teste...');
        console.log('Dados enviados:', JSON.stringify(testStudyData, null, 2));

        const createResponse = await axios.post(`${BASE_URL}/studies`, testStudyData, config);

        console.log('✅ Estudo criado com sucesso!');
        console.log('Dados retornados:', JSON.stringify(createResponse.data, null, 2));

        const studyId = createResponse.data._id;

        console.log('\n📖 Buscando o estudo criado...');
        const getResponse = await axios.get(`${BASE_URL}/studies/${studyId}`, config);

        console.log('Estudo encontrado:');
        console.log('- ID:', getResponse.data._id);
        console.log('- Título:', getResponse.data.title);
        console.log('- Referência:', getResponse.data.reference);
        console.log('- Tema:', getResponse.data.theme);
        console.log('- Formato:', getResponse.data.format);

        console.log('\n📋 Listando todos os estudos...');
        const listResponse = await axios.get(`${BASE_URL}/studies`);

        console.log(`Total de estudos: ${listResponse.data.length}`);
        listResponse.data.forEach((study, index) => {
            console.log(`${index + 1}. ${study.title} - Referência: "${study.reference}"`);
        });

        console.log('\n🗑️ Removendo estudo de teste...');
        await axios.delete(`${BASE_URL}/studies/${studyId}`, config);
        console.log('✅ Estudo de teste removido com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        } else {
            console.error('Mensagem:', error.message);
        }
    }
}

console.log('🧪 Iniciando teste de criação de estudo...');
testStudyCreation();
