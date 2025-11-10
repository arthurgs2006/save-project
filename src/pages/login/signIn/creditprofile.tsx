import { useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import SelectGrid from "../../../components/graphic_components/selectGrid";
import ButtonW_100 from "../../../components/generic_components/btn";

export default function CreditProfile({ credentials }) {
  const [preferences, setPreferences] = useState([]);

  async function saveUser() {
    const newUser = {
      userId: crypto.randomUUID(),
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      preferences,
      balance: 0,
      extract: []
    };

    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        alert("Usuário criado com sucesso!");
      } else {
        alert("Erro ao criar usuário!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor.");
    }
  }

  return (
    <Container className="d-flex flex-column gap-5 justify-content-center align-items-center h-100">

      <motion.header
        className="pt-5 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="fw-bold">Selecione suas despesas</h1>
        <span className="opacity-75">
          Selecione os tipos de gastos que queira monitorar:
        </span>
      </motion.header>

      <motion.div
        className="w-100"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      >
        <SelectGrid onChange={setPreferences} />
      </motion.div>

      <motion.div
        className="w-100"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.25 }}
      >
        <ButtonW_100 label="Finalizar Cadastro" onClick={saveUser} />
      </motion.div>

    </Container>
  );
}
