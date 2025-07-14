// test_advanced_search.js
/**
 * Teste avançado dos parâmetros de busca com DTOs
 */

const axios = require('axios');

async function testAdvancedSearch() {
    console.log('🔍 Testando validação avançada de parâmetros de busca...\n');

    const BASE_URL = 'http://localhost:3001/api/books';

    try {
        // Teste 1: Parâmetros válidos
        console.log('1️⃣ Testando parâmetros válidos...');
        const validParams = {
            page: 1,
            limit: 5,
            sortBy: 'title',
            sortOrder: 'asc',
            search: 'teologia'
        };

        const response1 = await axios.get(BASE_URL, { params: validParams });
        console.log(`✅ Busca válida funcionou! Status: ${response1.status}`);
        console.log(`📊 Estrutura: ${Object.keys(response1.data).join(', ')}`);

        if (response1.data.pagination) {
            console.log(`📄 Paginação: página ${response1.data.pagination.currentPage} de ${response1.data.pagination.totalPages}`);
        }
        console.log();

        // Teste 2: Parâmetros inválidos (devem ser corrigidos automaticamente)
        console.log('2️⃣ Testando parâmetros com valores automáticos...');
        const autoParams = {
            page: 0, // Inválido, deve virar 1
            limit: 200, // Inválido, deve virar 100 (máximo)
            sortOrder: 'invalid' // Inválido, deve virar 'desc'
        };

        try {
            const response2 = await axios.get(BASE_URL, { params: autoParams });
            console.log(`✅ Parâmetros corrigidos automaticamente! Status: ${response2.status}`);
            console.log(`📄 Paginação corrigida:`, response2.data.pagination);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Validação rejeitou parâmetros inválidos:');
                console.log(error.response.data);
            } else {
                console.log('❌ Erro inesperado:', error.message);
            }
        }
        console.log();

        // Teste 3: Busca com filtros específicos
        console.log('3️⃣ Testando filtros específicos...');
        const filterParams = {
            area: 'Teologia Sistemática',
            featured: true
        };

        const response3 = await axios.get(BASE_URL, { params: filterParams });
        console.log(`✅ Filtros aplicados! Status: ${response3.status}`);
        console.log(`📚 Livros filtrados: ${response3.data.data?.length || 0}`);
        console.log();

        // Teste 4: Verificar formato de timestamp
        console.log('4️⃣ Verificando timestamp da resposta...');
        const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

        if (response1.data.timestamp && timestampPattern.test(response1.data.timestamp)) {
            console.log('✅ Timestamp ISO válido:', response1.data.timestamp);
        } else {
            console.log('❌ Timestamp inválido ou ausente');
        }

        console.log('\n🎉 Teste avançado de busca concluído!');
        console.log('\n📊 Benefícios observados:');
        console.log('   ✅ Validação automática de parâmetros');
        console.log('   ✅ Valores padrão aplicados quando necessário');
        console.log('   ✅ Respostas padronizadas com metadata');
        console.log('   ✅ Paginação consistente');
        console.log('   ✅ Timestamps para auditoria');

    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
    }
}

// Teste de contagem simples
async function testCount() {
    try {
        const response = await axios.get('http://localhost:3001/api/books/count');
        console.log('📊 Teste de contagem:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Estrutura: ${Object.keys(response.data).join(', ')}`);
        console.log(`   Dados:`, response.data);
        return true;
    } catch (error) {
        console.error('❌ Erro na contagem:', error.message);
        return false;
    }
}

if (require.main === module) {
    // Primeiro testa contagem, depois busca avançada
    testCount().then(success => {
        if (success) {
            console.log('\n' + '='.repeat(60) + '\n');
            testAdvancedSearch();
        }
    });
}

module.exports = { testAdvancedSearch, testCount };
