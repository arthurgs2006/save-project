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
    const newUser = req.body as User;

    if (!newUser.name || !newUser.email || !newUser.password) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    users.push(newUser);
    writeUsers(users);

    return res.status(201).json({ message: "Usuário criado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`API rodando em https://database-save-app.vercel.app/users:${PORT}`);
});