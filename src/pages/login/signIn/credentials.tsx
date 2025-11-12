import { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";

export default function Credentials({ onNext }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Digite seu nome completo.");
      return;
    }

    if (formData.password !== formData.confirm) {
      alert("As senhas não coincidem");
      return;
    }

    // ✅ Envia dados para CreditProfile
    onNext({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
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
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="fw-bold"
            >
              Bem-vindo ao app
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="fs-4"
            >
              save
            </motion.div>
          </div>

          <motion.div
            className="p-4 rounded w-100"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Form onSubmit={handleSubmit}>
              <FormGroup className="text-start">
                <Label htmlFor="name" className="fw-bold text-white">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="custom-input"
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup className="text-start">
                <Label htmlFor="email" className="fw-bold text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="@email.com"
                  required
                  className="custom-input"
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup className="text-start">
                <Label htmlFor="password" className="fw-bold text-white">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                  className="custom-input"
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup className="text-start">
                <Label htmlFor="confirm" className="fw-bold text-white">
                  Confirmar senha
                </Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="********"
                  required
                  className="custom-input"
                  onChange={handleChange}
                />
              </FormGroup>

              <Button
                color="primary"
                type="submit"
                className="w-100 mt-3 rounded-pill fw-bold py-2"
              >
                Cadastrar
              </Button>
            </Form>
          </motion.div>
        </motion.div>
      </Container>
    </main>
  );
}
