const express = require("express")
const fs = require("fs")
const cors = require("cors")
const crypto = require("crypto")
const { PluggyClient } = require("pluggy-sdk")

const app = express()
app.use(cors())
app.use(express.json())

const USERS_FILE = "./database/users.json"

// Função para fazer hash SHA-256 (compatível com frontend)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return []

  const data = JSON.parse(fs.readFileSync(USERS_FILE))

  if (!Array.isArray(data)) {
    return []
  }

  return data
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

app.post("/users", (req, res) => {

  const { nome, email, password, saldo_final, preferencias, extratos, id } = req.body

  // validar campos obrigatórios
  if (!nome || !email || !password) {
    return res.status(400).json({
      error: "Todos os campos são obrigatórios"
    })
  }

  // validar campos vazios
  else if (
    nome.trim() === "" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    return res.status(400).json({
      error: "Campos não podem estar vazios"
    })
  }

  // validar tipos
  else if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      error: "Tipos de dados inválidos"
    })
  }

  // validar email
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "Email inválido"
    })
  }

  const users = readUsers()

  const newUser = {
    id: id || Date.now().toString(),
    nome,
    email,
    password,
    saldo_final: saldo_final || 0,
    preferencias: preferencias || [],
    extratos: extratos || []
  }

  users.push(newUser)
  writeUsers(users)

  res.status(201).json({
    message: "Usuário criado com sucesso",
    user: newUser
  })

})

app.get("/users", (req, res) => {
  console.log("GET /users called")
  const users = readUsers()
  res.json(users)
})

app.get("/users/:id", (req, res) => {
  const users = readUsers()
  const user = users.find(u => u.id == req.params.id)
  if (!user) return res.status(404).json({error: "User not found"})
  res.json(user)
})

app.put("/users/:id", (req, res) => {
  const users = readUsers()
  const index = users.findIndex(u => u.id == req.params.id)
  if (index === -1) return res.status(404).json({error: "User not found"})
  users[index] = { ...users[index], ...req.body }
  writeUsers(users)
  res.json(users[index])
})

// ENDPOINT DE LIMPEZA DO BANCO DE DADOS
// POST /cleanup - Remove duplicatas, normaliza senhas e campos
app.post("/cleanup", (req, res) => {
  try {
    const users = readUsers()
    console.log(`[CLEANUP] Iniciando limpeza com ${users.length} usuários...`)

    const emailMap = {}
    const removed = []
    const cleaned = []
    const processedEmails = new Set()

    // Iterar de trás para frente para manter o último registro (mais completo)
    for (let i = users.length - 1; i >= 0; i--) {
      const user = users[i]

      if (!processedEmails.has(user.email)) {
        // Garantir que a senha está hasheada
        if (user.password && user.password.length < 32) {
          console.log(`[CLEANUP] Hasheando senha para ${user.email}`)
          user.password = hashPassword(user.password)
        }

        // Normalizar campos de nome
        if (!user.name && user.nome) {
          user.name = user.nome
        }
        delete user.nome

        cleaned.unshift(user)
        processedEmails.add(user.email)
      } else {
        removed.push(user)
        console.log(`[CLEANUP] Removendo duplicado: ${user.email} (ID: ${user.id})`)
      }
    }

    writeUsers(cleaned)

    res.json({
      success: true,
      message: "Banco de dados limpo com sucesso",
      summary: {
        antes: users.length,
        depois: cleaned.length,
        removidos: removed.length,
        duplicatasRemovidas: removed.map(u => ({ email: u.email, id: u.id })),
        statusSenhas: {
          hasheadas: cleaned.filter(u => u.password && u.password.length === 64).length,
          textoplano: cleaned.filter(u => u.password && u.password.length < 32).length
        }
      }
    })
  } catch (error) {
    console.error("[CLEANUP] Erro:", error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// GET /status - Status do banco de dados
app.get("/status", (req, res) => {
  try {
    const users = readUsers()
    
    const emailMap = {}
    users.forEach(u => {
      if (!emailMap[u.email]) emailMap[u.email] = 0
      emailMap[u.email]++
    })

    const duplicates = Object.entries(emailMap).filter(([_, count]) => count > 1)
    const plainPasswords = users.filter(u => u.password && u.password.length < 32)
    const hashedPasswords = users.filter(u => u.password && u.password.length === 64)

    res.json({
      totalUsuarios: users.length,
      problemas: {
        emailsDuplicados: duplicates.length,
        detalhes: duplicates.map(([email, count]) => ({ email, quantidade: count })),
        senhasTextoplano: plainPasswords.length,
        senhasHasheadas: hashedPasswords.length,
        usuariosProblematicos: [
          ...plainPasswords.map(u => ({ email: u.email, problema: "Senha em texto plano" })),
          ...duplicates.flatMap(([email]) => {
            const dupes = users.filter(u => u.email === email)
            return dupes.slice(0, -1).map(u => ({ email: u.email, id: u.id, problema: "Duplicado" }))
          })
        ]
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

async function handleItemCreated(itemId) {
  console.log("handleItemCreated:", itemId)
  // Adicione aqui a lógica para tratar um item criado, por exemplo gravar no banco de dados.
}

async function handleItemUpdated(itemId) {
  console.log("handleItemUpdated:", itemId)
  // Adicione aqui a lógica para tratar atualizações de item.
}

async function handleItemError(itemId, error) {
  console.error("handleItemError:", itemId, error)
  // Adicione aqui o tratamento de erros do item.
}

app.post("/connect-token", async (req, res) => {
  try {
    const pluggy = new PluggyClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    })

    const { clientUserId } = req.body

    if (!clientUserId) {
      return res.status(400).json({ error: "clientUserId é obrigatório." })
    }

    const connectToken = await pluggy.createConnectToken({
      clientUserId,
    })

    return res.json({ accessToken: connectToken.accessToken })
  } catch (error) {
    console.error("Erro ao criar connect token:", error)
    return res.status(500).json({ error: "Erro interno ao gerar connect token." })
  }
})

app.post("/webhooks/pluggy", async (req, res) => {
  try {
    const event = req.body

    console.log("Received webhook:", event.event)
    console.log("Event ID:", event.eventId)

    switch (event.event) {
      case "item/created":
        await handleItemCreated(event.itemId)
        break
      case "item/updated":
        await handleItemUpdated(event.itemId)
        break
      case "item/error":
        await handleItemError(event.itemId, event.error)
        break
      default:
        console.log("Evento Pluggy não tratado:", event.event)
    }

    return res.json({ received: true })
  } catch (error) {
    console.error("Erro no webhook Pluggy:", error)
    return res.status(500).json({ error: "Falha ao processar webhook." })
  }
})

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001/users")
})