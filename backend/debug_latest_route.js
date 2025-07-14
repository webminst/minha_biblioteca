// debug_latest_route.js
const axios = require('axios');

async function debugLatest() {
    try {
        const response = await axios.get('http://localhost:3001/api/books/latest');
        console.log('📄 Resposta completa:', JSON.stringify(response.data, null, 2));

        if (response.data.data && response.data.data.title) {
            console.log('✅ Dados corretos encontrados');
            console.log('📖 Título:', response.data.data.title);
        } else {
            console.log('❌ Dados não estão na propriedade correta');
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

debugLatest();
