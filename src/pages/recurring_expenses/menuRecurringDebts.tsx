import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL, BENEFITS_API_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";

import EducationRecommendationCard from "../../components/education/EducationRecommendationCard";
import {
    getEducationRecommendation,
    type EducationRecommendation,
} from "../../services/educationApi";

import "./Recurring.scss";

type Frequency = "monthly" | "weekly" | "daily" | "yearly";
type RecurringType = "credit" | "debit";

interface RecurringTransaction {
    id: number | string;
    userId?: string | number;

    name: string;
    value: number;
    type?: RecurringType;

    category?: string;
    frequency: Frequency;

    billingDate?: number;
    billingDay?: number;

    description?: string;

    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;

    monthlyEquivalent?: number;

    periodLabel?: string;
    statusLabel?: string;

    createdAt?: string;
    updatedAt?: string;
}

interface User {
    id: number | string;
    nome?: string;
    name?: string;
    saldo_final?: number;
    recurringDebts?: RecurringTransaction[];
    recurringCredits?: RecurringTransaction[];
}

function getApiRoot() {
    return BENEFITS_API_URL;
}

function normalizeRecurringItem(item: any): RecurringTransaction {
    const rawType = String(item.type ?? item.Type ?? "").toLowerCase();

    return {
        id: item.id ?? item.Id ?? Date.now(),
        userId: item.userId ?? item.UserId ?? "",

        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),

        type: rawType === "credit" ? "credit" : "debit",

        category: item.category ?? item.Category ?? "",
        frequency: (item.frequency ?? item.Frequency ?? "monthly") as Frequency,

        billingDate: Number(
            item.billingDate ??
                item.BillingDate ??
                item.billingDay ??
                item.BillingDay ??
                1
        ),

        billingDay: Number(
            item.billingDay ??
                item.BillingDay ??
                item.billingDate ??
                item.BillingDate ??
                1
        ),

        description: item.description ?? item.Description ?? "",

        startDate: item.startDate ?? item.StartDate ?? null,
        endDate: item.endDate ?? item.EndDate ?? null,
        isActive: item.isActive ?? item.IsActive ?? true,

        monthlyEquivalent: Number(
            item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0
        ),

        periodLabel: item.periodLabel ?? item.PeriodLabel ?? "",
        statusLabel: item.statusLabel ?? item.StatusLabel ?? "",

        createdAt: item.createdAt ?? item.CreatedAt ?? "",
        updatedAt: item.updatedAt ?? item.UpdatedAt ?? "",
    };
}

function getRecurringType(item: RecurringTransaction): RecurringType {
    return item.type === "credit" ? "credit" : "debit";
}

export default function RecurringDebtsMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"debits" | "credits">("debits");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [educationRecommendation, setEducationRecommendation] =
        useState<EducationRecommendation | null>(null);

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

            let baseUser: User = {
                ...parsedUser,
                recurringDebts: parsedUser.recurringDebts || [],
                recurringCredits: parsedUser.recurringCredits || [],
            };

            setUser(baseUser);

            try {
                const response = await fetch(`${BASE_URL}/api/auth/users/${parsedUser.id}`);

                if (response.ok) {
                    const serverUser: User = await response.json();

                    baseUser = {
                        ...serverUser,
                        saldo_final: Number(
                            parsedUser.saldo_final ?? serverUser.saldo_final ?? 0
                        ),
                        recurringDebts:
                            parsedUser.recurringDebts ||
                            serverUser.recurringDebts ||
                            [],
                        recurringCredits:
                            parsedUser.recurringCredits ||
                            serverUser.recurringCredits ||
                            [],
                    };
                }
            } catch {
                console.warn("Servidor principal indisponível. Usando dados locais.");
            }

            try {
                const response = await fetch(
                    `${getApiRoot()}/recurring-transactions/user/${parsedUser.id}`
                );

                const raw = await response.text();

                if (response.ok) {
                    const data = JSON.parse(raw);

                    const normalized = Array.isArray(data)
                        ? data.map(normalizeRecurringItem)
                        : [];

                    baseUser = {
                        ...baseUser,
                        recurringDebts: normalized.filter(
                            (item) => getRecurringType(item) === "debit"
                        ),
                        recurringCredits: normalized.filter(
                            (item) => getRecurringType(item) === "credit"
                        ),
                    };
                } else {
                    console.warn("Não foi possível carregar recorrentes da API .NET:", {
                        status: response.status,
                        body: raw,
                    });
                }
            } catch (error) {
                console.warn("Erro ao buscar recorrentes da API .NET.", error);
            }

            setUser(baseUser);
            localStorage.setItem("loggedUser", JSON.stringify(baseUser));
        }

        loadUser();
    }, [navigate]);

    const recurringDebts = useMemo(() => user?.recurringDebts || [], [user]);
    const recurringCredits = useMemo(() => user?.recurringCredits || [], [user]);

    const currentList = useMemo(() => {
        const list = activeTab === "debits" ? recurringDebts : recurringCredits;

        return list.filter((item) => {
            const text = `${item.name} ${item.category || ""} ${
                item.description || ""
            }`.toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [activeTab, recurringDebts, recurringCredits, search]);

    const summary = useMemo(() => {
        const creditsMonthly = recurringCredits.reduce(
            (acc, item) => acc + getMonthlyEquivalent(item),
            0
        );

        const debtsMonthly = recurringDebts.reduce(
            (acc, item) => acc + getMonthlyEquivalent(item),
            0
        );

        const balance = Number(user?.saldo_final || 0);
        const result = creditsMonthly - debtsMonthly;
        const projectedBalance = balance + result;

        let insight = "Seu fluxo recorrente está equilibrado.";

        if (result > 0) {
            insight =
                "Suas entradas recorrentes superam seus custos fixos. Bom sinal para planejamento.";
        }

        if (result < 0) {
            insight =
                "Seus custos recorrentes estão maiores que suas entradas recorrentes. Vale revisar gastos fixos.";
        }

        return {
            creditsMonthly,
            debtsMonthly,
            result,
            projectedBalance,
            insight,
        };
    }, [recurringCredits, recurringDebts, user]);

    useEffect(() => {
        async function loadEducationRecommendation() {
            if (!user?.id) return;

            const recommendation = await getEducationRecommendation(
                user.id,
                "recurring",
                {
                    recurringCredits: summary.creditsMonthly,
                    recurringDebits: summary.debtsMonthly,
                }
            );

            setEducationRecommendation(recommendation);
        }

        loadEducationRecommendation();
    }, [user?.id, summary.creditsMonthly, summary.debtsMonthly]);

    function getMonthlyEquivalent(item: RecurringTransaction) {
        if (item.monthlyEquivalent && item.monthlyEquivalent > 0) {
            return item.monthlyEquivalent;
        }

        const value = Number(item.value || 0);

        if (item.frequency === "daily") return value * 30;
        if (item.frequency === "weekly") return value * 4.33;
        if (item.frequency === "yearly") return value / 12;

        return value;
    }

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getBillingDay(item: RecurringTransaction) {
        return Number(item.billingDay ?? item.billingDate ?? 1);
    }

    function getNextOccurrence(day: number) {
        const today = new Date();

        const safeDay = Math.min(Math.max(Number(day) || 1, 1), 28);
        const next = new Date(today.getFullYear(), today.getMonth(), safeDay);

        if (next < today) {
            next.setMonth(next.getMonth() + 1);
        }

        return next.toLocaleDateString("pt-BR");
    }

    function getCategoryIcon(category?: string) {
        const value = category?.toLowerCase() || "";

        if (value.includes("streaming")) return "bi-tv-fill";
        if (value.includes("educação")) return "bi-mortarboard-fill";
        if (value.includes("educacao")) return "bi-mortarboard-fill";
        if (value.includes("saúde")) return "bi-heart-pulse-fill";
        if (value.includes("saude")) return "bi-heart-pulse-fill";
        if (value.includes("transporte")) return "bi-car-front-fill";
        if (value.includes("moradia")) return "bi-house-door-fill";
        if (value.includes("internet")) return "bi-wifi";
        if (value.includes("salário")) return "bi-cash-stack";
        if (value.includes("salario")) return "bi-cash-stack";
        if (value.includes("freelance")) return "bi-laptop-fill";
        if (value.includes("invest")) return "bi-graph-up-arrow";

        return "bi-arrow-repeat";
    }

    function goToCreate(type?: "debits" | "credits") {
        const targetType = type || activeTab;

        if (targetType === "debits") {
            navigate("/registerDebt/newRecurringDebt");
            return;
        }

        navigate("/registerCredit/newRecurringCredit");
    }

    function goToEdit(id: number | string) {
        if (activeTab === "debits") {
            navigate(`/registerDebt/newRecurringDebt?editId=${id}`);
            return;
        }

        navigate(`/registerCredit/newRecurringCredit?editId=${id}`);
    }

    async function removeRecurring(id: number | string) {
        if (!user) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir este ${
                activeTab === "credits" ? "crédito" : "débito"
            } recorrente?`
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            const response = await fetch(
                `${getApiRoot()}/recurring-transactions/${id}`,
                {
                    method: "DELETE",
                }
            );

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro ao excluir recorrente na API .NET:", {
                    status: response.status,
                    body: raw,
                });

                throw new Error(raw || "Erro ao excluir item recorrente.");
            }

            const updatedUser: User = {
                ...user,
                recurringDebts:
                    activeTab === "debits"
                        ? recurringDebts.filter((item) => String(item.id) !== String(id))
                        : recurringDebts,
                recurringCredits:
                    activeTab === "credits"
                        ? recurringCredits.filter((item) => String(item.id) !== String(id))
                        : recurringCredits,
            };

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
                message:
                    "Erro ao excluir item recorrente. Confira se a API .NET está rodando.",
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
                <AccountHeader name={user.nome || user.name} />

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
                                <strong>
                                    {formatCurrency(summary.projectedBalance)}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <EducationRecommendationCard
                        recommendation={educationRecommendation}
                    />

                    <section className="recurring-menu-actions">
                        <button
                            type="button"
                            className="recurring-danger-btn"
                            onClick={() => goToCreate("debits")}
                        >
                            <i className="bi bi-plus-circle"></i>
                            Novo débito
                        </button>

                        <button
                            type="button"
                            className="recurring-main-btn"
                            onClick={() => goToCreate("credits")}
                        >
                            <i className="bi bi-plus-circle"></i>
                            Novo crédito
                        </button>
                    </section>

                    <section className="recurring-toolbar">
                        <div className="recurring-search">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Pesquisar por nome, categoria ou descrição..."
                            />
                        </div>

                        <div className="recurring-tabs">
                            <button
                                type="button"
                                className={activeTab === "debits" ? "active" : ""}
                                onClick={() => setActiveTab("debits")}
                            >
                                Débitos
                            </button>

                            <button
                                type="button"
                                className={activeTab === "credits" ? "active" : ""}
                                onClick={() => setActiveTab("credits")}
                            >
                                Créditos
                            </button>
                        </div>
                    </section>

                    <section className="recurring-list">
                        {currentList.length === 0 ? (
                            <div className="recurring-empty">
                                <i className="bi bi-arrow-repeat"></i>
                                <h3>Nenhum item encontrado</h3>
                                <p>
                                    Cadastre seus créditos e débitos recorrentes para
                                    melhorar suas previsões.
                                </p>
                            </div>
                        ) : (
                            currentList.map((item) => {
                                const billingDay = getBillingDay(item);
                                const monthlyEquivalent =
                                    getMonthlyEquivalent(item);

                                return (
                                    <article
                                        className="recurring-card"
                                        key={item.id}
                                    >
                                        <div className="recurring-card-left">
                                            <div className="recurring-icon">
                                                <i
                                                    className={`bi ${getCategoryIcon(
                                                        item.category
                                                    )}`}
                                                ></i>
                                            </div>

                                            <div>
                                                <div className="recurring-tags">
                                                    <span>
                                                        {item.category ||
                                                            "Sem categoria"}
                                                    </span>
                                                    <span>
                                                        {freqMap[item.frequency] ||
                                                            item.frequency}
                                                    </span>
                                                </div>

                                                <h3>{item.name}</h3>

                                                <p>
                                                    Dia {billingDay} • próximo em{" "}
                                                    {getNextOccurrence(billingDay)}
                                                </p>

                                                {item.description && (
                                                    <small>{item.description}</small>
                                                )}

                                                {item.periodLabel && (
                                                    <small>{item.periodLabel}</small>
                                                )}
                                            </div>
                                        </div>

                                        <div className="recurring-card-right">
                                            <strong
                                                className={
                                                    activeTab === "credits"
                                                        ? "positive"
                                                        : "negative"
                                                }
                                            >
                                                {activeTab === "credits" ? "+" : "-"}{" "}
                                                {formatCurrency(Number(item.value))}
                                            </strong>

                                            <span>
                                                {formatCurrency(monthlyEquivalent)}/mês
                                            </span>

                                            <div className="recurring-card-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => goToEdit(item.id)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="danger"
                                                    onClick={() =>
                                                        removeRecurring(item.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
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