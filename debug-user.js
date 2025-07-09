// Script para debugar usuários no banco
const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGODB_URI = "mongodb+srv://webgigio:bnhDj4X5k2V67u8W@cluster0.xnx5fp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function debugUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('🔌 Conectado ao MongoDB');

        // Listar todos os usuários
        const users = await User.find({});
        console.log('📋 Usuários encontrados:', users.length);

        users.forEach((user, index) => {
            console.log(`👤 Usuário ${index + 1}:`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('---');
        });

        // Testar verificação de senha
        if (users.length > 0) {
            const user = users[0];
            console.log('🔐 Testando verificação de senha...');

            const testPasswords = ['admin123', 'admin', '123456'];

            for (const password of testPasswords) {
                try {
                    const isValid = await user.matchPassword(password);
                    console.log(`   Senha "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
                } catch (error) {
                    console.log(`   Senha "${password}": ❌ ERRO - ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

debugUsers();
