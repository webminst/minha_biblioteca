// Teste específico para URL do Google Drive
async function testarURLGoogleDrive() {
    try {
        // Login
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
        console.log('✅ Login realizado');

        // Dados com URL problemática do Google Drive
        const sermonData = {
            title: 'Teste Google Drive URL',
            bibleReference: 'Salmos 23',
            content: 'Este é um teste para verificar se URLs do Google Drive funcionam corretamente na validação. Este conteúdo tem mais de 100 caracteres para satisfazer a validação.',
            pdfUrl: 'https://drive.google.com/file/d/1kwBogfnJ8VN01nEDfvbcZifZpu9nxeif/view?usp=drive_link'
        };

        console.log('📤 Testando URL do Google Drive...');
        console.log('🔗 URL:', sermonData.pdfUrl);

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
            console.log('✅ SUCESSO! URL do Google Drive aceita');
            console.log('📊 ID do sermão criado:', result._id);
        } else {
            const error = await response.json();
            console.log('❌ ERRO ainda persiste:');
            console.log(JSON.stringify(error, null, 2));
        }

    } catch (error) {
        console.error('💥 Erro na requisição:', error.message);
    }
}

testarURLGoogleDrive();
