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
import AlertModal from "../../components/generic_components/AlertModal";

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
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

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
            setAlert({ isOpen: true, message: "Usuário não encontrado. Faça login novamente.", type: "danger" });
            return;
        }

        if (!name || !value || !category || !billingDate) {
            setAlert({ isOpen: true, message: "Preencha todos os campos obrigatórios.", type: "warning" });
            return;
        }

        const numericValue = Number(value);
        const numericBillingDate = Number(billingDate);

        if (isNaN(numericValue) || numericValue <= 0) {
            setAlert({ isOpen: true, message: "Digite um valor válido.", type: "warning" });
            return;
        }

        if (
            isNaN(numericBillingDate) ||
            numericBillingDate < 1 ||
            numericBillingDate > 31
        ) {
            setAlert({ isOpen: true, message: "Informe um dia de cobrança válido.", type: "warning" });
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
            setAlert({ isOpen: true, message: "Erro ao conectar ao servidor.", type: "danger" });
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <AccountHeader name={user?.nome} />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="home-main"
                >
                    <TitleHeader
                        title="Registrar Débito Recorrente"
                        backLink="/registerDebt/"
                    />

                    <section className="home-section">
                        <div className="home-graph-card mt-3">
                            <Form onSubmit={handleSubmit}>
                                <FormGroup className="mb-4">
                                    <Label for="name" className="fw-semibold mb-2">
                                        Nome do serviço
                                    </Label>
                                    <Input
                                        id="name"
                                        className="custom-input-balance"
                                        placeholder="Ex: Netflix, Spotify, Academia..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </FormGroup>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup className="mb-4">
                                            <Label for="value" className="fw-semibold mb-2">
                                                Valor (R$)
                                            </Label>
                                            <Input
                                                id="value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="custom-input-balance"
                                                placeholder="29.90"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col md={6}>
                                        <FormGroup className="mb-4">
                                            <Label for="category" className="fw-semibold mb-2">
                                                Categoria
                                            </Label>
                                            <Input
                                                id="category"
                                                type="select"
                                                className="custom-input-balance"
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
                                        <FormGroup className="mb-4">
                                            <Label for="frequency" className="fw-semibold mb-2">
                                                Frequência
                                            </Label>
                                            <Input
                                                id="frequency"
                                                type="select"
                                                className="custom-input-balance"
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
                                        <FormGroup className="mb-4">
                                            <Label for="billingDate" className="fw-semibold mb-2">
                                                Dia da cobrança
                                            </Label>
                                            <Input
                                                id="billingDate"
                                                type="number"
                                                min={1}
                                                max={31}
                                                className="custom-input-balance"
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
                                    <Label for="description" className="fw-semibold mb-2">
                                        Descrição (opcional)
                                    </Label>
                                    <Input
                                        id="description"
                                        type="textarea"
                                        className="custom-input-balance"
                                        placeholder="Informações adicionais..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ minHeight: "120px", resize: "none" }}
                                    />
                                </FormGroup>

                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={saving}
                                    className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2 fw-semibold py-3"
                                    style={{ borderRadius: "999px", fontSize: "0.98rem" }}
                                >
                                    <i className="bi bi-plus-circle-fill"></i>
                                    {saving ? "Salvando..." : "Registrar débito"}
                                </Button>

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="text-center mt-3 fw-semibold"
                                        style={{ color: "#67d9b2" }}
                                    >
                                        Débito recorrente registrado!
                                    </motion.div>
                                )}
                            </Form>
                        </div>
                    </section>
                </motion.div>
            </Container>
            {alert && (
                <AlertModal
                    isOpen={alert.isOpen}
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </main>
    );
}