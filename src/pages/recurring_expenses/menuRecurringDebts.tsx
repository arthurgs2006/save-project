import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BENEFITS_API_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./Recurring.scss";

type RecurringType = "debit" | "credit";
type Frequency = "monthly" | "weekly" | "daily" | "yearly";

type RecurringItem = {
    id: number;
    userId: string;
    name: string;
    value: number;
    type: RecurringType;
    frequency: Frequency;
    billingDay: number;
    billingDate?: number;
    category: string;
    description: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    isValidForCurrentMonth?: boolean;
    monthlyEquivalent?: number;
    periodLabel?: string;
    statusLabel?: string;
};

type User = {
    id: string | number;
    nome?: string;
    name?: string;
    saldo_final?: number;
    recurringDebts?: RecurringItem[];
    recurringCredits?: RecurringItem[];
};

function getApiRoot() {
    return BENEFITS_API_URL;
}

function toInputDate(value?: string | null) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
    if (!value) return "Sem data final";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        const sliced = String(value).slice(0, 10);
        const [year, month, day] = sliced.split("-");

        return day && month && year ? `${day}/${month}/${year}` : sliced;
    }

    return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function normalizeType(value: unknown): RecurringType {
    const normalized = String(value || "").toLowerCase();

    return normalized === "credit" ? "credit" : "debit";
}

function normalizeFrequency(value: unknown): Frequency {
    const normalized = String(value || "").toLowerCase();

    if (
        normalized === "daily" ||
        normalized === "weekly" ||
        normalized === "monthly" ||
        normalized === "yearly"
    ) {
        return normalized;
    }

    return "monthly";
}

function normalizeRecurringItem(item: any): RecurringItem {
    const type = normalizeType(item.type ?? item.Type);

    return {
        id: Number(item.id ?? item.Id ?? Date.now()),
        userId: String(item.userId ?? item.UserId ?? ""),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type,
        frequency: normalizeFrequency(item.frequency ?? item.Frequency),
        billingDay: Number(
            item.billingDay ??
                item.BillingDay ??
                item.billingDate ??
                item.BillingDate ??
                1
        ),
        billingDate: Number(
            item.billingDay ??
                item.BillingDay ??
                item.billingDate ??
                item.BillingDate ??
                1
        ),
        category: item.category ?? item.Category ?? "",
        description: item.description ?? item.Description ?? "",
        startDate: toInputDate(item.startDate ?? item.StartDate),
        endDate:
            item.endDate || item.EndDate
                ? toInputDate(item.endDate ?? item.EndDate)
                : null,
        isActive: item.isActive ?? item.IsActive ?? true,
        isValidForCurrentMonth:
            item.isValidForCurrentMonth ?? item.IsValidForCurrentMonth ?? false,
        monthlyEquivalent: Number(
            item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0
        ),
        periodLabel: item.periodLabel ?? item.PeriodLabel ?? "",
        statusLabel: item.statusLabel ?? item.StatusLabel ?? "",
    };
}

function getFrequencyLabel(frequency: Frequency) {
    const labels: Record<Frequency, string> = {
        daily: "Diária",
        weekly: "Semanal",
        monthly: "Mensal",
        yearly: "Anual",
    };

    return labels[frequency];
}

function getMonthlyEquivalent(item: RecurringItem) {
    if (item.monthlyEquivalent && item.monthlyEquivalent > 0) {
        return item.monthlyEquivalent;
    }

    if (item.frequency === "daily") return item.value * 30;
    if (item.frequency === "weekly") return item.value * 4.33;
    if (item.frequency === "yearly") return item.value / 12;

    return item.value;
}

export default function MenuRecurringDebts() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [recurrings, setRecurrings] = useState<RecurringItem[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "debit" | "credit">("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    useEffect(() => {
        loadUserAndRecurrings();
    }, []);

    async function loadUserAndRecurrings() {
        try {
            setLoading(true);

            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            const url = `${getApiRoot()}/recurring-transactions/user/${parsedUser.id}`;

            console.log("URL BUSCA RECORRENTES:", url);

            const response = await fetch(url);
            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro ao carregar recorrências:", {
                    url,
                    status: response.status,
                    body: raw,
                });

                throw new Error(raw || "Erro ao carregar recorrências.");
            }

            const data = JSON.parse(raw);

            const normalized = Array.isArray(data)
                ? data.map(normalizeRecurringItem)
                : [];

            setRecurrings(normalized);

            const updatedUser: User = {
                ...parsedUser,
                recurringDebts: normalized.filter((item) => item.type === "debit"),
                recurringCredits: normalized.filter((item) => item.type === "credit"),
            };

            setUser(updatedUser);
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
        } catch (error) {
            console.error(error);

            const storedUser = localStorage.getItem("loggedUser");

            if (storedUser) {
                const parsedUser: User = JSON.parse(storedUser);

                const localDebts = Array.isArray(parsedUser.recurringDebts)
                    ? parsedUser.recurringDebts.map(normalizeRecurringItem)
                    : [];

                const localCredits = Array.isArray(parsedUser.recurringCredits)
                    ? parsedUser.recurringCredits.map(normalizeRecurringItem)
                    : [];

                setUser(parsedUser);
                setRecurrings([...localDebts, ...localCredits]);
            }

            setAlert({
                isOpen: true,
                message:
                    "Não foi possível carregar as recorrências do back-end. Usando dados locais, se existirem.",
                type: "warning",
            });
        } finally {
            setLoading(false);
        }
    }

    const filteredRecurrings = useMemo(() => {
        const term = search.trim().toLowerCase();

        return recurrings.filter((item) => {
            const matchesTab = activeTab === "all" || item.type === activeTab;

            const searchable = [
                item.name,
                item.category,
                item.description,
                item.type,
                item.frequency,
                item.statusLabel,
                item.periodLabel,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch = !term || searchable.includes(term);

            return matchesTab && matchesSearch;
        });
    }, [recurrings, activeTab, search]);

    const summary = useMemo(() => {
        const debts = recurrings.filter((item) => item.type === "debit");
        const credits = recurrings.filter((item) => item.type === "credit");

        const totalDebits = debts.reduce(
            (sum, item) => sum + getMonthlyEquivalent(item),
            0
        );

        const totalCredits = credits.reduce(
            (sum, item) => sum + getMonthlyEquivalent(item),
            0
        );

        return {
            totalDebits,
            totalCredits,
            balance: totalCredits - totalDebits,
            debtsCount: debts.length,
            creditsCount: credits.length,
        };
    }, [recurrings]);

    async function handleDelete(item: RecurringItem) {
        const confirmed = window.confirm(
            `Deseja excluir "${item.name}" das recorrências?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(item.id);

            const url = `${getApiRoot()}/recurring-transactions/${item.id}`;

            console.log("URL EXCLUIR RECORRENTE:", url);

            const response = await fetch(url, {
                method: "DELETE",
            });

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro ao excluir recorrência:", {
                    url,
                    status: response.status,
                    body: raw,
                });

                throw new Error(raw || "Erro ao excluir recorrência.");
            }

            const updated = recurrings.filter((recurring) => recurring.id !== item.id);
            setRecurrings(updated);

            if (user) {
                const updatedUser: User = {
                    ...user,
                    recurringDebts: updated.filter((recurring) => recurring.type === "debit"),
                    recurringCredits: updated.filter(
                        (recurring) => recurring.type === "credit"
                    ),
                };

                setUser(updatedUser);
                localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            }

            setAlert({
                isOpen: true,
                message: "Recorrência excluída com sucesso.",
                type: "success",
            });
        } catch (error) {
            console.error(error);

            setAlert({
                isOpen: true,
                message: "Erro ao excluir recorrência no back-end.",
                type: "danger",
            });
        } finally {
            setDeletingId(null);
        }
    }

    function handleEdit(item: RecurringItem) {
        if (item.type === "credit") {
            navigate(`/registerRecurringCredit?editId=${item.id}`);
            return;
        }

        navigate(`/registerRecurringDebt?editId=${item.id}`);
    }

    return (
        <main className="recurring-page">
            <Container className="recurring-container">
                <AccountHeader name={user?.nome || user?.name} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Recorrentes" backLink="/homescreen" />

                    <section className="recurring-hero">
                        <div>
                            <span className="recurring-badge">
                                Controle mensal
                            </span>

                            <h1>Entradas e saídas recorrentes</h1>

                            <p>
                                Acompanhe cobranças, assinaturas, salários e rendas fixas
                                em um só lugar. Agora os dados são buscados direto da API
                                .NET.
                            </p>
                        </div>

                        <div className="recurring-hero-grid">
                            <div>
                                <span>Entradas mensais</span>
                                <strong className="positive">
                                    + {formatCurrency(summary.totalCredits)}
                                </strong>
                            </div>

                            <div>
                                <span>Saídas mensais</span>
                                <strong className="negative">
                                    - {formatCurrency(summary.totalDebits)}
                                </strong>
                            </div>

                            <div>
                                <span>Resultado previsto</span>
                                <strong
                                    className={
                                        summary.balance >= 0 ? "positive" : "negative"
                                    }
                                >
                                    {formatCurrency(summary.balance)}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="recurring-menu-actions">
                        <button
                            type="button"
                            className="recurring-main-btn"
                            onClick={() => navigate("/registerRecurringCredit")}
                        >
                            <i className="bi bi-plus-circle"></i>
                            Novo crédito recorrente
                        </button>

                        <button
                            type="button"
                            className="recurring-danger-btn"
                            onClick={() => navigate("/registerRecurringDebt")}
                        >
                            <i className="bi bi-dash-circle"></i>
                            Novo débito recorrente
                        </button>
                    </section>

                    <section className="recurring-toolbar">
                        <div className="recurring-search">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por nome, categoria ou descrição..."
                            />
                        </div>

                        <div className="recurring-tabs">
                            <button
                                type="button"
                                className={activeTab === "all" ? "active" : ""}
                                onClick={() => setActiveTab("all")}
                            >
                                Todos
                            </button>

                            <button
                                type="button"
                                className={activeTab === "credit" ? "active" : ""}
                                onClick={() => setActiveTab("credit")}
                            >
                                Créditos
                            </button>

                            <button
                                type="button"
                                className={activeTab === "debit" ? "active" : ""}
                                onClick={() => setActiveTab("debit")}
                            >
                                Débitos
                            </button>
                        </div>
                    </section>

                    {loading ? (
                        <section className="recurring-empty-state">
                            <h3>Carregando recorrências...</h3>
                            <p>Buscando os dados no back-end.</p>
                        </section>
                    ) : filteredRecurrings.length === 0 ? (
                        <section className="recurring-empty-state">
                            <i className="bi bi-calendar2-week"></i>
                            <h3>Nenhuma recorrência encontrada</h3>
                            <p>
                                Cadastre um crédito ou débito recorrente para acompanhar
                                previsões mensais.
                            </p>
                        </section>
                    ) : (
                        <section className="recurring-list">
                            {filteredRecurrings.map((item) => (
                                <article className="recurring-item-card" key={item.id}>
                                    <div className="recurring-item-top">
                                        <div>
                                            <span
                                                className={
                                                    item.type === "credit"
                                                        ? "recurring-type positive-type"
                                                        : "recurring-type negative-type"
                                                }
                                            >
                                                {item.type === "credit"
                                                    ? "Crédito recorrente"
                                                    : "Débito recorrente"}
                                            </span>

                                            <h3>{item.name}</h3>

                                            <p>
                                                {item.description ||
                                                    item.category ||
                                                    "Sem descrição informada."}
                                            </p>
                                        </div>

                                        <strong
                                            className={
                                                item.type === "credit"
                                                    ? "positive"
                                                    : "negative"
                                            }
                                        >
                                            {item.type === "credit" ? "+ " : "- "}
                                            {formatCurrency(item.value)}
                                        </strong>
                                    </div>

                                    <div className="recurring-item-grid">
                                        <div>
                                            <span>Frequência</span>
                                            <strong>
                                                {getFrequencyLabel(item.frequency)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Dia</span>
                                            <strong>{item.billingDay}</strong>
                                        </div>

                                        <div>
                                            <span>Categoria</span>
                                            <strong>
                                                {item.category || "Não informada"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Impacto mensal</span>
                                            <strong>
                                                {formatCurrency(getMonthlyEquivalent(item))}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="recurring-period-info">
                                        <span>Período</span>
                                        <strong>
                                            {item.periodLabel ||
                                                `De ${formatDate(
                                                    item.startDate
                                                )} até ${formatDate(item.endDate)}`}
                                        </strong>
                                        <small>{item.statusLabel || "Ativo"}</small>
                                    </div>

                                    <div className="recurring-item-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="danger"
                                            disabled={deletingId === item.id}
                                            onClick={() => handleDelete(item)}
                                        >
                                            {deletingId === item.id
                                                ? "Excluindo..."
                                                : "Excluir"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
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