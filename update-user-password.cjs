const fs = require("fs");
const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const dbPath = "./database_cleaned.json";
const users = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

// Encontrar usuário
const userIndex = users.findIndex(u => u.email === "arthurgonsal@hotmail.com");

if (userIndex === -1) {
  console.log("❌ Usuário não encontrado!");
  process.exit(1);
}

const user = users[userIndex];
console.log("👤 Usuário encontrado:");
console.log(`   Email: ${user.email}`);
console.log(`   ID: ${user.id}`);
console.log(`   Senha atual: "123"`);
console.log(`   Saldo: ${user.saldo_final}`);

// Atualizar senha
const newPassword = "123456";
const hashedPassword = hashPassword(newPassword);
user.password = hashedPassword;

// Salvar
fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

console.log("\n✅ Senha atualizada com sucesso!");
console.log(`\n🔐 Nova senha: "${newPassword}"`);
console.log(`   Hash: ${hashedPassword}`);
console.log("\n👉 Agora você pode logar com:");
console.log(`   Email: arthurgonsal@hotmail.com`);
console.log(`   Senha: 123456`);
