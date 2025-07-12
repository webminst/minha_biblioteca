// Script simples para testar estudos sem autenticação
const axios = require('axios');

async function testStudiesList() {
    try {
        console.log('📖 Buscando lista de estudos...');
        const response = await axios.get('http://localhost:3002/api/studies');

        console.log(`Total de estudos encontrados: ${response.data.length}`);

        if (response.data.length > 0) {
            console.log('\n📋 Detalhes dos estudos:');
            response.data.forEach((study, index) => {
                console.log(`\n${index + 1}. Estudo:`);
                console.log(`   - ID: ${study._id}`);
                console.log(`   - Título: ${study.title}`);
                console.log(`   - Referência: "${study.reference}"`);
                console.log(`   - Tema: ${study.theme}`);
                console.log(`   - Formato: ${study.format}`);
                console.log(`   - Descrição: ${study.description?.substring(0, 50)}...`);
                console.log(`   - Data de criação: ${study.createdAt}`);

                // Verifica se o campo reference existe e não está vazio
                if (!study.reference || study.reference.trim() === '') {
                    console.log(`   ⚠️  PROBLEMA: Campo 'reference' está vazio ou não existe!`);
                } else {
                    console.log(`   ✅ Campo 'reference' OK`);
                }
            });
        } else {
            console.log('ℹ️  Nenhum estudo encontrado na base de dados.');
        }

    } catch (error) {
        console.error('❌ Erro ao buscar estudos:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        } else {
            console.error('Mensagem:', error.message);
        }
    }
}

console.log('🧪 Testando lista de estudos...');
testStudiesList();
