import { useEffect, useState } from "react";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
} from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import { motion } from "framer-motion";

export default function RegisterRecurringDebt() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [billingDate, setBillingDate] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);


  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!user) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    if (!name || !value || !category || !billingDate) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const newDebt = {
      id: Date.now(),
      name,
      value: Number(value),
      category,
      frequency,
      billingDate: Number(billingDate), 
      description,
    };

    const updatedUser = {
      ...user,
      recurringDebts: [...(user.recurringDebts || []), newDebt],
    };

    try {
      setSaving(true);

      const res = await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) {
        alert("Erro ao salvar débito recorrente!");
        setSaving(false);
        return;
      }

      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setName("");
      setValue("");
      setCategory("");
      setFrequency("monthly");
      setBillingDate("");
      setDescription("");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-vh-100 text-white background-color">
      <Container className="pb-5">
        <AccountHeader />
        <TitleHeader 
            title="Registrar Débito Recorrente" 
            backLink="/registerDebt/" 
          />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Form
            onSubmit={handleSubmit}
            className="p-3 mt-3 rounded shadow-lg bg-dark"
          >
            <FormGroup>
              <Label for="name">Nome do Serviço</Label>
              <Input
                id="name"
                placeholder="ex: Netflix, Spotify, Academia..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="29.90"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="category">Categoria</Label>
                  <Input
                    id="category"
                    type="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option>Streaming</option>
                    <option>Educação</option>
                    <option>Saúde</option>
                    <option>Transporte</option>
                    <option>Serviços</option>
                    <option>Estética</option>
                    <option>Outros</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="frequency">Frequência</Label>
                  <Input
                    id="frequency"
                    type="select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="billingDate">Dia da Cobrança</Label>
                  <Input
                    id="billingDate"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="1 a 31"
                    value={billingDate}
                    onChange={(e) => {
                      const day = e.target.value;
                      if (day === "" || (Number(day) >= 1 && Number(day) <= 31)) {
                        setBillingDate(day);
                      }
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label for="description">Descrição (opcional)</Label>
              <Input
                id="description"
                type="textarea"
                placeholder="Informações adicionais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormGroup>

            <Button
              type="submit"
              color="primary"
              disabled={saving}
              className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-plus-circle-fill"></i>
              {saving ? "Salvando..." : "Registrar Débito"}
            </Button>

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-success text-center mt-3 fw-bold"
              >
                ✔ Débito recorrente registrado!
              </motion.div>
            )}
          </Form>
        </motion.div>
      </Container>
    </div>
  );
}
