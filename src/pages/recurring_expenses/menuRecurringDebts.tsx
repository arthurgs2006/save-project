import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./Recurring.scss";

type Frequency = "monthly" | "weekly" | "daily" | "yearly";

interface RecurringTransaction {
    id: number;
    name: string;
    value: number;
    category?: string;
    frequency: Frequency;
    billingDate: number;
    description?: string;
    createdAt?: string;
}

interface User {
    id: number;
    nome: string;
    saldo_final?: number;
    recurringDebts?: RecurringTransaction[];
    recurringCredits?: RecurringTransaction[];
}

export default function RecurringDebtsMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"debits" | "credits">("debits");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

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
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (!response.ok) return;

                const data: User = await response.json();

                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível. Usando dados locais.");
            }
        }

        loadUser();
    }, [navigate]);

    const recurringDebts = useMemo(() => user?.recurringDebts || [], [user]);
    const recurringCredits = useMemo(() => user?.recurringCredits || [], [user]);

    const currentList = useMemo(() => {
        const list = activeTab === "debits" ? recurringDebts : recurringCredits;

        return list.filter((item) => {
            const text = `${item.name} ${item.category} ${item.description}`.toLowerCase();
            return text.includes(search.toLowerCase());
        });
    }, [activeTab, recurringDebts, recurringCredits, search]);

    const summary = useMemo(() => {
        const creditsMonthly = recurringCredits.reduce(
            (acc, item) => acc + getMonthlyEquivalent(item.value, item.frequency),
            0
        );

        const debtsMonthly = recurringDebts.reduce(
            (acc, item) => acc + getMonthlyEquivalent(item.value, item.frequency),
            0
        );

        const balance = Number(user?.saldo_final || 0);
        const result = creditsMonthly - debtsMonthly;
        const projectedBalance = balance + result;

        let insight = "Seu fluxo recorrente está equilibrado.";

        if (result > 0) {
            insight = "Suas entradas recorrentes superam seus custos fixos. Bom sinal para planejamento.";
        }

        if (result < 0) {
            insight = "Seus custos recorrentes estão maiores que suas entradas recorrentes. Vale revisar gastos fixos.";
        }

        return {
            creditsMonthly,
            debtsMonthly,
            result,
            projectedBalance,
            insight,
        };
    }, [recurringCredits, recurringDebts, user]);

    function getMonthlyEquivalent(value: number, frequency: Frequency) {
        if (frequency === "daily") return value * 30;
        if (frequency === "weekly") return value * 4.33;
        if (frequency === "yearly") return value / 12;
        return value;
    }

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getNextOccurrence(day: number) {
        const today = new Date();
        const next = new Date(today.getFullYear(), today.getMonth(), day);

        if (next < today) {
            next.setMonth(next.getMonth() + 1);
        }

        return next.toLocaleDateString("pt-BR");
    }

    function getCategoryIcon(category?: string) {
        const value = category?.toLowerCase() || "";

        if (value.includes("streaming")) return "bi-tv-fill";
        if (value.includes("educação")) return "bi-mortarboard-fill";
        if (value.includes("saúde")) return "bi-heart-pulse-fill";
        if (value.includes("transporte")) return "bi-car-front-fill";
        if (value.includes("moradia")) return "bi-house-door-fill";
        if (value.includes("internet")) return "bi-wifi";
        if (value.includes("salário")) return "bi-cash-stack";
        if (value.includes("freelance")) return "bi-laptop-fill";
        if (value.includes("invest")) return "bi-graph-up-arrow";

        return "bi-arrow-repeat";
    }

    function goToCreate() {
        if (activeTab === "debits") {
            navigate("/registerDebt/newRecurringDebt");
            return;
        }

        navigate("/registerCredit/newRecurringCredit");
    }

    function goToEdit(id: number) {
        if (activeTab === "debits") {
            navigate(`/registerDebt/newRecurringDebt?editId=${id}`);
            return;
        }

        navigate(`/registerCredit/newRecurringCredit?editId=${id}`);
    }

    async function removeRecurring(id: number) {
        if (!user) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir este ${activeTab === "credits" ? "crédito" : "débito"} recorrente?`
        );

        if (!confirmed) return;

        setLoading(true);

        const updatedUser: User = {
            ...user,
            recurringDebts:
                activeTab === "debits"
                    ? recurringDebts.filter((item) => item.id !== id)
                    : recurringDebts,
            recurringCredits:
                activeTab === "credits"
                    ? recurringCredits.filter((item) => item.id !== id)
                    : recurringCredits,
        };

        try {
            const response = await fetch(`${BASE_URL}/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error();
            }

            setUser(updatedUser);
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

            setAlert({
                isOpen: true,
                message: "Item recorrente excluído com sucesso.",
                type: "success",
            });
        } catch {
            setAlert({
                isOpen: true,
                message: "Erro ao excluir item recorrente.",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <main className="recurring-page">
                <div className="recurring-loading">Carregando...</div>
            </main>
        );
    }

    return (
        <main className="recurring-page">
            <Container className="recurring-container">
                <AccountHeader name={user.nome} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Recorrentes" />

                    <section className="recurring-hero">
                        <div>
                            <span className="recurring-badge">Visão mensal</span>
                            <h1>
                                {summary.result >= 0 ? "+" : ""}
                                {formatCurrency(summary.result)}
                            </h1>
                            <p>{summary.insight}</p>
                        </div>

                        <div className="recurring-hero-grid">
                            <div>
                                <span>Entradas/mês</span>
                                <strong className="positive">
                                    {formatCurrency(summary.creditsMonthly)}
                                </strong>
                            </div>

                            <div>
                                <span>Saídas/mês</span>
                                <strong className="negative">
                                    {formatCurrency(summary.debtsMonthly)}
                                </strong>
                            </div>

                            <div>
                                <span>Saldo projetado</span>
                                <strong>{formatCurrency(summary.projectedBalance)}</strong>
                            </div>
                        </div>
                    </section>

                    <section className="recurring-toolbar">
                        <div className="recurring-tabs">
                            <button
                                className={activeTab === "debits" ? "active" : ""}
                                onClick={() => setActiveTab("debits")}
                            >
                                Débitos
                            </button>

                            <button
                                className={activeTab === "credits" ? "active" : ""}
                                onClick={() => setActiveTab("credits")}
                            >
                                Créditos
                            </button>
                        </div>

                        <div className="recurring-actions-top">
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Pesquisar..."
                            />

                            <button className="recurring-main-btn" onClick={goToCreate}>
                                <i className="bi bi-plus-circle"></i>
                                {activeTab === "debits" ? "Novo débito" : "Novo crédito"}
                            </button>
                        </div>
                    </section>

                    <section className="recurring-list">
                        {currentList.length === 0 ? (
                            <div className="recurring-empty">
                                <i className="bi bi-arrow-repeat"></i>
                                <h3>Nenhum item encontrado</h3>
                                <p>
                                    Cadastre seus créditos e débitos recorrentes para melhorar suas previsões.
                                </p>
                            </div>
                        ) : (
                            currentList.map((item) => (
                                <article className="recurring-card" key={item.id}>
                                    <div className="recurring-card-left">
                                        <div className="recurring-icon">
                                            <i className={`bi ${getCategoryIcon(item.category)}`}></i>
                                        </div>

                                        <div>
                                            <div className="recurring-tags">
                                                <span>{item.category || "Sem categoria"}</span>
                                                <span>{freqMap[item.frequency]}</span>
                                            </div>

                                            <h3>{item.name}</h3>

                                            <p>
                                                Dia {item.billingDate} • próximo em{" "}
                                                {getNextOccurrence(item.billingDate)}
                                            </p>

                                            {item.description && <small>{item.description}</small>}
                                        </div>
                                    </div>

                                    <div className="recurring-card-right">
                                        <strong className={activeTab === "credits" ? "positive" : "negative"}>
                                            {activeTab === "credits" ? "+" : "-"}{" "}
                                            {formatCurrency(item.value)}
                                        </strong>

                                        <span>
                                            {formatCurrency(getMonthlyEquivalent(item.value, item.frequency))}/mês
                                        </span>

                                        <div className="recurring-card-actions">
                                            <button onClick={() => goToEdit(item.id)}>
                                                <i className="bi bi-pencil-square"></i>
                                                Editar
                                            </button>

                                            <button
                                                className="danger"
                                                onClick={() => removeRecurring(item.id)}
                                                disabled={loading}
                                            >
                                                <i className="bi bi-trash"></i>
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
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