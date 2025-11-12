import React, { useState } from "react";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { hashPassword } from "../../utils/hashPassword";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("http://localhost:3001/users");

      if (!res.ok) {
        alert("Erro ao acessar servidor");
        setLoading(false);
        return;
      }

      const users = await res.json();
      const hashedPassword = await hashPassword(password); // 👈 uso centralizado

      const user = users.find(
        (u: any) => u.email === email && u.password === hashedPassword
      );

      if (!user) {
        alert("Credenciais inválidas");
        setLoading(false);
        return;
      }

      localStorage.setItem("loggedUser", JSON.stringify(user));
      navigate("/homescreen");
    } catch (err) {
      alert("Erro ao conectar ao servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="d-flex align-items-center justify-content-center vh-100 vw-100 background-color">
      <Container className="d-flex justify-content-center align-items-center flex-column">
        <motion.div
          className="text-white w-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: "420px" }}
        >
          <div className="text-start mb-4">
            <motion.h3 className="fw-bold">Continue a experiência,</motion.h3>
            <motion.div className="fs-4">com sua conta</motion.div>
          </div>

          <motion.div
            className="p-4 rounded w-100"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(6px)"
            }}
          >
            <Form onSubmit={handleLogin}>
              <FormGroup className="text-start">
                <Label htmlFor="email" className="fw-bold text-white">Email</Label>
                <Input id="email" name="email" type="email" placeholder="@email.com" required />
              </FormGroup>

              <FormGroup className="text-start">
                <Label htmlFor="password" className="fw-bold text-white">Senha</Label>
                <Input id="password" name="password" type="password" placeholder="********" required />
              </FormGroup>

              <Button color="primary" type="submit" className="w-100 mt-3 rounded-pill fw-bold py-2" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </Form>
          </motion.div>
        </motion.div>
      </Container>
    </main>
  );
}