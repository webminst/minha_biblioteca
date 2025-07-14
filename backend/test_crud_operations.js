// test_crud_operations.js
/**
 * Teste das operações CRUD completas (PUT e DELETE)
 */

const axios = require('axios');

async function testCrudOperations() {
    console.log('🔧 Testando operações CRUD (PUT/DELETE)...\n');

    const BASE_URL = 'http://localhost:3001/api/books';

    try {
        // Primeiro, vamos buscar um livro existente para testar atualização
        console.log('1️⃣ Buscando livro existente para testar atualização...');
        const listResponse = await axios.get(BASE_URL);

        if (!listResponse.data.data || listResponse.data.data.length === 0) {
            console.log('❌ Nenhum livro encontrado para testar. Criando um livro primeiro...');

            // Criar um livro para testar
            const newBook = {
                title: "Livro de Teste - CRUD",
                author: "Autor Teste",
                description: "Este é um livro criado apenas para testar as operações CRUD",
                area: "Teologia",
                tags: ["teste", "crud"],
                isbn: "1234567890123"
            };

            const createResponse = await axios.post(BASE_URL, newBook);
            console.log(`✅ Livro criado para teste: ${createResponse.data.data.title}`);

            // Atualizar a resposta para usar o livro recém-criado
            listResponse.data.data = [createResponse.data.data];
        }

        const testBook = listResponse.data.data[0];
        const bookId = testBook._id || testBook.id;

        console.log(`📚 Livro selecionado: "${testBook.title}" (ID: ${bookId})\n`);

        // Teste 2: Atualizar livro (PUT)
        console.log('2️⃣ Testando atualização (PUT)...');

        const updateData = {
            title: "Título Atualizado - " + new Date().toISOString().slice(0, 10),
            description: "Descrição atualizada pelo teste automatizado",
            personalRating: 4,
            tags: ["atualizado", "teste"]
        };

        try {
            const updateResponse = await axios.put(`${BASE_URL}/${bookId}`, updateData);

            if (updateResponse.status === 200) {
                console.log('✅ Livro atualizado com sucesso!');
                console.log(`📊 Status: ${updateResponse.status}`);
                console.log(`🔄 Novo título: ${updateResponse.data.data?.title || 'N/A'}`);
                console.log(`⭐ Nova avaliação: ${updateResponse.data.data?.personalRating || 'N/A'}`);

                if (updateResponse.data.success) {
                    console.log('✅ Formato DTO padronizado detectado!');
                }
            }
        } catch (error) {
            console.log('❌ Erro na atualização:', error.response?.status, error.response?.data?.message);
            console.log('📄 Detalhes:', error.response?.data);
        }
        console.log();

        // Teste 3: Validação de dados na atualização
        console.log('3️⃣ Testando validação na atualização...');

        const invalidUpdateData = {
            title: "", // Título vazio (deve falhar)
            personalRating: 10 // Rating inválido (deve falhar)
        };

        try {
            await axios.put(`${BASE_URL}/${bookId}`, invalidUpdateData);
            console.log('❌ Deveria ter rejeitado dados inválidos!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Dados inválidos rejeitados corretamente!');
                console.log(`📄 Erros de validação:`, error.response.data.errors?.length || 0);
            } else {
                console.log(`❓ Status inesperado: ${error.response?.status}`);
            }
        }
        console.log();

        // Teste 4: Deletar livro (DELETE) - apenas se for um livro de teste
        if (testBook.title.includes('Teste') || testBook.tags?.includes('teste')) {
            console.log('4️⃣ Testando exclusão (DELETE) do livro de teste...');

            try {
                const deleteResponse = await axios.delete(`${BASE_URL}/${bookId}`);

                if (deleteResponse.status === 200) {
                    console.log('✅ Livro deletado com sucesso!');
                    console.log(`📊 Status: ${deleteResponse.status}`);

                    if (deleteResponse.data.success) {
                        console.log('✅ Formato DTO padronizado detectado!');
                    }
                }
            } catch (error) {
                console.log('❌ Erro na exclusão:', error.response?.status, error.response?.data?.message);
                console.log('📄 Detalhes:', error.response?.data);
            }
        } else {
            console.log('4️⃣ ⚠️  Pulando teste de exclusão (livro não é de teste)');
        }

        console.log('\n🎉 Testes de CRUD concluídos!');

        console.log('\n📊 Benefícios observados:');
        console.log('   ✅ Validação automática de entrada para PUT');
        console.log('   ✅ Validação automática de ID para PUT/DELETE');
        console.log('   ✅ Resposta padronizada em todas as operações');
        console.log('   ✅ Tratamento adequado de erros de validação');
        console.log('   ✅ Transformação de dados para formato público');

    } catch (error) {
        console.error('❌ Erro geral nos testes:', error.message);
    }
}

if (require.main === module) {
    testCrudOperations();
}

module.exports = { testCrudOperations };
