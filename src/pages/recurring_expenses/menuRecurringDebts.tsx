import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";

type Frequency = "monthly" | "weekly" | "daily" | "yearly";

interface RecurringTransaction {
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
    recurringDebts?: RecurringTransaction[];
    recurringCredits?: RecurringTransaction[];
}

export default function RecurringDebtsMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);
    const [activeTab, setActiveTab] = useState<"debits" | "credits">("debits");

    const navigate = useNavigate();

    const freqMap: Record<Frequency, string> = {
        monthly: "Mensal",
        weekly: "Semanal",
        daily: "Diária",
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
                    `${BASE_URL}/users/${parsedUser.id}`
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

    const recurringCredits = useMemo(() => {
        return user?.recurringCredits || [];
    }, [user]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    async function removerRecorrente(id: number) {
        if (!user) return;

        const confirmar = window.confirm(
            `Tem certeza que deseja remover este ${activeTab === "credits" ? "crédito" : "débito"}?`
        );

        if (!confirmar) return;

        setLoading(true);

        const updatedUser: User = {
            ...user,
            recurringDebts:
                activeTab === "debits"
                    ? recurringDebts.filter((item) => item.id !== id)
                    : user.recurringDebts,
            recurringCredits:
                activeTab === "credits"
                    ? recurringCredits.filter((item) => item.id !== id)
                    : user.recurringCredits,
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
                throw new Error("Erro ao remover item recorrente");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch {
            setAlert({
                isOpen: true,
                message: `Erro ao excluir ${activeTab === "credits" ? "crédito" : "débito"}.`,
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando...</div>
            </div>
        );
    }

    return (
        <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
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
                    <TitleHeader title={activeTab === "debits" ? "Débitos Recorrentes" : "Créditos Recorrentes"} />

                    <section className="home-section">
                        <div className="home-graph-card">
                            <div className="d-flex gap-3">
                                <Button
                                    color="link"
                                    className={`home-action-btn w-50 fw-bold ${activeTab === "debits" ? "home-action-btn-primary" : ""}`}
                                    onClick={() => setActiveTab("debits")}
                                >
                                    Débitos
                                </Button>
                                <Button
                                    color="link"
                                    className={`home-action-btn w-50 fw-bold ${activeTab === "credits" ? "home-action-btn-primary" : ""}`}
                                    onClick={() => setActiveTab("credits")}
                                >
                                    Créditos
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="home-section">
                        <div className="d-flex justify-content-end">
                            <Button
                                color="link"
                                className="home-action-btn home-action-btn-primary fw-semibold d-flex align-items-center gap-2 px-4"
                                style={{ borderRadius: "999px" }}
                                onClick={() => navigate(activeTab === "debits" ? "/registerDebt/newRecurringDebt" : "/registerCredit/newRecurringCredit")}
                            >
                                <i className="bi bi-plus-circle"></i>
                                {activeTab === "debits" ? "Novo Débito" : "Novo Crédito"}
                            </Button>
                        </div>
                    </section>

                    <section className="home-section">
                        {activeTab === "debits" ? (
                            recurringDebts.length > 0 ? (
                                <ListGroup flush className="home-list">
                                    {recurringDebts.map((item) => (
                                        <motion.div
                                            key={item.id}
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

                                                    <div className="home-item-copy">
                                                        <p className="home-item-title mb-1">
                                                            {item.name}
                                                        </p>

                                                        <small className="home-item-subtitle d-block">
                                                            {freqMap[item.frequency]} — dia {item.billingDate}
                                                        </small>

                                                        {item.category && (
                                                            <small className="home-item-meta d-block">
                                                                {item.category}
                                                            </small>
                                                        )}

                                                        {item.description && (
                                                            <small className="home-item-meta d-block">
                                                                {item.description}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="home-item-value home-item-value-debit">
                                                        - R$ {formatCurrency(Number(item.value))}
                                                    </span>

                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{
                                                            borderRadius: "999px",
                                                            width: "36px",
                                                            height: "36px",
                                                            padding: 0,
                                                        }}
                                                        onClick={() => removerRecorrente(item.id)}
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
                            )
                        ) : (
                            recurringCredits.length > 0 ? (
                                <ListGroup flush className="home-list">
                                    {recurringCredits.map((item) => (
                                        <motion.div
                                            key={item.id}
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

                                                    <div className="home-item-copy">
                                                        <p className="home-item-title mb-1">
                                                            {item.name}
                                                        </p>

                                                        <small className="home-item-subtitle d-block">
                                                            {freqMap[item.frequency]} — dia {item.billingDate}
                                                        </small>

                                                        {item.category && (
                                                            <small className="home-item-meta d-block">
                                                                {item.category}
                                                            </small>
                                                        )}

                                                        {item.description && (
                                                            <small className="home-item-meta d-block">
                                                                {item.description}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="home-item-value home-item-value-credit">
                                                        + R$ {formatCurrency(Number(item.value))}
                                                    </span>

                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{
                                                            borderRadius: "999px",
                                                            width: "36px",
                                                            height: "36px",
                                                            padding: 0,
                                                        }}
                                                        onClick={() => removerRecorrente(item.id)}
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
                                    Nenhum crédito recorrente encontrado.
                                </div>
                            )
                        )}
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