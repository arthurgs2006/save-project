import { useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import SelectGrid from "../../../components/graphic_components/selectGrid";
import ButtonW_100 from "../../../components/generic_components/btn";

export default function CreditProfile({ credentials, onFinish }) {
  const [preferences, setPreferences] = useState([]);

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function finishStep() {
    const passwordHashed = await hashPassword(credentials.password);

    onFinish({
      id: crypto.randomUUID(),
      preferencias: {
        categorias_favoritas: preferences,
        tema_app: "dark",
        notificacoes: true
      },
      passwordHashed
    });
  }

  return (
    <Container className="d-flex flex-column gap-5 justify-content-center align-items-center h-100">

      <motion.header
        className="pt-5 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="fw-bold">Selecione suas despesas</h1>
        <span className="opacity-75">Escolha os tipos de gastos que mais usa</span>
      </motion.header>

      <motion.div className="w-100">
        <SelectGrid onChange={setPreferences} />
      </motion.div>

      <motion.div className="w-100">
        <ButtonW_100 
          label="Continuar"
          onClick={finishStep}
        />

      </motion.div>

    </Container>
  );
}
