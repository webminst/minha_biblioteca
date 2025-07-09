const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://webgigio:dL8ZG94t6cVvgdTf@cluster0.xnx5fp1.mongodb.net/pastor-portfolio?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
    try {
        // Configurações de conexão simplificadas
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 segundos
            socketTimeoutMS: 45000 // 45 segundos
        });

        console.log('✅ Conexão com MongoDB estabelecida');
        console.log('Database:', mongoose.connection.db.databaseName);

        // Verificar se há usuários
        const User = require('./backend/models/User');

        console.log('Buscando usuários...');
        const users = await User.find({}).maxTimeMS(30000);

        console.log('Usuários encontrados:', users.length);

        if (users.length > 0) {
            users.forEach(user => {
                console.log(`- ${user.username} (${user.email}) - Ativo: ${user.isActive}`);
            });
        } else {
            console.log('Nenhum usuário encontrado no banco de dados');
        }

    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);

        if (error.name === 'MongooseError') {
            console.log('💡 Dica: Verifique se o IP está liberado no MongoDB Atlas');
        }
    } finally {
        await mongoose.disconnect();
        console.log('Conexão encerrada');
    }
}

testConnection();