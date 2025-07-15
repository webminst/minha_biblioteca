// test-redis-connection.js
const { redis, isRedisConnected, getRedisStatus } = require('./backend/config/redis');

async function testRedisConnection() {
    console.log('🔍 Testando conexão Redis...\n');

    console.log('1️⃣ Status via isRedisConnected():', isRedisConnected());
    console.log('2️⃣ Status via getRedisStatus():', getRedisStatus());

    try {
        console.log('3️⃣ Testando ping direto...');
        const pingResult = await redis.ping();
        console.log('   Ping resultado:', pingResult);

        console.log('4️⃣ Status interno Redis...');
        console.log('   redis.status:', redis.status);
        console.log('   redis.connector.connecting:', redis.connector?.connecting);

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testRedisConnection();
