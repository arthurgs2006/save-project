const express = require("express")
const fs = require("fs")
const cors = require("cors")

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

  const { name, email, password } = req.body

  // validar campos obrigatórios
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Todos os campos são obrigatórios"
    })
  }

  // validar campos vazios
  else if (
    name.trim() === "" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    return res.status(400).json({
      error: "Campos não podem estar vazios"
    })
  }

  // validar tipos
  else if (
    typeof name !== "string" ||
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
    id: Date.now(),
    name,
    email,
    password
  }

  users.push(newUser)
  writeUsers(users)

  res.status(201).json({
    message: "Usuário criado com sucesso",
    user: newUser
  })

})

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001/users")
})