// backend/scripts/replace-console-logs.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuração dos diretórios a serem examinados
const directories = [
  path.join(__dirname, '../services'),
  path.join(__dirname, '../utils'),
  path.join(__dirname, '../routes'),
  path.join(__dirname, '../repositories'),
];

// Expressão regular para identificar console.log, console.error, etc.
const consoleRegex = /console\.(log|error|warn|info|debug)\s*\((.*?)\);?/g;

// Processa um único arquivo
async function processFile(filePath) {
  try {
    if (!filePath.endsWith('.js') || filePath.includes('node_modules')) {
      return false;
    }

    const content = await readFile(filePath, 'utf8');
    const originalContent = content;

    // Verifica se já temos a importação do logger
    const hasLoggerImport = content.includes("const logger = require('../config/logger')") || 
                           content.includes("const { logger } = require('../config/logger')");

    // Substitui console.log por logger.info, etc.
    let modifiedContent = content.replace(consoleRegex, (match, level, args) => {
      // Mapeia console.level para logger.level
      const loggerLevel = level === 'log' ? 'info' : level;
      return `logger.${loggerLevel}(${args});`;
    });

    // Adiciona a importação do logger se necessário
    if (modifiedContent !== originalContent && !hasLoggerImport) {
      // Verifica se tem outras importações para colocar a importação no mesmo estilo
      if (modifiedContent.includes('require(')) {
        // Adiciona após outras importações
        modifiedContent = modifiedContent.replace(/^(const.*?require.*?;\n)+/m, (match) => {
          return match + "const logger = require('../config/logger');\n";
        });
      } else {
        // Se não tem outras importações, adiciona no início do arquivo
        modifiedContent = `const logger = require('../config/logger');\n${modifiedContent}`;
      }
    }

    // Se houve modificações, salva o arquivo
    if (modifiedContent !== originalContent) {
      await writeFile(filePath, modifiedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error);
    return false;
  }
}

// Função recursiva para buscar arquivos em diretórios e subdiretórios
async function findAndProcessFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    let changedFiles = 0;

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        changedFiles += await findAndProcessFiles(fullPath);
      } else if (stats.isFile() && fullPath.endsWith('.js')) {
        const changed = await processFile(fullPath);
        if (changed) changedFiles++;
      }
    }
    
    return changedFiles;
  } catch (error) {
    console.error(`Erro ao buscar arquivos em ${dir}:`, error);
    return 0;
  }
}

// Função principal
async function main() {
  console.log('🔍 Procurando por console.log e substituindo por chamadas ao logger...');
  
  let totalChanged = 0;
  
  for (const dir of directories) {
    const changed = await findAndProcessFiles(dir);
    totalChanged += changed;
    console.log(`✅ Diretório ${path.basename(dir)}: ${changed} arquivos alterados`);
  }
  
  console.log(`\n🎉 Total: ${totalChanged} arquivos alterados com sucesso!`);
}

main().catch(console.error);