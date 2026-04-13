const express = require("express")
const fs = require("fs")
const cors = require("cors")
const { PluggyClient } = require("pluggy-sdk")

const app = express()
app.use(cors())
app.use(express.json())

const USERS_FILE = "./database/users.json"

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