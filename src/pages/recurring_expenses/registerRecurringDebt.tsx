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
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

type Frequency = "monthly" | "weekly" | "yearly";

interface RecurringDebt {
    id: number;
    name: string;
    value: number;
    category: string;
    frequency: Frequency;
    billingDate: number;
    description: string;
}

interface User {
    id: number;
    nome?: string;
    recurringDebts?: RecurringDebt[];
}

export default function RegisterRecurringDebt() {
    const [user, setUser] = useState<User | null>(null);

    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [category, setCategory] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
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

    function resetForm() {
        setName("");
        setValue("");
        setCategory("");
        setFrequency("monthly");
        setBillingDate("");
        setDescription("");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!user) {
            alert("Usuário não encontrado. Faça login novamente.");
            return;
        }

        if (!name || !value || !category || !billingDate) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const numericValue = Number(value);
        const numericBillingDate = Number(billingDate);

        if (isNaN(numericValue) || numericValue <= 0) {
            alert("Digite um valor válido.");
            return;
        }

        if (
            isNaN(numericBillingDate) ||
            numericBillingDate < 1 ||
            numericBillingDate > 31
        ) {
            alert("Informe um dia de cobrança válido.");
            return;
        }

        const newDebt: RecurringDebt = {
            id: Date.now(),
            name: name.trim(),
            value: numericValue,
            category,
            frequency,
            billingDate: numericBillingDate,
            description: description.trim(),
        };

        const updatedUser: User = {
            ...user,
            recurringDebts: [...(user.recurringDebts || []), newDebt],
        };

        try {
            setSaving(true);

            const response = await fetch(
                `https://database-save-app.onrender.com/users/${user.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao salvar débito recorrente");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
            resetForm();

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar ao servidor.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-vh-100 text-white background-color py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={user?.nome} />
                <TitleHeader
                    title="Registrar Débito Recorrente"
                    backLink="/registerDebt/"
                />

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="home-main"
                >
                    <div className="home-graph-card mt-3">
                        <Form onSubmit={handleSubmit}>
                            <FormGroup className="mb-3">
                                <Label for="name">Nome do Serviço</Label>
                                <Input
                                    id="name"
                                    className="custom-input"
                                    placeholder="Ex: Netflix, Spotify, Academia..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormGroup>

                            <Row>
                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Label for="value">Valor (R$)</Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="custom-input"
                                            placeholder="29.90"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Label for="category">Categoria</Label>
                                        <Input
                                            id="category"
                                            type="select"
                                            className="custom-input"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Streaming">Streaming</option>
                                            <option value="Educação">Educação</option>
                                            <option value="Saúde">Saúde</option>
                                            <option value="Transporte">Transporte</option>
                                            <option value="Serviços">Serviços</option>
                                            <option value="Estética">Estética</option>
                                            <option value="Outros">Outros</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Label for="frequency">Frequência</Label>
                                        <Input
                                            id="frequency"
                                            type="select"
                                            className="custom-input"
                                            value={frequency}
                                            onChange={(e) =>
                                                setFrequency(e.target.value as Frequency)
                                            }
                                        >
                                            <option value="monthly">Mensal</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="yearly">Anual</option>
                                        </Input>
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup className="mb-3">
                                        <Label for="billingDate">Dia da Cobrança</Label>
                                        <Input
                                            id="billingDate"
                                            type="number"
                                            min={1}
                                            max={31}
                                            className="custom-input"
                                            placeholder="1 a 31"
                                            value={billingDate}
                                            onChange={(e) => {
                                                const day = e.target.value;

                                                if (
                                                    day === "" ||
                                                    (Number(day) >= 1 && Number(day) <= 31)
                                                ) {
                                                    setBillingDate(day);
                                                }
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup className="mb-0">
                                <Label for="description">Descrição (opcional)</Label>
                                <Input
                                    id="description"
                                    type="textarea"
                                    className="custom-input"
                                    placeholder="Informações adicionais..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </FormGroup>

                            <Button
                                type="submit"
                                color="primary"
                                disabled={saving}
                                className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                                style={{ borderRadius: "18px" }}
                            >
                                <i className="bi bi-plus-circle-fill"></i>
                                {saving ? "Salvando..." : "Registrar Débito"}
                            </Button>

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-center mt-3 fw-bold"
                                    style={{ color: "#00c853" }}
                                >
                                    ✔ Débito recorrente registrado!
                                </motion.div>
                            )}
                        </Form>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
}