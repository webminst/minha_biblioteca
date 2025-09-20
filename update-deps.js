// update-deps.js
const { execSync } = require('child_process');

console.log('Verificando e atualizando dependências...');
try {
    execSync('npx npm-check-updates -u', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependências atualizadas com sucesso!');
} catch (error) {
    console.error('Erro ao atualizar dependências:', error);
    process.exit(1);
}
