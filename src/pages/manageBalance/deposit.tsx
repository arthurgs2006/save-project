import { useEffect, useMemo, useState } from "react";
import {
    Container,
    Row,
    Col,
    Input,
    Label,
    Button,
    ListGroup,
    ListGroupItem,
} from "reactstrap";
import { motion } from "framer-motion";
import TitleHeader from "../../components/generic_components/titleHeader";

interface DepositStatement {
    id: number;
    transactionId: string;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
    dataHora: string;
    createdAt: string;
    status: "concluido";
    metodo: "saldo_manual";
    origem: "deposito";
    goalId?: number | null;
    goalName?: string | null;
}

interface GoalDeposit {
    id: number;
    transactionId: string;
    value: number;
    time: string;
    date: string;
    hour: string;
    dateTimeLabel: string;
    status: "concluido";
    method: "saldo_manual";
}

interface Goal {
    id: number;
    name: string;
    deposits?: GoalDeposit[];
}

interface User {
    id: number;
    saldo_final: number;
    extratos: DepositStatement[];
    goals?: Goal[];
}

interface DepositMetadata {
    id: number;
    transactionId: string;
    createdAt: string;
    date: string;
    hour: string;
    dateTimeLabel: string;
}

export default function DepositPage() {
    const [user, setUser] = useState<User | null>(null);
    const [depositValue, setDepositValue] = useState("");
    const [selectedGoal, setSelectedGoal] = useState("none");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) return;

            const parsedUser = JSON.parse(storedUser);

            try {
                const response = await fetch(
                    `https://database-save-app.onrender.com/users/${parsedUser.id}`
                );

                if (!response.ok) {
                    throw new Error("Erro ao carregar usuário");
                }

                const data: User = await response.json();
                setUser(data);
            } catch {
                console.warn("Erro ao carregar usuário.");
            }
        }

        loadUser();
    }, []);

    const recentStatements = useMemo(() => {
        if (!user?.extratos?.length) return [];
        return [...user.extratos].reverse().slice(0, 5);
    }, [user]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function buildDepositMetadata(): DepositMetadata {
        const now = new Date();
        const timestamp = now.getTime();

        const date = now.toLocaleDateString("pt-BR");
        const hour = now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        return {
            id: timestamp,
            transactionId: `DEP-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: now.toISOString(),
            date,
            hour,
            dateTimeLabel: `${date} às ${hour}`,
        };
    }

    function createDepositStatement(
        meta: DepositMetadata,
        deposit: number,
        selectedGoalData: Goal | null
    ): DepositStatement {
        return {
            id: meta.id,
            transactionId: meta.transactionId,
            tipo: "credito",
            descricao: selectedGoalData
                ? `Depósito na meta: ${selectedGoalData.name}`
                : "Depósito realizado no saldo geral",
            valor: deposit,
            data: meta.date,
            hora: meta.hour,
            dataHora: meta.dateTimeLabel,
            createdAt: meta.createdAt,
            status: "concluido",
            metodo: "saldo_manual",
            origem: "deposito",
            goalId: selectedGoalData?.id ?? null,
            goalName: selectedGoalData?.name ?? null,
        };
    }

    function createGoalDeposit(meta: DepositMetadata, deposit: number): GoalDeposit {
        return {
            id: meta.id,
            transactionId: meta.transactionId,
            value: deposit,
            time: meta.createdAt,
            date: meta.date,
            hour: meta.hour,
            dateTimeLabel: meta.dateTimeLabel,
            status: "concluido",
            method: "saldo_manual",
        };
    }

    async function handleDeposit() {
        if (!user) {
            alert("Usuário não encontrado. Faça login novamente.");
            return;
        }

        const deposit = Number(depositValue.replace(",", "."));

        if (isNaN(deposit) || deposit <= 0) {
            alert("Digite um valor válido!");
            return;
        }

        const meta = buildDepositMetadata();
        const newBalance = Number(user.saldo_final || 0) + deposit;

        const selectedGoalData =
            selectedGoal === "none"
                ? null
                : user.goals?.find((goal) => goal.id === Number(selectedGoal)) || null;

        const newStatement = createDepositStatement(meta, deposit, selectedGoalData);

        let updatedGoals = [...(user.goals || [])];

        if (selectedGoalData) {
            const goalDeposit = createGoalDeposit(meta, deposit);

            updatedGoals = updatedGoals.map((goal) =>
                goal.id === selectedGoalData.id
                    ? {
                        ...goal,
                        deposits: [...(goal.deposits || []), goalDeposit],
                    }
                    : goal
            );
        }

        const updatedUser: User = {
            ...user,
            saldo_final: newBalance,
            extratos: [...(user.extratos || []), newStatement],
            goals: updatedGoals,
        };

        try {
            setLoading(true);

            const response = await fetch(
                `https://database-save-app.onrender.com/users/${user.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao atualizar dados");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setDepositValue("");
            setSelectedGoal("none");
            setSuccess(true);

            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Erro ao realizar depósito.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <Row className="justify-content-center">
                    <Col lg={7} md={9}>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="home-main"
                        >
                            <TitleHeader title="Depositar" />

                            {!user ? (
                                <div className="home-empty-state mt-4 text-center">
                                    Carregando informações...
                                </div>
                            ) : (
                                <>
                                    <section className="home-balance-wrap">
                                        <p className="home-balance-label">Saldo atual</p>

                                        <motion.h2
                                            key={user.saldo_final}
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="home-balance-value"
                                            style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)" }}
                                        >
                                            R$ {formatCurrency(Number(user.saldo_final || 0))}
                                        </motion.h2>
                                    </section>

                                    <section className="home-section">
                                        <div
                                            className="home-list-item"
                                            style={{ cursor: "default" }}
                                        >
                                            <div className="w-100">
                                                <Label className="fw-semibold mb-3 d-block">
                                                    Valor do depósito
                                                </Label>

                                                <div className="d-flex align-items-center gap-3">
                                                    <span
                                                        className="fw-bold"
                                                        style={{
                                                            fontSize: "1.25rem",
                                                            color: "#fff",
                                                            minWidth: "30px",
                                                        }}
                                                    >
                                                        R$
                                                    </span>

                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={depositValue}
                                                        onChange={(e) =>
                                                            setDepositValue(e.target.value)
                                                        }
                                                        placeholder="0,00"
                                                        className="custom-input-balance text-center fw-bold"
                                                        style={{ fontSize: "1.08rem" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="home-section">
                                        <div
                                            className="home-list-item"
                                            style={{ cursor: "default" }}
                                        >
                                            <div className="w-100">
                                                <Label className="fw-semibold mb-3 d-block">
                                                    Direcionar depósito para
                                                </Label>

                                                <Input
                                                    type="select"
                                                    value={selectedGoal}
                                                    onChange={(e) => setSelectedGoal(e.target.value)}
                                                    className="custom-input-balance"
                                                >
                                                    <option value="none">Saldo geral</option>
                                                    {user.goals?.map((goal) => (
                                                        <option key={goal.id} value={goal.id}>
                                                            {goal.name}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="home-section">
                                        <Button
                                            color="primary"
                                            onClick={handleDeposit}
                                            disabled={loading}
                                            className="w-100 fw-semibold py-3"
                                            style={{
                                                borderRadius: "999px",
                                                fontSize: "0.98rem",
                                            }}
                                        >
                                            {loading ? "Processando..." : "Confirmar depósito"}
                                        </Button>

                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="text-center mt-3 fw-semibold"
                                                style={{ color: "#67d9b2" }}
                                            >
                                                Depósito realizado com sucesso.
                                            </motion.div>
                                        )}
                                    </section>

                                    {recentStatements.length > 0 && (
                                        <section className="home-section mt-5">
                                            <div className="home-section-header">
                                                <h5 className="home-section-title">Histórico</h5>
                                            </div>

                                            <ListGroup flush className="home-list">
                                                {recentStatements.map((transaction) => (
                                                    <ListGroupItem
                                                        key={transaction.id}
                                                        className="home-list-item"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <div className="home-list-left">
                                                            <div className="home-list-icon">
                                                                <i className="bi bi-arrow-down-left"></i>
                                                            </div>

                                                            <div className="home-item-copy">
                                                                <p className="home-item-title mb-1">
                                                                    {transaction.descricao}
                                                                </p>

                                                                <small className="home-item-subtitle d-block">
                                                                    {transaction.dataHora}
                                                                </small>

                                                                <small className="home-item-meta d-block">
                                                                    ID: {transaction.transactionId}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        <div className="text-end">
                                                            <span className="home-item-value home-item-value-credit d-block">
                                                                + R$ {formatCurrency(Number(transaction.valor))}
                                                            </span>

                                                            <small className="home-item-meta text-capitalize">
                                                                {transaction.status}
                                                            </small>
                                                        </div>
                                                    </ListGroupItem>
                                                ))}
                                            </ListGroup>
                                        </section>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}