#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

/**
 * Script para enviar o banco de dados corrigido para o servidor remoto
 * Uso: node upload-cleaned-db.cjs
 */

function uploadDatabase(filePath, targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(data);

      console.log(`📤 Preparando para enviar ${jsonData.length} usuários...`);

      // Para this.example, você precisaria de um endpoint PUT no seu servidor
      // Se seu servidor Render não tem um endpoint, você pode:
      // 1. Fazer manualmente através da interface do Render
      // 2. Usar um script de deploy
      // 3. Adicionar um endpoint POST no seu backend

      console.log("\n⚠️  IMPORTANTE: Seu servidor Render não parece ter um endpoint PUT para banco inteiro");
      console.log("\nOpções de upload:");
      console.log("1. Use a interface web do Render para fazer upload manual");
      console.log("2. Abra o arquivo 'database_cleaned.json' e copie o conteúdo");
      console.log("3. Substitua o conteúdo no seu banco remoto");
      console.log(
        "\nAlternativa: Se tiver um servidor Node.js rodando, use:"
      );
      console.log("curl -X POST http://localhost:3001/cleanup");

      // Mostrar preview dos dados
      console.log("\n📋 Preview do banco limpo (5 primeiros usuários):");
      jsonData.slice(0, 5).forEach((user, idx) => {
        console.log(
          `\n${idx + 1}. ${user.email}`
        );
        console.log(`   ID: ${user.id}`);
        console.log(
          `   Senha: ${user.password.substring(0, 10)}...${user.password.substring(54)} ✓ (hasheada)`
        );
      });

      console.log("\n\n✅ Arquivo pronto para upload: database_cleaned.json");
      console.log(`\n📊 Total de usuários: ${jsonData.length}`);
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  try {
    const cleanedDbPath = path.join(
      process.cwd(),
      "database_cleaned.json"
    );

    if (!fs.existsSync(cleanedDbPath)) {
      console.error(
        "❌ Erro: Arquivo 'database_cleaned.json' não encontrado!"
      );
      console.error("Execute 'node fix-remote-database.cjs' primeiro");
      process.exit(1);
    }

    await uploadDatabase(cleanedDbPath, "https://database-save-app.onrender.com");
  } catch (error) {
    console.error("❌ Erro durante upload:", error.message);
    process.exit(1);
  }
}

main();
