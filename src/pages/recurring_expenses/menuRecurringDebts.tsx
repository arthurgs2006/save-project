import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

type Frequency = "monthly" | "weekly" | "yearly";

interface RecurringDebt {
    id: number;
    name: string;
    value: number;
    category?: string;
    frequency: Frequency;
    billingDate: number;
    description?: string;
}

interface User {
    id: number;
    nome: string;
    recurringDebts?: RecurringDebt[];
}

export default function RecurringDebtsMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const freqMap: Record<Frequency, string> = {
        monthly: "Mensal",
        weekly: "Semanal",
        yearly: "Anual",
    };

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

    const recurringDebts = useMemo(() => {
        return user?.recurringDebts || [];
    }, [user]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    async function removerDebito(id: number) {
        if (!user) return;

        const confirmar = window.confirm(
            "Tem certeza que deseja cancelar este débito?"
        );

        if (!confirmar) return;

        setLoading(true);

        const novosDebitos = recurringDebts.filter((debt) => debt.id !== id);

        const updatedUser: User = {
            ...user,
            recurringDebts: novosDebitos,
        };

        try {
            const response = await fetch(
                `https://database-save-app.onrender.com/users/${user.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao excluir débito");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch {
            alert("Erro ao excluir débito.");
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
                <div className="home-empty-state">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="background-color text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={user.nome} />

                <div className="home-main">
                    <TitleHeader title="Débitos Recorrentes" />

                    <section className="home-section">
                        <div className="d-flex justify-content-end">
                            <Button
                                color="primary"
                                className="rounded-pill d-flex align-items-center gap-2 px-3"
                                onClick={() => navigate("/registerDebt/newRecurringDebt")}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Novo Débito
                            </Button>
                        </div>
                    </section>

                    <section className="home-section">
                        {recurringDebts.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringDebts.map((debt) => (
                                    <motion.div
                                        key={debt.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <ListGroupItem
                                            className="home-list-item"
                                            style={{ cursor: "default" }}
                                        >
                                            <div className="home-list-left">
                                                <div className="home-list-icon">
                                                    <i className="bi bi-arrow-repeat"></i>
                                                </div>

                                                <div>
                                                    <p className="home-item-title mb-1">{debt.name}</p>

                                                    <small className="home-item-subtitle d-block">
                                                        {freqMap[debt.frequency]} — dia {debt.billingDate}
                                                    </small>

                                                    {debt.category && (
                                                        <small className="home-item-subtitle d-block">
                                                            {debt.category}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-3">
                                                <span className="home-item-value">
                                                    R$ {formatCurrency(Number(debt.value))}
                                                </span>

                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                    onClick={() => removerDebito(debt.id)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        </ListGroupItem>
                                    </motion.div>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state text-center">
                                Nenhum débito recorrente encontrado.
                            </div>
                        )}
                    </section>
                </div>
            </Container>
        </div>
    );
}