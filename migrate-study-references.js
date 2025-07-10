// Script para migrar campo bibleReference para reference nos estudos
const mongoose = require('mongoose');

// Conecta ao banco de dados
const MONGODB_URI = 'mongodb+srv://webgigio:bnhDj4X5k2V67u8W@cluster0.xnx5fp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function migrateStudyReferences() {
    try {
        console.log('🔗 Conectando ao MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado com sucesso!');

        // Buscar todos os estudos que têm bibleReference mas não têm reference
        console.log('\n📖 Buscando estudos para migração...');

        const studies = await mongoose.connection.collection('studies').find({
            bibleReference: { $exists: true },
            $or: [
                { reference: { $exists: false } },
                { reference: null },
                { reference: '' }
            ]
        }).toArray();

        console.log(`Encontrados ${studies.length} estudos para migração.`);

        if (studies.length === 0) {
            console.log('ℹ️  Nenhum estudo precisa de migração.');
            return;
        }

        console.log('\n🔄 Iniciando migração...');
        let migrated = 0;
        let errors = 0;

        for (const study of studies) {
            try {
                const result = await mongoose.connection.collection('studies').updateOne(
                    { _id: study._id },
                    {
                        $set: {
                            reference: study.bibleReference
                        }
                    }
                );

                if (result.modifiedCount > 0) {
                    migrated++;
                    console.log(`✅ Migrado: "${study.title}" - Referência: "${study.bibleReference}"`);
                } else {
                    console.log(`⚠️  Não modificado: "${study.title}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Erro ao migrar "${study.title}":`, error.message);
            }
        }

        console.log(`\n📊 Resumo da migração:`);
        console.log(`- Total processados: ${studies.length}`);
        console.log(`- Migrados com sucesso: ${migrated}`);
        console.log(`- Erros: ${errors}`);

        // Verificar se a migração funcionou
        console.log('\n🔍 Verificando migração...');
        const verifyStudies = await mongoose.connection.collection('studies').find({
            reference: { $exists: true, $ne: null, $ne: '' }
        }).toArray();

        console.log(`Estudos com campo 'reference' preenchido: ${verifyStudies.length}`);

        // Mostrar alguns exemplos
        if (verifyStudies.length > 0) {
            console.log('\n📋 Primeiros 5 estudos migrados:');
            verifyStudies.slice(0, 5).forEach((study, index) => {
                console.log(`${index + 1}. "${study.title}" - Referência: "${study.reference}"`);
            });
        }

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado do MongoDB.');
    }
}

console.log('🚀 Iniciando migração de referências bíblicas...');
migrateStudyReferences();
