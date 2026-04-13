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

type Frequency = "monthly" | "weekly" | "daily" | "yearly";

interface RecurringCredit {
    id: number;
    name: string;
    value: number;
    category: string;
    frequency: Frequency;
    billingDate: number;
    description: string;
    createdAt: string;
}

interface User {
    id: number;
    nome?: string;
    saldo_final?: number;
    recurringCredits?: RecurringCredit[];
    extratos?: Array<{
        id: number | string;
        data: string;
        hora?: string;
        dataHora?: string;
        descricao?: string;
        valor: number;
        tipo: "credito" | "debito";
        status?: string;
    }>;
}

export default function RegisterRecurringCredit() {
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

        const newCredit: RecurringCredit = {
            id: Date.now(),
            name: name.trim(),
            value: numericValue,
            category,
            frequency,
            billingDate: numericBillingDate,
            description: description.trim(),
            createdAt: new Date().toISOString(),
        };

        const newStatement = {
            id: Date.now(),
            data: new Date().toLocaleDateString("pt-BR"),
            hora: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            dataHora: `${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`,
            descricao: `Crédito recorrente cadastrado: ${newCredit.name}`,
            valor: numericValue,
            tipo: "credito" as const,
            status: "Recorrente",
        };

        const updatedUser: User = {
            ...user,
            saldo_final: Number(user.saldo_final ?? 0) + numericValue,
            recurringCredits: [...(user.recurringCredits || []), newCredit],
            extratos: [...(user.extratos || []), newStatement],
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
                throw new Error("Erro ao salvar crédito recorrente");
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
                        title="Registrar Crédito Recorrente"
                        backLink="/registerDebt/"
                    />

                    <section className="home-section">
                        <div className="home-graph-card mt-3">
                            <Form onSubmit={handleSubmit}>
                                <FormGroup className="mb-4">
                                    <Label for="name" className="fw-semibold mb-2">
                                        Nome do crédito
                                    </Label>
                                    <Input
                                        id="name"
                                        className="custom-input-balance"
                                        placeholder="Ex: Salário extra, Venda, Comissão..."
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
                                                placeholder="150.00"
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
                                                <option value="Renda Extra">Renda Extra</option>
                                                <option value="Freelance">Freelance</option>
                                                <option value="Investimentos">Investimentos</option>
                                                <option value="Reembolso">Reembolso</option>
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
                                                <option value="daily">Diária</option>
                                                <option value="weekly">Semanal</option>
                                                <option value="monthly">Mensal</option>
                                                <option value="yearly">Anual</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>

                                    <Col md={6}>
                                        <FormGroup className="mb-4">
                                            <Label for="billingDate" className="fw-semibold mb-2">
                                                Dia de recebimento
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
                                                    setBillingDate(day);
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <FormGroup className="mb-4">
                                    <Label for="description" className="fw-semibold mb-2">
                                        Descrição (opcional)
                                    </Label>
                                    <Input
                                        id="description"
                                        type="textarea"
                                        className="custom-input-balance"
                                        placeholder="Detalhes adicionais"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </FormGroup>

                                <div className="d-flex justify-content-end gap-3">
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={resetForm}
                                    >
                                        Limpar
                                    </Button>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        disabled={saving}
                                    >
                                        {saving ? "Salvando..." : "Salvar Crédito"}
                                    </Button>
                                </div>

                                {success && (
                                    <div className="alert alert-success mt-4">
                                        Crédito recorrente cadastrado com sucesso!
                                    </div>
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
