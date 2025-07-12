// Script para testar diferentes senhas via API
const senhas = ['123456', 'admin123', 'admin', 'password', '12345', 'senha123'];

async function testarSenhas() {
    for (const senha of senhas) {
        console.log(`🔐 Testando senha: ${senha}`);

        try {
            const response = await fetch('http://localhost:3002/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: senha
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCESSO! Senha correta: ${senha}`);
                console.log(`Token: ${data.token.substring(0, 30)}...`);
                return;
            } else {
                const error = await response.json();
                console.log(`❌ ${error.message}`);
            }
        } catch (error) {
            console.log(`❌ Erro na requisição: ${error.message}`);
        }
    }

    console.log('🚫 Nenhuma senha funcionou');
}

testarSenhas();
