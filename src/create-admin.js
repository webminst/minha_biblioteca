// Criar script create-admin.js
const mongoose = require('mongoose');
const User = require('../backend/models/User');

const MONGODB_URI = "mongodb+srv://webgigio:bnhDj4X5k2V67u8W@cluster0.xnx5fp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado ao MongoDB');

        // Verificar se admin já existe
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('❌ Usuário admin já existe');
            return;
        }

        // Criar novo admin (o middleware do modelo fará o hash da senha)
        const adminUser = new User({
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        });

        await adminUser.save();
        console.log('✅ Usuário admin criado com sucesso!');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();