import express, { type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const usersFile = path.resolve(__dirname, "../../users.json");

interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  preferences: string[];
  balance: number;
  extract: any[];
}

function readUsers(): User[] {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, "utf-8");

  try {
    return JSON.parse(data) as User[];
  } catch (e) {
    console.error("Erro ao parsear users.json:", e);
    return [];
  }
}

function writeUsers(users: User[]) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

app.post("/api/users", (req: Request, res: Response) => {
  try {
    const users = readUsers();

    const { name, email, password } = req.body;

    // 1️⃣ verificar se os campos existem
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios."
      });
    }

    // 2️⃣ verificar se estão vazios
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        error: "Campos não podem estar vazios."
      });
    }

    // 3️⃣ validar tipos
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Tipos de dados inválidos."
      });
    }

    // 4️⃣ validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email inválido."
      });
    }

    // 5️⃣ verificar se usuário já existe
    const userExists = users.find((u) => u.email === email);

    if (userExists) {
      return res.status(409).json({
        error: "Usuário já cadastrado."
      });
    }

    const newUser: User = {
      userId: crypto.randomUUID(),
      name,
      email,
      password,
      preferences: [],
      balance: 0,
      extract: []
    };

    users.push(newUser);
    writeUsers(users);

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: newUser
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Erro interno no servidor."
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}/api/users`);
});