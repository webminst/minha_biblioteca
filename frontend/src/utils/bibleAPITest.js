// Teste simples da API bíblica
import { bibleApiService } from '../config/bibleApiService';

// Função para testar a API
async function testBibleAPI() {
    console.log('🔍 Testando API Bíblica...');

    try {
        // Teste 1: Buscar um versículo específico
        console.log('\n📖 Teste 1: Buscando João 3:16');
        const verse1 = await bibleApiService.fetchVerse('João 3:16', 'almeida');
        console.log('✅ Sucesso:', verse1);

        // Teste 2: Buscar versículo com referência em inglês
        console.log('\n📖 Teste 2: Buscando Psalm 23:1');
        const verse2 = await bibleApiService.fetchVerse('Psalm 23:1', 'kjv');
        console.log('✅ Sucesso:', verse2);

        // Teste 3: Validar referência
        console.log('\n🔍 Teste 3: Validando referência');
        const isValid = bibleApiService.validateReference('Gênesis 1:1');
        console.log('✅ Referência válida:', isValid);

        // Teste 4: Buscar versículo aleatório
        console.log('\n🎲 Teste 4: Buscando versículo aleatório');
        const randomVerse = await bibleApiService.fetchRandomVerse('almeida');
        console.log('✅ Versículo aleatório:', randomVerse);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Exportar função de teste
export { testBibleAPI };

// Se executado diretamente no console do navegador
if (typeof window !== 'undefined') {
    window.testBibleAPI = testBibleAPI;
    console.log('🚀 Para testar a API bíblica, execute: testBibleAPI()');
}
