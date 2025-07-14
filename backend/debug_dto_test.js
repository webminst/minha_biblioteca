// debug_dto_test.js
/**
 * Debug simples para verificar se os DTOs estão funcionando
 */

console.log('🔍 Testando importação dos DTOs...');

try {
    // Testa importação dos DTOs
    const { CreateBookDTO, ApiResponseDTO } = require('./dto');
    console.log('✅ DTOs importados com sucesso');

    // Testa criação de um DTO
    const testData = {
        title: 'Teste de Livro',
        author: 'Autor Teste',
        description: 'Descrição de teste para verificar se a validação está funcionando corretamente.',
        summary: 'Este é um resumo de teste para verificar se o DTO está validando corretamente os dados de entrada com pelo menos cinquenta caracteres.'
    };

    console.log('🧪 Testando validação do DTO...');
    const result = CreateBookDTO.validateAndCreate(testData);

    if (result.success) {
        console.log('✅ Validação funcionando!');
        console.log('📄 Dados validados:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Erro na validação:');
        result.errors.forEach(error => {
            console.log(`   - ${error.field}: ${error.message}`);
        });
    }

    // Testa resposta padronizada
    console.log('\n🔄 Testando resposta padronizada...');
    const response = ApiResponseDTO.success({ test: 'data' }, 'Teste de mensagem');
    console.log('✅ Resposta padronizada:', JSON.stringify(response, null, 2));

} catch (error) {
    console.error('❌ Erro ao importar ou usar DTOs:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n🎯 Debug concluído!');
