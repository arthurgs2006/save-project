import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Input,
    Label,
    Button,
    Card,
    CardBody,
    ListGroup,
    ListGroupItem,
} from "reactstrap";
import { motion } from "framer-motion";
import TitleHeader from "../../components/generic_components/titleHeader";

interface DepositStatement {
    id: number;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
}

interface GoalDeposit {
    id: number;
    value: number;
    time: string;
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

export default function DepositPage() {
    const [user, setUser] = useState<User | null>(null);
    const [depositValue, setDepositValue] = useState<string>("");
    const [selectedGoal, setSelectedGoal] = useState<string>("none");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (!stored) return;

        const parsed = JSON.parse(stored);

        fetch(`https://database-save-app.onrender.com/users/${parsed.id}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(() => console.warn("Erro ao carregar usuário."));
    }, []);

    async function handleDeposit() {
        if (!user) {
            alert("Usuário não encontrado. Faça login novamente.");
            return;
        }

        const deposit = Number(depositValue);

        if (isNaN(deposit) || deposit <= 0) {
            alert("Digite um valor válido!");
            return;
        }

        const newBalance = (user.saldo_final || 0) + deposit;

        const goalName =
            selectedGoal === "none"
                ? null
                : user.goals?.find((g) => g.id === Number(selectedGoal))?.name;

        const newStatement: DepositStatement = {
            id: Date.now(),
            tipo: "credito",
            descricao:
                selectedGoal === "none"
                    ? "Depósito realizado"
                    : `Depósito na meta: ${goalName}`,
            valor: deposit,
            data: new Date().toISOString().split("T")[0],
        };

        let updatedGoals = [...(user.goals || [])];

        if (selectedGoal !== "none") {
            updatedGoals = updatedGoals.map((goal) => {
                if (goal.id === Number(selectedGoal)) {
                    return {
                        ...goal,
                        deposits: [
                            ...(goal.deposits || []),
                            {
                                id: Date.now(),
                                value: deposit,
                                time: new Date().toISOString(),
                            },
                        ],
                    };
                }

                return goal;
            });
        }

        const updatedUser: User = {
            ...user,
            saldo_final: newBalance,
            extratos: [...(user.extratos || []), newStatement],
            goals: updatedGoals,
        };

        try {
            setLoading(true);

            const res = await fetch(
                `https://database-save-app.onrender.com/users/${user.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!res.ok) {
                throw new Error("Erro ao atualizar dados");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setDepositValue("");
            setSelectedGoal("none");
            setSuccess(true);

            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error(err);
            alert("Erro ao realizar depósito.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="background-color text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <Row className="justify-content-center">
                    <Col lg={7} md={9}>
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="home-main"
                        >
                            <TitleHeader title="Depositar" />

                            {!user ? (
                                <div className="home-empty-state mt-4 text-center">
                                    Carregando informações...
                                </div>
                            ) : (
                                <>
                                    <Card className="home-graph-card border-0 mb-4">
                                        <CardBody className="text-center py-4">
                                            <p className="home-balance-label mb-2">Saldo Atual</p>

                                            <motion.h2
                                                key={user.saldo_final}
                                                initial={{ scale: 0.94, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="home-balance-value"
                                                style={{ fontSize: "2.4rem" }}
                                            >
                                                R${" "}
                                                {Number(user.saldo_final || 0)
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                            </motion.h2>
                                        </CardBody>
                                    </Card>

                                    <section className="home-section">
                                        <div className="home-list-item" style={{ cursor: "default" }}>
                                            <div className="w-100">
                                                <Label className="fw-bold mb-3 d-block">
                                                    Valor do Depósito
                                                </Label>

                                                <div className="d-flex align-items-center gap-3">
                                                    <span
                                                        className="fw-bold"
                                                        style={{ fontSize: "1.4rem", color: "#fff" }}
                                                    >
                                                        R$
                                                    </span>

                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={depositValue}
                                                        onChange={(e) => setDepositValue(e.target.value)}
                                                        placeholder="0,00"
                                                        className="custom-input-balance text-center fw-bold"
                                                        style={{ fontSize: "1.2rem" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="home-section">
                                        <div className="home-list-item" style={{ cursor: "default" }}>
                                            <div className="w-100">
                                                <Label className="fw-bold mb-3 d-block">
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
                                            color="success"
                                            onClick={handleDeposit}
                                            disabled={loading}
                                            className="w-100 fw-bold py-3"
                                            style={{
                                                borderRadius: "18px",
                                                fontSize: "1rem",
                                            }}
                                        >
                                            {loading ? "Processando..." : "Confirmar Depósito"}
                                        </Button>

                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-center mt-3 fw-bold"
                                                style={{ color: "#00c853" }}
                                            >
                                                ✅ Depósito realizado!
                                            </motion.div>
                                        )}
                                    </section>

                                    {user.extratos?.length > 0 && (
                                        <section className="home-section mt-5">
                                            <div className="home-section-header">
                                                <h5 className="home-section-title">Histórico</h5>
                                            </div>

                                            <ListGroup flush className="home-list">
                                                {[...user.extratos]
                                                    .reverse()
                                                    .slice(0, 5)
                                                    .map((item) => (
                                                        <ListGroupItem
                                                            key={item.id}
                                                            className="home-list-item"
                                                            style={{ cursor: "default" }}
                                                        >
                                                            <div className="home-list-left">
                                                                <div className="home-list-icon">
                                                                    <i className="bi bi-arrow-down-left-circle"></i>
                                                                </div>

                                                                <div>
                                                                    <p className="home-item-title mb-1">
                                                                        {item.descricao}
                                                                    </p>
                                                                    <small className="home-item-subtitle">
                                                                        {item.data}
                                                                    </small>
                                                                </div>
                                                            </div>

                                                            <span className="home-item-value home-item-value-credit">
                                                                + R$ {Number(item.valor).toFixed(2).replace(".", ",")}
                                                            </span>
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
        </div>
    );
}