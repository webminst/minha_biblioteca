// Script para resetar senha do usuário admin
const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGODB_URI = "mongodb+srv://webgigio:bnhDj4X5k2V67u8W@cluster0.xnx5fp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function resetAdminPassword() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000
        });
        console.log('🔌 Conectado ao MongoDB');

        // Encontrar o usuário admin
        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.log('❌ Usuário admin não encontrado');
            return;
        }

        console.log('👤 Usuário admin encontrado');

        // Atualizar senha (o middleware irá fazer o hash automaticamente)
        adminUser.password = '123456';
        await adminUser.save();

        console.log('✅ Senha do admin atualizada para: 123456');

        // Testar a nova senha
        const isValid = await adminUser.matchPassword('123456');
        console.log('🔐 Teste da nova senha:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

resetAdminPassword();
