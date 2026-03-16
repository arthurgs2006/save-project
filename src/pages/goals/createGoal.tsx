import { useState, useEffect } from "react";
import {
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Card,
    CardBody,
    Row,
    Col,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import GoalSection from "../../components/graphic_components/goal_section";
import ProgressBar from "../../components/graphic_components/progress_bar";

export default function CreateGoalPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);

    const [name, setName] = useState("");
    const [value, setValue] = useState<string>("");

    const [initialDeposit, setInitialDeposit] = useState<string>("");
    const [depositValue, setDepositValue] = useState<string>("");

    const [redirectedAmount, setRedirectedAmount] = useState<number>(0);
    const [icon, setIcon] = useState<string>("");

    const randomIcons = [
        "bi-piggy-bank-fill",
        "bi-bag-fill",
        "bi-gift-fill",
        "bi-coin",
        "bi-cash-coin",
        "bi-star-fill",
    ];

    const getRandomIcon = () => {
        const index = Math.floor(Math.random() * randomIcons.length);
        return randomIcons[index];
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

        if (!storedUser?.id) return;

        fetch(`https://database-save-app.onrender.com/users/${storedUser.id}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(() => console.warn("Erro ao carregar usuário."));

        setIcon(getRandomIcon());
    }, []);

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando usuário...</div>
            </div>
        );
    }

    const saldoDisponivel = user.saldo_final;
    const valorPreview = (Number(initialDeposit) || 0) + redirectedAmount;

    const handleRedirectFunds = () => {
        if (!depositValue) return;

        const amount = Number(depositValue);

        if (isNaN(amount) || amount <= 0) {
            alert("Digite um valor válido.");
            return;
        }

        if (amount > user.saldo_final) {
            alert("Saldo insuficiente!");
            return;
        }

        setRedirectedAmount((prev) => prev + amount);

        const updatedUser = {
            ...user,
            saldo_final: user.saldo_final - amount,
        };

        setUser(updatedUser);
        setDepositValue("");

        alert(`R$ ${amount.toFixed(2)} direcionados para esta meta.`);
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();

        const numericValue = Number(value);
        const initDep = Number(initialDeposit);

        if (!name.trim()) {
            alert("Digite o nome da meta.");
            return;
        }

        if (isNaN(numericValue) || numericValue <= 0) {
            alert("Digite um valor necessário válido.");
            return;
        }

        if (isNaN(initDep) || initDep < 0) {
            alert("Digite um depósito inicial válido.");
            return;
        }

        if (initDep > user.saldo_final) {
            alert("Saldo insuficiente para depósito inicial.");
            return;
        }

        const goalIcon = icon;

        const newGoal: any = {
            id: Date.now(),
            name,
            value: numericValue,
            image: goalIcon,
            deposits: [],
        };

        if (initDep > 0) {
            newGoal.deposits.push({
                id: Date.now() + 1,
                amount: initDep,
                date: new Date().toISOString(),
            });
        }

        if (redirectedAmount > 0) {
            newGoal.deposits.push({
                id: Date.now() + 2,
                amount: redirectedAmount,
                date: new Date().toISOString(),
            });
        }

        const updatedUser = {
            ...user,
            saldo_final: user.saldo_final - initDep,
            goals: [...(user.goals || []), newGoal],
        };

        await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        });

        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
        navigate("/goals");
    };

    return (
        <div className="background-color text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={user?.nome} />

                <motion.div
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader title="Criar Nova Meta" backLink="/goals" />

                    <Row className="g-4 mt-1">
                        <Col lg={7}>
                            <Form onSubmit={handleCreateGoal}>
                                <section className="home-section">
                                    <Card className="home-graph-card border-0">
                                        <CardBody className="text-center py-4">
                                            <p className="home-balance-label mb-2">Saldo disponível</p>
                                            <h2
                                                className="home-balance-value"
                                                style={{ fontSize: "2.2rem" }}
                                            >
                                                R${" "}
                                                {Number(saldoDisponivel).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </h2>
                                        </CardBody>
                                    </Card>
                                </section>

                                {user.saldo_final > 0 && (
                                    <section className="home-section">
                                        <div className="home-list-item" style={{ cursor: "default" }}>
                                            <div className="w-100">
                                                <h6 className="home-section-title mb-3">
                                                    Direcionar saldo disponível
                                                </h6>

                                                <p className="home-item-subtitle mb-3">
                                                    Saldo atual:{" "}
                                                    <strong style={{ color: "#fff" }}>
                                                        R${" "}
                                                        {Number(user.saldo_final).toFixed(2).replace(".", ",")}
                                                    </strong>
                                                </p>

                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={user.saldo_final}
                                                    placeholder="Digite quanto deseja direcionar"
                                                    value={initialDeposit}
                                                    onChange={(e) => setInitialDeposit(e.target.value)}
                                                    className="custom-input-balance"
                                                />

                                                {Number(initialDeposit) > user.saldo_final && (
                                                    <p className="text-danger mt-2 mb-0 small">
                                                        Saldo insuficiente.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="home-section">
                                    <div className="home-list-item" style={{ cursor: "default" }}>
                                        <div className="w-100">
                                            <Label for="goalName" className="fw-bold mb-3 d-block">
                                                Nome da Meta
                                            </Label>
                                            <Input
                                                id="goalName"
                                                type="text"
                                                placeholder="Ex: Comprar Notebook"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="custom-input-balance"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="home-section">
                                    <div className="home-list-item" style={{ cursor: "default" }}>
                                        <div className="w-100">
                                            <Label for="goalValue" className="fw-bold mb-3 d-block">
                                                Valor Necessário (R$)
                                            </Label>
                                            <Input
                                                id="goalValue"
                                                type="number"
                                                min="1"
                                                placeholder="Ex: 3500"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                required
                                                className="custom-input-balance"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="home-section">
                                    <div className="home-list-item" style={{ cursor: "default" }}>
                                        <div className="w-100">
                                            <h6 className="home-section-title mb-3">
                                                Direcionar saldo geral para esta meta
                                            </h6>

                                            <FormGroup className="mb-3">
                                                <Label className="fw-bold mb-2">Valor (R$)</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={depositValue}
                                                    onChange={(e) => setDepositValue(e.target.value)}
                                                    placeholder="Ex: 150"
                                                    className="custom-input-balance"
                                                />
                                            </FormGroup>

                                            <Button
                                                color="primary"
                                                className="fw-bold w-100 py-3"
                                                onClick={handleRedirectFunds}
                                                type="button"
                                                disabled={
                                                    !depositValue ||
                                                    Number(depositValue) <= 0 ||
                                                    Number(depositValue) > user.saldo_final
                                                }
                                                style={{ borderRadius: "18px" }}
                                            >
                                                Direcionar para Meta
                                            </Button>

                                            <p className="home-item-subtitle mt-3 mb-0">
                                                Saldo disponível: R$
                                                {user.saldo_final.toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="home-section">
                                    <div className="d-flex gap-3 flex-wrap">
                                        <Button
                                            color="success"
                                            type="submit"
                                            disabled={!name || Number(value) <= 0}
                                            className="fw-bold py-3 px-4"
                                            style={{
                                                borderRadius: "18px",
                                                minWidth: "180px",
                                            }}
                                        >
                                            Criar Meta
                                        </Button>

                                        <Button
                                            color="secondary"
                                            type="button"
                                            onClick={() => navigate("/goals")}
                                            className="fw-bold py-3 px-4"
                                            style={{
                                                borderRadius: "18px",
                                                minWidth: "180px",
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </section>
                            </Form>
                        </Col>

                        <Col lg={5}>
                            {name && Number(value) > 0 && icon && (
                                <motion.div
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <section className="home-section mt-0">
                                        <div className="home-section-header">
                                            <h5 className="home-section-title">Prévia da Meta</h5>
                                        </div>

                                        <div className="home-graph-card">
                                            <GoalSection
                                                name={name}
                                                image={icon}
                                                targetValue={Number(value)}
                                                currentValue={valorPreview}
                                            />

                                            <div className="mt-4">
                                                <ProgressBar
                                                    percentage={
                                                        value && Number(value) > 0
                                                            ? (valorPreview / Number(value)) * 100
                                                            : 0
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </motion.div>
                            )}
                        </Col>
                    </Row>
                </motion.div>
            </Container>
        </div>
    );
}