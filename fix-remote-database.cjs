const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

// Função para fazer hash SHA-256 (compatível com o frontend)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Função para buscar dados de uma URL HTTPS
function fetchFromURL(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function fixDatabaseFromRemote() {
  try {
    console.log("🔍 Buscando banco remoto de https://database-save-app.onrender.com/users...\n");

    let users = await fetchFromURL(
      "https://database-save-app.onrender.com/users"
    );

    console.log(`✓ Carregado banco com ${users.length} usuários\n`);

    console.log("📋 ANÁLISE DO BANCO REMOTO:\n");

    // Análise: encontrar duplicatas de email
    const emailMap = {};
    users.forEach((u, idx) => {
      if (!emailMap[u.email]) {
        emailMap[u.email] = [];
      }
      emailMap[u.email].push(idx);
    });

    const duplicateEmails = Object.entries(emailMap).filter(
      ([_, indices]) => indices.length > 1
    );

    console.log(`❌ Emails duplicados: ${duplicateEmails.length}`);
    duplicateEmails.forEach(([email, indices]) => {
      console.log(
        `   • ${email}: ${indices.length} registros (IDs: ${indices
          .map((i) => users[i].id)
          .join(", ")})`
      );
    });

    console.log("\n🔐 VERIFICAÇÃO DE SENHAS:\n");

    // Análise: senhas em texto plano vs hasheadas
    const plainPasswords = users.filter(
      (u) => u.password && u.password.length < 32
    );
    const hashedPasswords = users.filter(
      (u) => u.password && u.password.length >= 32
    );

    console.log(`❌ Senhas em texto plano: ${plainPasswords.length}`);
    console.log(`✓ Senhas hasheadas: ${hashedPasswords.length}`);

    if (plainPasswords.length > 0) {
      console.log("\n⚠️  Senhas em texto plano encontradas:");
      plainPasswords.forEach((u) => {
        console.log(`   • Email: ${u.email}, Senha: "${u.password}"`);
      });
    }

    // Verificar campos de nome inconsistentes
    const withNome = users.filter((u) => u.nome && !u.name);
    const withName = users.filter((u) => u.name && !u.nome);
    const withBoth = users.filter((u) => u.nome && u.name);

    console.log("\n📝 VERIFICAÇÃO DE CAMPOS DE NOME:\n");
    console.log(`   • Usuarios com 'nome': ${withNome.length}`);
    console.log(`   • Usuários com 'name': ${withName.length}`);
    console.log(`   • Usuários com ambos: ${withBoth.length}`);

    // SOLUÇÃO: Manter apenas 1 usuário por email (o mais recente/completo)
    console.log("\n\n🔧 LIMPEZA SUGERIDA:\n");

    const cleanedUsers = [];
    const processedEmails = new Set();
    const removedUsers = [];

    // Iterar de trás para frente para manter o último registro (mais recente)
    for (let i = users.length - 1; i >= 0; i--) {
      const user = users[i];

      if (!processedEmails.has(user.email)) {
        // Garantir que a senha está hasheada
        if (user.password && user.password.length < 32) {
          console.log(
            `   ✓ Hasheando senha para ${user.email} (senha: "${user.password}")`
          );
          user.password = hashPassword(user.password);
        }

        // Normalizar campos (usar 'name' ou 'nome')
        if (!user.name && user.nome) {
          user.name = user.nome;
          delete user.nome;
        } else if (user.nome) {
          delete user.nome;
        }

        cleanedUsers.unshift(user); // Adicionar no início para manter ordem
        processedEmails.add(user.email);
      } else {
        removedUsers.push(user);
        console.log(
          `   ❌ Removeria usuário duplicado: ${user.email} (ID: ${user.id})`
        );
      }
    }

    console.log(
      `\n✓ Resultado: ${users.length} → ${cleanedUsers.length} usuários`
    );
    console.log(`✓ ${removedUsers.length} usuários duplicados seriam removidos\n`);

    // Salvar resultado em arquivo
    const outputFile = path.join(
      process.cwd(),
      "database_cleaned.json"
    );
    fs.writeFileSync(outputFile, JSON.stringify(cleanedUsers, null, 2));

    console.log(
      `\n✅ Banco corrigido salvo em: ${outputFile}`
    );

    console.log("\n\n📊 RESUMO FINAL DO BANCO CORRIGIDO:\n");
    console.log("Usuários após limpeza:");
    cleanedUsers.forEach((u, idx) => {
      const hashedCheck = u.password && u.password.length === 64 ? "✓" : "✗";
      console.log(
        `   ${idx + 1}. ${u.email}`
      );
      console.log(`      ID: ${u.id}`);
      console.log(`      Senha hasheada: ${hashedCheck}`);
      console.log(`      Nome: ${u.name || u.nome || "N/A"}`);
      if (u.saldo_final !== undefined) {
        console.log(`      Saldo: ${u.saldo_final}`);
      }
      console.log();
    });

    console.log("\n\n📋 PRÓXIMOS PASSOS:\n");
    console.log("1. Revise o arquivo 'database_cleaned.json'");
    console.log("2. Se estiver correto, substitua o banco remoto por este arquivo");
    console.log("3. Ou use um endpoint no seu servidor para fazer essa limpeza automaticamente");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

// Executar
fixDatabaseFromRemote();
