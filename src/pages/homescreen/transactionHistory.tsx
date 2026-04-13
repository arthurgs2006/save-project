import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import { BASE_URL } from "../../config";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

interface Extrato {
    id: number | string;
    transactionId?: string;
    data: string;
    hora?: string;
    dataHora?: string;
    descricao?: string;
    valor: number;
    tipo: "credito" | "debito";
    status?: string;
}

interface User {
    id: number | string;
    nome: string;
    extratos: Extrato[];
}

export default function TransactionHistory() {
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
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);
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

    const extratos = useMemo(() => {
        return [...(user?.extratos || [])].reverse();
    }, [user]);

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

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-loading">Carregando histórico...</div>
            </div>
        );
    }

    return (
        <div className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <AccountHeader name={user.nome} />

                <motion.div
                    className="home-main"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader
                        title="Histórico de Movimentações"
                        backLink="/homescreen"
                    />

                    <section className="home-section">
                        <div className="home-section-header">
                            <div>
                                <h5 className="home-section-title">Movimentações desde o início</h5>
                                <small className="home-section-description text-muted-light">
                                    Veja todas as entradas e saídas registradas na conta.
                                </small>
                            </div>

                            <Button
                                color="primary"
                                size="sm"
                                className="fw-semibold"
                                onClick={() => navigate("/homescreen")}
                            >
                                Voltar
                            </Button>
                        </div>
                    </section>

                    <section className="home-section">
                        {extratos.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {extratos.map((item) => (
                                    <ListGroupItem
                                        key={item.id}
                                        className="home-list-item"
                                        onClick={() => navigate(`/transaction/${item.id}`)}
                                    >
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i
                                                    className={`bi ${
                                                        item.tipo === "credito"
                                                            ? "bi-arrow-down-left"
                                                            : "bi-arrow-up-right"
                                                    }`}
                                                ></i>
                                            </div>

                                            <div className="home-item-copy">
                                                <p className="home-item-title mb-1">
                                                    {getTransactionTitle(item)}
                                                </p>

                                                <small className="home-item-subtitle d-block">
                                                    {getTransactionSubtitle(item)}
                                                </small>

                                                {item.status && (
                                                    <small className="home-item-meta d-block">
                                                        {item.status}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`home-item-value ${
                                                item.tipo === "credito"
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
                            <div className="home-empty-state text-center">
                                Nenhuma movimentação encontrada.
                            </div>
                        )}
                    </section>
                </motion.div>
            </Container>
        </div>
    );
}
