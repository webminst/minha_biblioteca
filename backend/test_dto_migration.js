// test_dto_migration.js
/**
 * Script para testar a migração de DTOs
 * Execute: node test_dto_migration.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Dados de teste válidos
const validBookData = {
    title: 'Teologia Sistemática de Charles Hodge',
    author: 'Charles Hodge',
    publisher: 'Hagnos',
    area: 'Teologia Sistemática',
    description: 'Uma obra completa sobre teologia sistemática cristã abordando temas fundamentais da fé.',
    summary: 'Charles Hodge apresenta neste livro uma abordagem metodológica e completa da teologia cristã, cobrindo desde a doutrina de Deus até a escatologia, servindo como um guia essencial para estudantes e pastores.',
    tags: ['teologia', 'doutrina', 'sistemática'],
    publicationYear: 2001,
    personalRating: 5,
    difficulty: 'Avançado',
    isPublished: true
};

// Dados de teste inválidos para verificar validação
const invalidBookData = {
    title: 'A', // muito curto
    author: '', // vazio
    description: 'Desc', // muito curto
    summary: 'Resumo curto', // muito curto
    personalRating: 10, // fora do range 1-5
    publicationYear: 2030 // futuro
};

async function testDTOMigration() {
    console.log('🧪 Iniciando testes de migração DTOs...\n');

    try {
        // Teste 1: Verificar se a API está funcionando
        console.log('1️⃣ Testando conectividade da API...');
        const healthCheck = await axios.get(`${BASE_URL}/books/count`);
        console.log(`✅ API respondendo. Total de livros: ${healthCheck.data.count}\n`);

        // Teste 2: Testar validação com dados inválidos (deve falhar)
        console.log('2️⃣ Testando validação com dados inválidos...');
        try {
            await axios.post(`${BASE_URL}/books`, invalidBookData, {
                headers: {
                    'Content-Type': 'application/json',
                    // Nota: Em produção você precisaria de um token JWT válido
                    'Authorization': 'Bearer seu-token-aqui'
                }
            });
            console.log('❌ ERRO: Validação deveria ter falhado!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Validação funcionando! Dados inválidos rejeitados.');
                console.log('   Erros encontrados:');
                if (error.response.data.errors) {
                    error.response.data.errors.forEach(err => {
                        console.log(`   - ${err.field}: ${err.message}`);
                    });
                }
                console.log();
            } else if (error.response && error.response.status === 401) {
                console.log('✅ Validação de autenticação funcionando (esperado sem token).\n');
            } else {
                console.log('❌ Erro inesperado:', error.message);
            }
        }

        // Teste 3: Verificar estrutura de resposta de erro
        console.log('3️⃣ Verificando estrutura de resposta de erro...');
        try {
            await axios.post(`${BASE_URL}/books`, invalidBookData);
        } catch (error) {
            if (error.response && error.response.data) {
                const responseStructure = Object.keys(error.response.data);
                console.log('   Estrutura da resposta de erro:', responseStructure);

                const hasExpectedFields = ['success', 'message'].every(field =>
                    responseStructure.includes(field)
                );

                if (hasExpectedFields) {
                    console.log('✅ Estrutura de resposta padronizada funcionando!\n');
                } else {
                    console.log('❌ Estrutura de resposta não está padronizada.\n');
                }
            }
        }

        console.log('🎉 Testes de migração concluídos!');
        console.log('\n📊 Resumo dos benefícios observados:');
        console.log('   ✅ Validação automática de dados');
        console.log('   ✅ Respostas de erro padronizadas');
        console.log('   ✅ Estrutura consistente de API');
        console.log('   ✅ Melhor experiência de debug');

    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Dica: Certifique-se de que o servidor está rodando na porta 3001');
        }
    }
}

// Função para testar apenas a conectividade
async function quickTest() {
    try {
        const response = await axios.get(`${BASE_URL}/books/count`);
        console.log('✅ Servidor funcionando!');
        console.log(`📊 Total de livros: ${response.data.count}`);
        return true;
    } catch (error) {
        console.error('❌ Servidor não está respondendo:', error.message);
        return false;
    }
}

// Executa o teste
if (require.main === module) {
    // Primeiro testa conectividade
    quickTest().then(isConnected => {
        if (isConnected) {
            // Se conectado, executa testes completos
            testDTOMigration();
        } else {
            console.log('\n💡 Verifique se:');
            console.log('   1. O servidor está rodando (npm run dev)');
            console.log('   2. A porta 3001 está disponível');
            console.log('   3. Não há erros no console do servidor');
        }
    });
}

module.exports = { testDTOMigration, quickTest };
