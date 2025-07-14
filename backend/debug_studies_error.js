// debug_studies_error.js
/**
 * Debug específico do erro na listagem de estudos
 */

const axios = require('axios');

async function debugStudiesError() {
    console.log('🔍 Debugando erro na listagem de estudos...\n');

    try {
        const response = await axios.get('http://localhost:3001/api/studies?page=1&limit=5');
        console.log('✅ Sucesso inesperado:', response.data);
    } catch (error) {
        console.log('❌ Erro capturado:');
        console.log('📊 Status:', error.response?.status);
        console.log('📄 Dados:', error.response?.data);
        console.log('🔍 Headers:', error.response?.headers);
    }
}

debugStudiesError();
