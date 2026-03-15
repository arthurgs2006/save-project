import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";

interface Extrato {
    id: number | string;
    transactionId?: string;
    data: string;
    hora?: string;
    dataHora?: string;
    createdAt?: string;
    descricao?: string;
    valor: number;
    tipo: "credito" | "debito";
    status?: string;
    metodo?: string;
    origem?: string;
    goalId?: number | null;
    goalName?: string | null;
}

interface RecurringDebt {
    id: number | string;
    name: string;
    value: number;
    billingDate: string;
    frequency: string;
}

interface User {
    id: number | string;
    nome: string;
    saldo_final: number;
    extratos: Extrato[];
    recurringDebts: RecurringDebt[];
}

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const response = await fetch(
                    `https://database-save-app.onrender.com/users/${parsedUser.id}`
                );

                if (!response.ok) return;

                const data: User = await response.json();
                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível.");
            }
        }

        loadUser();
    }, [navigate]);

    const freqMap: Record<string, string> = {
        monthly: "Mensal",
        weekly: "Semanal",
        yearly: "Anual",
    };

    const ultimosExtratos = useMemo(() => {
        return [...(user?.extratos || [])].reverse().slice(0, 4);
    }, [user]);

    const recurringDebts = user?.recurringDebts || [];

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function getTransactionTitle(item: Extrato) {
        if (item.descricao) return item.descricao;
        return item.tipo === "credito" ? "Depósito" : "Débito";
    }

    function getTransactionSubtitle(item: Extrato) {
        if (item.dataHora) return item.dataHora;
        if (item.hora) return `${item.data} às ${item.hora}`;
        return item.data;
    }

    function getSafeExtraInfo(item: Extrato) {
        const parts: string[] = [];

        if (item.status) {
            parts.push(item.status);
        }

        if (item.transactionId) {
            parts.push(`ID: ${item.transactionId}`);
        }

        return parts.join(" • ");
    }

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-loading">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="home-apple-screen text-white min-vh-100">
            <Container className="home-shell py-4 py-md-5">
                <AccountHeader name={user.nome} />

                <motion.main
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <section className="home-balance-wrap">
                        <p className="home-balance-label">Saldo bancário</p>
                        <h1 className="home-balance-value">
                            R$ {formatCurrency(Number(user.saldo_final))}
                        </h1>
                    </section>

                    <section className="home-graph-card">
                        <GraphicCard user={user} />
                    </section>

                    <section className="home-actions-section">
                        <nav className="home-actions-grid">
                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/deposit")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-down-circle"></i>
                                </div>
                                <span className="home-action-label">Depositar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/debts")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-up-circle"></i>
                                </div>
                                <span className="home-action-label">Sacar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/goals")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-bullseye"></i>
                                </div>
                                <span className="home-action-label">Metas</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/registerDebt")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-repeat"></i>
                                </div>
                                <span className="home-action-label">Recorrentes</span>
                            </Button>
                        </nav>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h5 className="home-section-title">Últimas Movimentações</h5>
                        </div>

                        {ultimosExtratos.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {ultimosExtratos.map((item) => (
                                    <ListGroupItem
                                        key={item.id}
                                        className="home-list-item"
                                        onClick={() => navigate(`/transaction/${item.id}`)}
                                    >
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i
                                                    className={`bi ${item.tipo === "credito"
                                                            ? "bi-arrow-down-left-circle"
                                                            : "bi-arrow-up-right-circle"
                                                        }`}
                                                ></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    {getTransactionTitle(item)}
                                                </p>

                                                <small className="home-item-subtitle d-block">
                                                    {getTransactionSubtitle(item)}
                                                </small>

                                                {getSafeExtraInfo(item) && (
                                                    <small className="home-item-subtitle d-block">
                                                        {getSafeExtraInfo(item)}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`home-item-value ${item.tipo === "credito"
                                                    ? "home-item-value-credit"
                                                    : "home-item-value-debit"
                                                }`}
                                        >
                                            {item.tipo === "credito" ? "+" : "-"}R${" "}
                                            {formatCurrency(Number(item.valor))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhuma movimentação recente.
                            </div>
                        )}
                    </section>

                    <section id="benefits" className="home-section">
                        <div
                            className="home-benefit-card"
                            onClick={() => navigate("/benefits")}
                        >
                            <div className="home-benefit-content">
                                <div className="home-benefit-icon">
                                    <i className="bi bi-currency-dollar"></i>
                                </div>

                                <div>
                                    <p className="home-item-title mb-1">
                                        Benefícios para Estudantes de Baixa Renda
                                    </p>
                                    <small className="home-item-subtitle">
                                        Descubra auxílios governamentais, bolsas e programas de
                                        crédito estudantil
                                    </small>
                                </div>
                            </div>

                            <i className="bi bi-chevron-right home-benefit-arrow"></i>
                        </div>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h5 className="home-section-title">Débitos Recorrentes</h5>
                        </div>

                        {recurringDebts.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringDebts.map((debt) => (
                                    <ListGroupItem key={debt.id} className="home-list-item">
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i className="bi bi-repeat"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">{debt.name}</p>
                                                <small className="home-item-subtitle">
                                                    Todo dia {debt.billingDate} —{" "}
                                                    {freqMap[debt.frequency] || debt.frequency}
                                                </small>
                                            </div>
                                        </div>

                                        <span className="home-item-value home-item-value-debit">
                                            -R$ {formatCurrency(Number(debt.value))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhum débito recorrente cadastrado.
                            </div>
                        )}
                    </section>
                </motion.main>
            </Container>
        </div>
    );
}