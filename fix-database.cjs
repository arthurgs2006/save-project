const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const USERS_FILE = "./database/users.json";

// Função para fazer hash SHA-256 (compatível com o frontend)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Função para limpar o banco de dados
function fixDatabase() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    let users = JSON.parse(data);

    console.log(`✓ Carregado banco com ${users.length} usuários`);
    console.log("\n📋 ANÁLISE DO BANCO:\n");

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

    console.log(`Emails duplicados encontrados: ${duplicateEmails.length}`);
    duplicateEmails.forEach(([email, indices]) => {
      console.log(`  • ${email}: ${indices.length} registros (índices: ${indices.join(", ")})`);
    });

    console.log("\n🔐 VERIFICAÇÃO DE SENHAS:\n");

    // Análise: senhas em texto plano vs hasheadas
    const plainPasswords = users.filter((u) => u.password && u.password.length < 32);
    const hashedPasswords = users.filter((u) => u.password && u.password.length >= 32);

    console.log(`Senhas em texto plano: ${plainPasswords.length}`);
    console.log(`Senhas hasheadas: ${hashedPasswords.length}`);

    if (plainPasswords.length > 0) {
      console.log("\n⚠️  Exemplos de senhas em texto plano:");
      plainPasswords.slice(0, 3).forEach((u) => {
        console.log(`  • Email: ${u.email}, Senha: ${u.password}`);
      });
    }

    // SOLUÇÃO: Manter apenas 1 usuário por email (o mais recente/completo)
    console.log("\n\n🔧 LIMPEZA DO BANCO:\n");

    const cleanedUsers = [];
    const processedEmails = new Set();

    // Iterar de trás para frente para manter o último registro
    for (let i = users.length - 1; i >= 0; i--) {
      const user = users[i];

      if (!processedEmails.has(user.email)) {
        // Garantir que a senha está hasheada
        if (user.password && user.password.length < 32) {
          console.log(
            `Hasheando senha para ${user.email} (senha: "${user.password}")`
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
        console.log(
          `❌ Removido usuário duplicado: ${user.email} (ID: ${user.id})`
        );
      }
    }

    console.log(
      `\n✓ Banco limpo: ${users.length} → ${cleanedUsers.length} usuários`
    );

    // Salvar banco limpo
    fs.writeFileSync(USERS_FILE, JSON.stringify(cleanedUsers, null, 2));

    console.log("\n✅ Banco de dados corrigido com sucesso!");
    console.log(`\n📝 Novo banco salvo em: ${USERS_FILE}`);

    // Exibir resumo final
    console.log("\n\n📊 RESUMO FINAL:\n");
    console.log("Usuários após limpeza:");
    cleanedUsers.forEach((u) => {
      console.log(`  • ${u.email} (ID: ${u.id}, Senha hasheada: ${u.password.length === 64 ? "✓" : "✗"})`);
    });
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

// Executar
fixDatabase();
