// Script para rodar npm audit automaticamente
// Salva o resultado em um arquivo de log
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Caminho absoluto para a raiz do projeto
const projectRoot = path.resolve(__dirname, '../../');
const logFile = path.join(__dirname, 'npm_audit_report.json');

exec('npm audit --json', { cwd: projectRoot }, (error, stdout, stderr) => {
    fs.writeFileSync(logFile, stdout);
    if (error) {
        console.error(`Erro ao rodar npm audit: ${error}`);
    } else {
        console.log(`Relatório salvo em ${logFile}`);
    }
});
