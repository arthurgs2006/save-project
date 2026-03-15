import { useEffect, useMemo, useState } from "react";
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

interface DepositItem {
    id: number;
    transactionId?: string;
    value: number;
    time?: string;
    date?: string;
    hour?: string;
    dateTimeLabel?: string;
    status?: "concluido";
    method?: "saldo_manual";
}

interface Goal {
    id: number;
    name: string;
    deposits?: DepositItem[];
}

interface Statement {
    id: number;
    transactionId: string;
    tipo: "credito" | "debito";
    descricao: string;
    valor: number;
    data: string;
    hora: string;
    dataHora: string;
    createdAt: string;
    status: "concluido";
    metodo: "saldo_manual";
    origem: "saque";
    goalId?: number | null;
    goalName?: string | null;
}

interface User {
    id: number;
    saldo_final: number;
    goals: Goal[];
    extratos: Statement[];
}

export default function WithdrawPage() {
    const [user, setUser] = useState<User | null>(null);
    const [withdrawValue, setWithdrawValue] = useState("");
    const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const recentWithdraws = useMemo(() => {
        if (!user?.extratos?.length) return [];

        return [...user.extratos]
            .filter((item) => item.tipo === "debito")
            .reverse()
            .slice(0, 5);
    }, [user]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function buildWithdrawMetadata() {
        const now = new Date();
        const timestamp = now.getTime();

        const date = now.toLocaleDateString("pt-BR");
        const hour = now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        const dateTimeLabel = `${date} às ${hour}`;
        const transactionId = `SAQ-${timestamp}-${Math.floor(
            1000 + Math.random() * 9000
        )}`;

        return {
            id: timestamp,
            transactionId,
            createdAt: now.toISOString(),
            date,
            hour,
            dateTimeLabel,
        };
    }

    async function handleWithdraw() {
        if (!user) {
            alert("Usuário não encontrado. Faça login novamente.");
            return;
        }

        const valor = Number(withdrawValue.replace(",", "."));

        if (isNaN(valor) || valor <= 0) {
            alert("Digite um valor de saque válido!");
            return;
        }

        const meta = buildWithdrawMetadata();

        let metasAtualizadas = [...(user.goals || [])];
        let extratosAtualizados = [...(user.extratos || [])];

        if (!selectedGoal) {
            if (valor > user.saldo_final) {
                alert("Saldo geral insuficiente!");
                return;
            }

            const novoSaldo = user.saldo_final - valor;

            extratosAtualizados.push({
                id: meta.id,
                transactionId: meta.transactionId,
                tipo: "debito",
                descricao: "Débito do saldo geral",
                valor,
                data: meta.date,
                hora: meta.hour,
                dataHora: meta.dateTimeLabel,
                createdAt: meta.createdAt,
                status: "concluido",
                metodo: "saldo_manual",
                origem: "saque",
                goalId: null,
                goalName: null,
            });

            return await atualizarUsuario({
                ...user,
                saldo_final: novoSaldo,
                extratos: extratosAtualizados,
                goals: metasAtualizadas,
            });
        }

        const goal = user.goals.find((g) => g.id === selectedGoal);

        if (!goal) {
            alert("Meta não encontrada.");
            return;
        }

        const totalDeposits =
            goal.deposits?.reduce((acc, d) => acc + Number(d.value || 0), 0) || 0;

        if (valor > totalDeposits) {
            alert("Valor maior que o saldo disponível na meta!");
            return;
        }

        const novoValorMeta = totalDeposits - valor;

        const novosDepositos =
            novoValorMeta > 0
                ? [
                    {
                        id: meta.id,
                        transactionId: meta.transactionId,
                        value: novoValorMeta,
                        time: meta.createdAt,
                        date: meta.date,
                        hour: meta.hour,
                        dateTimeLabel: meta.dateTimeLabel,
                        status: "concluido" as const,
                        method: "saldo_manual" as const,
                    },
                ]
                : [];

        if (novoValorMeta <= 0) {
            metasAtualizadas = metasAtualizadas.filter((g) => g.id !== selectedGoal);
        } else {
            metasAtualizadas = metasAtualizadas.map((g) =>
                g.id === selectedGoal ? { ...g, deposits: novosDepositos } : g
            );
        }

        extratosAtualizados.push({
            id: meta.id,
            transactionId: meta.transactionId,
            tipo: "debito",
            descricao: `Débito da meta: ${goal.name}`,
            valor,
            data: meta.date,
            hora: meta.hour,
            dataHora: meta.dateTimeLabel,
            createdAt: meta.createdAt,
            status: "concluido",
            metodo: "saldo_manual",
            origem: "saque",
            goalId: goal.id,
            goalName: goal.name,
        });

        return await atualizarUsuario({
            ...user,
            goals: metasAtualizadas,
            extratos: extratosAtualizados,
        });
    }

    async function atualizarUsuario(updatedUser: User) {
        try {
            setLoading(true);

            const res = await fetch(
                `https://database-save-app.onrender.com/users/${updatedUser.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!res.ok) {
                alert("Erro ao atualizar usuário!");
                setLoading(false);
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);

            setWithdrawValue("");
            setSelectedGoal(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error(err);
            alert("Erro ao conectar com o servidor.");
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
                            <TitleHeader title="Debitar" />

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
                                                R$ {formatCurrency(Number(user.saldo_final || 0))}
                                            </motion.h2>
                                        </CardBody>
                                    </Card>

                                    <section className="home-section">
                                        <div className="home-list-item" style={{ cursor: "default" }}>
                                            <div className="w-100">
                                                <Label className="fw-bold mb-3 d-block">
                                                    Meta (opcional)
                                                </Label>

                                                <Input
                                                    type="select"
                                                    className="custom-input-balance"
                                                    value={selectedGoal ?? ""}
                                                    onChange={(e) =>
                                                        setSelectedGoal(
                                                            e.target.value === "" ? null : Number(e.target.value)
                                                        )
                                                    }
                                                >
                                                    <option value="">Nenhuma meta (usar saldo geral)</option>

                                                    {user.goals?.length > 0 &&
                                                        user.goals.map((g) => {
                                                            const total =
                                                                g.deposits?.reduce(
                                                                    (acc, d) => acc + Number(d.value || 0),
                                                                    0
                                                                ) || 0;

                                                            return (
                                                                <option key={g.id} value={g.id}>
                                                                    {g.name} — R$ {formatCurrency(total)}
                                                                </option>
                                                            );
                                                        })}
                                                </Input>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="home-section">
                                        <div className="home-list-item" style={{ cursor: "default" }}>
                                            <div className="w-100">
                                                <Label className="fw-bold mb-3 d-block">
                                                    Valor do débito
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
                                                        value={withdrawValue}
                                                        onChange={(e) => setWithdrawValue(e.target.value)}
                                                        placeholder="0,00"
                                                        className="custom-input-balance text-center fw-bold"
                                                        style={{ fontSize: "1.2rem" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="home-section">
                                        <Button
                                            color="danger"
                                            onClick={handleWithdraw}
                                            disabled={loading}
                                            className="w-100 fw-bold py-3"
                                            style={{
                                                borderRadius: "18px",
                                                fontSize: "1rem",
                                            }}
                                        >
                                            {loading ? "Processando..." : "Confirmar Débito"}
                                        </Button>

                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-center mt-3 fw-bold"
                                                style={{ color: "#00c853" }}
                                            >
                                                ✅ Débito realizado com sucesso!
                                            </motion.div>
                                        )}
                                    </section>

                                    {recentWithdraws.length > 0 && (
                                        <section className="home-section mt-5">
                                            <div className="home-section-header">
                                                <h5 className="home-section-title">Últimos débitos</h5>
                                            </div>

                                            <ListGroup flush className="home-list">
                                                {recentWithdraws.map((item) => (
                                                    <ListGroupItem
                                                        key={item.id}
                                                        className="home-list-item"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <div className="home-list-left">
                                                            <div className="home-list-icon">
                                                                <i className="bi bi-arrow-up-right-circle"></i>
                                                            </div>

                                                            <div>
                                                                <p className="home-item-title mb-1">
                                                                    {item.descricao}
                                                                </p>

                                                                <small className="home-item-subtitle d-block">
                                                                    {item.dataHora}
                                                                </small>

                                                                <small className="home-item-subtitle d-block">
                                                                    ID: {item.transactionId}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        <div className="text-end">
                                                            <span className="home-item-value home-item-value-debit d-block">
                                                                - R$ {formatCurrency(Number(item.valor))}
                                                            </span>

                                                            <small className="home-item-subtitle">
                                                                {item.status}
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
        </div>
    );
}