// Script para testar criação de sermão e identificar erros de validação
async function testarCriacaoSermao() {
    try {
        // Primeiro fazer login
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin2',
                password: '123456'
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login realizado com sucesso');

        // Dados de teste com possíveis problemas
        const sermonData = {
            title: 'Sermão de Teste',
            bibleReference: 'João 3:16',
            series: 'Série de Teste',
            tags: ['teste', 'validação'],
            speaker: 'Giovanni Guimarães',
            date: new Date().toISOString(),
            local: 'Igreja Teste',
            description: 'Descrição do sermão de teste',
            content: 'Este é o conteúdo do sermão de teste que precisa ter pelo menos 100 caracteres para passar na validação. Aqui temos um texto suficientemente longo para satisfazer esta regra de negócio implementada no modelo.',
            audioUrl: '', // URL vazia pode causar problema
            videoUrl: '', // URL vazia pode causar problema  
            pdfUrl: '',   // URL vazia pode causar problema
            book: '',     // Campo que pode não existir no modelo
            type: 'Sermão',
            duration: 45
        };

        console.log('📤 Enviando dados do sermão...');

        const response = await fetch('http://localhost:3002/api/sermons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sermonData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Sermão criado com sucesso!');
            console.log('📊 Resposta:', result);
        } else {
            const error = await response.json();
            console.log('❌ Erro na criação:');
            console.log('📊 Detalhes do erro:', JSON.stringify(error, null, 2));
        }

    } catch (error) {
        console.error('💥 Erro na requisição:', error.message);
    }
}

testarCriacaoSermao();
