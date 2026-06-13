import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import { exportStatementPdf } from "../../utils/pdf";
import { BASE_URL, BENEFITS_API_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";
import EducationRecommendationCard from "../../components/education/EducationRecommendationCard";
import { getEducationRecommendation, type EducationRecommendation } from "../../services/educationApi";
import SaveScoreCard from "../../components/financial_health/SaveScoreCard";
import { analyzeFinancialHealth, type FinancialScoreResponse } from "../../services/financialHealthApi";

import "./Home.scss";

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

interface RecurringItem {
    id: number | string;
    userId?: string;
    name: string;
    value: number;
    type?: "credit" | "debit";
    tipo?: "credito" | "debito";
    billingDate?: string | number;
    billingDay?: string | number;
    frequency: string;
    category?: string;
    description?: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    monthlyEquivalent?: number;
    periodLabel?: string;
    statusLabel?: string;
    createdAt?: string;
}

interface Goal {
    id: number | string;
    title?: string;
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    status?: "active" | "completed";
}

interface User {
    id: number | string;
    nome: string;
    name?: string;
    saldo_final: number;
    receita?: number;
    extratos: Extrato[];
    recurringDebts?: RecurringItem[];
    recurringCredits?: RecurringItem[];
    goals?: Goal[];
}

type QuickAction = {
    title: string;
    icon: string;
    route: string;
    variant: "deposit" | "withdraw" | "goals" | "recurring";
};

type ToolAction = {
    title: string;
    icon: string;
    route: string;
};

const mainActions: QuickAction[] = [
    { title: "Depósito",    icon: "bi-arrow-down-left",       route: "/deposit",      variant: "deposit"   },
    { title: "Saque",       icon: "bi-arrow-up-right",        route: "/withdraw",     variant: "withdraw"  },
    { title: "Metas",       icon: "bi-bullseye",              route: "/goals",        variant: "goals"     },
    { title: "Recorrentes", icon: "bi-repeat",                route: "/registerDebt", variant: "recurring" },
];

const secondaryActions: ToolAction[] = [
    { title: "Moedas",               icon: "bi-currency-exchange",    route: "/currency"           },
    { title: "Investimentos",        icon: "bi-graph-up-arrow",       route: "/investments"        },
    { title: "Cartões e Bancos",     icon: "bi-credit-card-2-front",  route: "/cards-banks"        },
    { title: "Educação Financeira",  icon: "bi-mortarboard-fill",     route: "/financial-education"},
];

function getBenefitsApiRoot() { return BENEFITS_API_URL; }

function normalizeRecurringItem(item: any): RecurringItem {
    const rawType = String(item.type ?? item.Type ?? "").toLowerCase();
    return {
        id: item.id ?? item.Id ?? Date.now(),
        userId: String(item.userId ?? item.UserId ?? ""),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type: rawType === "credit" ? "credit" : "debit",
        billingDate: item.billingDate ?? item.BillingDate ?? item.billingDay ?? item.BillingDay ?? 1,
        billingDay:  item.billingDay  ?? item.BillingDay  ?? item.billingDate ?? item.BillingDate ?? 1,
        frequency: item.frequency ?? item.Frequency ?? "monthly",
        category: item.category ?? item.Category ?? "",
        description: item.description ?? item.Description ?? "",
        startDate: item.startDate ?? item.StartDate ?? null,
        endDate:   item.endDate   ?? item.EndDate   ?? null,
        isActive: item.isActive ?? item.IsActive ?? true,
        monthlyEquivalent: Number(item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0),
        periodLabel: item.periodLabel ?? item.PeriodLabel ?? "",
        statusLabel: item.statusLabel ?? item.StatusLabel ?? "",
        createdAt: item.createdAt ?? item.CreatedAt ?? "",
    };
}

function normalizeBalanceStatement(item: any): Extrato {
    return {
        id: item.id ?? item.Id ?? Date.now(),
        transactionId: item.transactionId ?? item.TransactionId ?? "",
        data: item.data ?? item.Data ?? "",
        hora: item.hora ?? item.Hora ?? "",
        dataHora: item.dataHora ?? item.DataHora ?? "",
        createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
        descricao: item.descricao ?? item.Descricao ?? "",
        valor: Number(item.valor ?? item.Valor ?? 0),
        tipo: (item.tipo ?? item.Tipo ?? "credito") as "credito" | "debito",
        status: item.status ?? item.Status ?? "",
        metodo: item.metodo ?? item.Metodo ?? "",
        origem: item.origem ?? item.Origem ?? "",
        goalId: item.goalId ?? item.GoalId ?? null,
        goalName: item.goalName ?? item.GoalName ?? null,
    };
}

function mergeStatements(local: Extrato[] = [], api: Extrato[] = []) {
    const map = new Map<string, Extrato>();
    [...local, ...api].forEach((item) => map.set(String(item.transactionId || item.id), item));
    return Array.from(map.values());
}

function getDateFromValue(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthKeyFromDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthStart(monthKey: string) {
    const [y, m] = monthKey.split("-");
    return new Date(Number(y), Number(m) - 1, 1);
}

function getMonthEnd(monthKey: string) {
    const [y, m] = monthKey.split("-");
    return new Date(Number(y), Number(m), 0);
}

function getRecurringType(item: RecurringItem) {
    return item.type === "credit" || item.tipo === "credito" ? "credit" : "debit";
}

function isRecurringValidForMonth(item: RecurringItem, monthKey: string) {
    if (item.isActive === false) return false;
    const monthStart = getMonthStart(monthKey);
    const monthEnd   = getMonthEnd(monthKey);
    const startDate  = getDateFromValue(item.startDate || item.createdAt || null);
    const endDate    = getDateFromValue(item.endDate || null);
    if (startDate && startDate > monthEnd)   return false;
    if (endDate   && endDate   < monthStart) return false;
    return true;
}

function hasRecurringOccurredThisMonth(item: RecurringItem, monthKey: string, today: Date) {
    if (!isRecurringValidForMonth(item, monthKey)) return false;

    const todayKey = getMonthKeyFromDate(today);
    if (monthKey < todayKey) return true;
    if (monthKey > todayKey) return false;

    const startDate = getDateFromValue(item.startDate || item.createdAt || null);
    if (startDate && getMonthKeyFromDate(startDate) === monthKey && startDate > today) return false;

    const billingDay = Number(item.billingDay ?? item.billingDate ?? 0);
    if (billingDay > 0 && billingDay > today.getDate()) return false;

    return true;
}

function getRecurringMonthlyEquivalent(item: RecurringItem) {
    if (item.monthlyEquivalent && item.monthlyEquivalent > 0) return item.monthlyEquivalent;
    const value = Number(item.value || 0);
    if (item.frequency === "daily")  return value * 30;
    if (item.frequency === "weekly") return value * 4.33;
    if (item.frequency === "yearly") return value / 12;
    return value;
}

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [activityTab, setActivityTab] = useState<"movements" | "recurring">("movements");
    const [educationRecommendation, setEducationRecommendation] = useState<EducationRecommendation | null>(null);
    const [financialScore, setFinancialScore] = useState<FinancialScoreResponse | null>(null);

    const navigate = useNavigate();

    const freqMap: Record<string, string> = {
        daily: "Diária", weekly: "Semanal", monthly: "Mensal", yearly: "Anual",
    };

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");
            if (!storedUser) { navigate("/login"); return; }

            const parsedUser: User = JSON.parse(storedUser);
            let baseUser: User = {
                ...parsedUser,
                saldo_final: Number(parsedUser.saldo_final || 0),
                extratos: parsedUser.extratos || [],
                goals: parsedUser.goals || [],
                recurringDebts: parsedUser.recurringDebts || [],
                recurringCredits: parsedUser.recurringCredits || [],
            };
            setUser(baseUser);

            try {
                const res = await fetch(`${BASE_URL}/api/auth/users/${parsedUser.id}`);
                if (res.ok) {
                    const serverUser = await res.json();
                    baseUser = {
                        ...serverUser,
                        saldo_final: Number(parsedUser.saldo_final ?? serverUser.saldo_final ?? 0),
                        extratos: mergeStatements(serverUser.extratos || [], parsedUser.extratos || []),
                        goals: parsedUser.goals || serverUser.goals || [],
                        recurringDebts:  parsedUser.recurringDebts  || serverUser.recurringDebts  || [],
                        recurringCredits: parsedUser.recurringCredits || serverUser.recurringCredits || [],
                    };
                }
            } catch { console.warn("Servidor principal indisponível."); }

            try {
                const res = await fetch(`${getBenefitsApiRoot()}/balance/user/${parsedUser.id}/statements`);
                if (res.ok) {
                    const data = JSON.parse(await res.text());
                    baseUser = { ...baseUser, extratos: mergeStatements(baseUser.extratos || [], Array.isArray(data) ? data.map(normalizeBalanceStatement) : []) };
                }
            } catch { console.warn("Erro ao buscar extratos."); }

            try {
                const res = await fetch(`${getBenefitsApiRoot()}/recurring-transactions/user/${parsedUser.id}`);
                if (res.ok) {
                    const data = JSON.parse(await res.text());
                    const normalized = Array.isArray(data) ? data.map(normalizeRecurringItem) : [];
                    baseUser = {
                        ...baseUser,
                        recurringDebts:   normalized.filter((i) => getRecurringType(i) === "debit"),
                        recurringCredits: normalized.filter((i) => getRecurringType(i) === "credit"),
                    };
                }
            } catch { console.warn("Erro ao buscar recorrentes."); }

            setUser(baseUser);
            localStorage.setItem("loggedUser", JSON.stringify(baseUser));
        }
        loadUser();
    }, [navigate]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getCurrentMonthKey() { return getMonthKeyFromDate(new Date()); }

    function getMonthKey(dateStr?: string) {
        if (!dateStr) return "";
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            const [, month, year] = parts;
            return `${year}-${String(Number(month)).padStart(2, "0")}`;
        }
        const parsed = new Date(dateStr);
        return Number.isNaN(parsed.getTime()) ? "" : getMonthKeyFromDate(parsed);
    }

    function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }

    function calculateTotalForMonth(recurring: RecurringItem, monthKey: string) {
        if (!isRecurringValidForMonth(recurring, monthKey)) return 0;
        if (recurring.monthlyEquivalent && recurring.monthlyEquivalent > 0) return recurring.monthlyEquivalent;
        const [year, monthStr] = monthKey.split("-");
        const daysInMonth = getDaysInMonth(Number(year), Number(monthStr) - 1);
        switch (recurring.frequency) {
            case "daily":   return Number(recurring.value || 0) * daysInMonth;
            case "weekly":  return Number(recurring.value || 0) * Math.ceil(daysInMonth / 7);
            case "yearly":  return Number(recurring.value || 0) / 12;
            default:        return Number(recurring.value || 0);
        }
    }

    function getUserFirstName() {
        return (user?.nome || user?.name || "usuário").split(" ")[0];
    }

    function getTransactionTitle(item: Extrato) {
        return item.descricao || (item.tipo === "credito" ? "Depósito" : "Saque");
    }

    function getTransactionSubtitle(item: Extrato) {
        if (item.dataHora) return item.dataHora;
        if (item.hora) return `${item.data} às ${item.hora}`;
        return item.data;
    }

    function getSafeExtraInfo(item: Extrato) {
        const parts: string[] = [];
        if (item.status) parts.push(item.status);
        if (item.transactionId) parts.push(`ID: ${item.transactionId}`);
        return parts.join(" • ");
    }

    const currentMonthKey = getCurrentMonthKey();

    const selectedMonthLabel = useMemo(() => {
        if (!selectedMonth) return null;
        const [year, month] = selectedMonth.split("-");
        return new Date(Number(year), Number(month) - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
    }, [selectedMonth]);

    const statementMonthKey   = selectedMonth || currentMonthKey;
    const statementMonthLabel = selectedMonthLabel || new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const statementMode       = selectedMonth ? (selectedMonth < currentMonthKey ? "past" : selectedMonth === currentMonthKey ? "current" : "future") : "current";

    const recurringDebts   = user?.recurringDebts   || [];
    const recurringCredits = user?.recurringCredits || [];

    const recurringSummary = useMemo(() => {
        const today = new Date();
        const totalCredits = recurringCredits.filter((i) => hasRecurringOccurredThisMonth(i, currentMonthKey, today)).reduce((s, i) => s + getRecurringMonthlyEquivalent(i), 0);
        const totalDebts   = recurringDebts.filter((i)   => hasRecurringOccurredThisMonth(i, currentMonthKey, today)).reduce((s, i) => s + getRecurringMonthlyEquivalent(i), 0);
        return { totalCredits, totalDebts, balance: totalCredits - totalDebts };
    }, [recurringCredits, recurringDebts, currentMonthKey]);

    useEffect(() => {
        async function loadEducation() {
            if (!user?.id) return;
            const rec = await getEducationRecommendation(user.id, "home", {
                balance: Number(user.saldo_final || 0),
                recurringCredits: recurringSummary.totalCredits,
                recurringDebits:  recurringSummary.totalDebts,
            });
            setEducationRecommendation(rec);
        }
        loadEducation();
    }, [user?.id, user?.saldo_final, recurringSummary.totalCredits, recurringSummary.totalDebts]);

    const projectedBalance = useMemo(() => {
        if (!user) return 0;
        if (!selectedMonth) return Number(user.saldo_final || 0) + recurringSummary.balance;
        if (selectedMonth < currentMonthKey) return Number(user.saldo_final || 0);
        let sum = 0;
        let cursor = currentMonthKey;
        while (cursor <= selectedMonth) {
            for (const d of user.recurringDebts   || []) sum -= calculateTotalForMonth(d, cursor);
            for (const c of user.recurringCredits || []) sum += calculateTotalForMonth(c, cursor);
            const [y, m] = cursor.split("-");
            const next = new Date(Number(y), Number(m), 1);
            cursor = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
        }
        return Number(user.saldo_final || 0) + sum;
    }, [user, selectedMonth, currentMonthKey, recurringSummary.balance]);

    const statementItems = useMemo(() => {
        if (!user) return [];
        const actual = [...(user.extratos || [])]
            .filter((i) => getMonthKey(i.data || i.createdAt) === statementMonthKey)
            .filter((i) => i.status !== "Recorrente");
        const showRecurring = statementMonthKey >= currentMonthKey;
        const today = new Date();
        const recurringFilter = statementMonthKey === currentMonthKey
            ? (item: RecurringItem) => hasRecurringOccurredThisMonth(item, statementMonthKey, today)
            : (item: RecurringItem) => isRecurringValidForMonth(item, statementMonthKey);
        const recurringPreview: Extrato[] = showRecurring ? [
            ...(user.recurringDebts   || []).filter(recurringFilter).map((d) => ({
                id: `recurring-debit-${d.id}-${statementMonthKey}`,
                data: `${statementMonthKey.split("-")[1]}/${statementMonthKey.split("-")[0]}`,
                descricao: `Débito recorrente: ${d.name}`,
                valor: calculateTotalForMonth(d, statementMonthKey),
                tipo: "debito" as const,
                status: statementMode === "future" ? "Previsto" : "Recorrente",
            })),
            ...(user.recurringCredits || []).filter(recurringFilter).map((c) => ({
                id: `recurring-credit-${c.id}-${statementMonthKey}`,
                data: `${statementMonthKey.split("-")[1]}/${statementMonthKey.split("-")[0]}`,
                descricao: `Crédito recorrente: ${c.name}`,
                valor: calculateTotalForMonth(c, statementMonthKey),
                tipo: "credito" as const,
                status: statementMode === "future" ? "Previsto" : "Recorrente",
            })),
        ] : [];
        return [...actual, ...recurringPreview];
    }, [user, statementMonthKey, currentMonthKey, statementMode]);

    const displayExtratos = useMemo(() => {
        if (!user) return [];
        if (!selectedMonth) {
            const actual = (user.extratos || []).filter((i) => i.status !== "Recorrente");
            return [...actual].reverse().slice(0, 5);
        }
        return statementItems.filter((i) => !String(i.id).startsWith("recurring-"));
    }, [user, selectedMonth, statementItems]);

    const statementOverview = useMemo(() => {
        if (!statementItems.length) return null;
        const totalCredit = statementItems.filter((i) => i.tipo === "credito").reduce((s, i) => s + Number(i.valor || 0), 0);
        const totalDebit  = statementItems.filter((i) => i.tipo === "debito").reduce((s,  i) => s + Number(i.valor || 0), 0);
        return { totalCredit, totalDebit, balance: totalCredit - totalDebit, count: statementItems.length };
    }, [statementItems, statementMode]);

    const currentMonthOverview = useMemo(() => {
        if (!user) return { totalCredit: 0, totalDebit: 0, balance: 0 };
        const items = (user.extratos || [])
            .filter((i) => getMonthKey(i.data || i.createdAt) === currentMonthKey)
            .filter((i) => i.status !== "Recorrente");
        const totalCredit = items.filter((i) => i.tipo === "credito").reduce((s, i) => s + Number(i.valor || 0), 0) + recurringSummary.totalCredits;
        const totalDebit  = items.filter((i) => i.tipo === "debito").reduce((s,  i) => s + Number(i.valor || 0), 0) + recurringSummary.totalDebts;
        return { totalCredit, totalDebit, balance: totalCredit - totalDebit };
    }, [user, currentMonthKey, recurringSummary.totalCredits, recurringSummary.totalDebts]);

    const goalsOverview = useMemo(() => {
        const goals = user?.goals || [];
        const goalProgresses = goals.map((g) => {
            const target = Number(g.targetAmount || 0);
            const current = Number(g.currentAmount || 0);
            return target > 0 ? Math.min((current / target) * 100, 100) : 0;
        });
        const averageProgress = goalProgresses.length > 0
            ? goalProgresses.reduce((sum, p) => sum + p, 0) / goalProgresses.length
            : 0;
        return {
            activeGoals:    goals.filter((g) => g.status !== "completed").length,
            completedGoals: goals.filter((g) => g.status === "completed").length,
            progress: averageProgress,
        };
    }, [user]);

    useEffect(() => {
        async function loadScore() {
            if (!user?.id) return;
            const goals   = user.goals   || [];
            const extratos = user.extratos || [];
            const currentItems = extratos.filter((i) => getMonthKey(i.data || i.createdAt) === currentMonthKey);
            const monthlyCredits = currentItems.filter((i) => i.tipo === "credito").reduce((s, i) => s + Number(i.valor || 0), 0);
            const monthlyDebits  = currentItems.filter((i) => i.tipo === "debito").reduce((s,  i) => s + Number(i.valor || 0), 0);
            const goalsTargetTotal  = goals.reduce((s, g) => s + Number(g.targetAmount  || 0), 0);
            const goalsCurrentTotal = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0);
            const hasEmergencyReserve = goals.some((g) => `${g.title || ""} ${g.name || ""}`.toLowerCase().match(/reserva|emergência|emergencia/));
            const res = await analyzeFinancialHealth({
                userId: user.id,
                balance: Number(user.saldo_final || 0),
                monthlyIncome: recurringSummary.totalCredits || monthlyCredits,
                monthlyRecurringCredits: recurringSummary.totalCredits,
                monthlyRecurringDebits:  recurringSummary.totalDebts,
                monthlyCredits, monthlyDebits,
                transactionsCount: extratos.length,
                goalsCount: goals.length,
                activeGoalsCount:    goals.filter((g) => g.status !== "completed").length,
                completedGoalsCount: goals.filter((g) => g.status === "completed").length,
                goalsTargetTotal, goalsCurrentTotal, hasEmergencyReserve,
                lessonsOpened:    Number(localStorage.getItem("lessonsOpened")    || 0),
                lessonsCompleted: Number(localStorage.getItem("lessonsCompleted") || 0),
            });
            setFinancialScore(res);
        }
        loadScore();
    }, [user?.id, user?.saldo_final, user?.extratos, user?.goals, recurringSummary.totalCredits, recurringSummary.totalDebts, currentMonthKey]);

    const recurringPreview = useMemo(() => {
        return [...recurringCredits.map((i) => ({ ...i, type: "credit" as const })), ...recurringDebts.map((i) => ({ ...i, type: "debit" as const }))].slice(0, 6);
    }, [recurringCredits, recurringDebts]);

    function handleExportPdf() {
        if (!user) return;
        const rows = statementItems.map((i) => ({
            data: i.data, hora: i.hora || "",
            descricao: i.descricao || (i.tipo === "credito" ? "Crédito" : "Débito"),
            tipo: i.tipo === "credito" ? "Crédito" : "Débito",
            valor: `R$ ${formatCurrency(Number(i.valor))}`,
        }));
        const totalCredit = statementItems.filter((i) => i.tipo === "credito").reduce((s, i) => s + Number(i.valor), 0);
        const totalDebit  = statementItems.filter((i) => i.tipo === "debito").reduce((s,  i) => s + Number(i.valor), 0);
        exportStatementPdf({
            title: `Extrato de ${statementMonthLabel}`,
            subtitle: `Usuário: ${user.nome}`,
            logoText: "SAVE PROJECT",
            rows,
            footers: [
                { label: "Total crédito",   value: `R$ ${formatCurrency(totalCredit)}` },
                { label: "Total débito",    value: `R$ ${formatCurrency(totalDebit)}`  },
                { label: "Saldo do período", value: `R$ ${formatCurrency(totalCredit - totalDebit)}` },
            ],
            fileName: selectedMonth ? `extrato_${selectedMonth}.pdf` : `extrato_atual_${currentMonthKey}.pdf`,
        });
    }

    function renderExtratoItem(item: Extrato) {
        return (
            <ListGroupItem key={item.id} className={`home-list-item home-list-item-${item.tipo}`}
                onClick={() => { if (String(item.id).includes("recurring")) return; navigate(`/transaction/${item.id}`); }}>
                <div className="home-list-left">
                    <div className="home-list-icon">
                        <i className={`bi ${item.tipo === "credito" ? "bi-arrow-down-left" : "bi-arrow-up-right"}`}></i>
                    </div>
                    <div className="home-item-copy">
                        <p className="home-item-title mb-1">{getTransactionTitle(item)}</p>
                        <small className="home-item-subtitle d-block">{getTransactionSubtitle(item)}</small>
                        {getSafeExtraInfo(item) && <small className="home-item-meta">{getSafeExtraInfo(item)}</small>}
                    </div>
                </div>
                <span className={`home-item-value ${item.tipo === "credito" ? "home-item-value-credit" : "home-item-value-debit"}`}>
                    {item.tipo === "credito" ? "+" : "-"}R$ {formatCurrency(Number(item.valor))}
                </span>
            </ListGroupItem>
        );
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
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell py-4 py-md-5">
                <AccountHeader name={getUserFirstName()} />

                <motion.main className="home-main" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

                    {/* 1 ── SALDO ───────────────────────────────── */}
                    <section className="home-balance-panel">
                        <div className="home-balance-inner">
                            <p className="home-balance-label">
                                {selectedMonth ? "Saldo projetado" : "Saldo bancário"}
                            </p>
                            <motion.h2 className="home-balance-value" key={projectedBalance}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                                R$ {formatCurrency(Number(projectedBalance))}
                            </motion.h2>
                            <span className="home-balance-note">
                                Recorrentes/mês:{" "}
                                <strong className={recurringSummary.balance >= 0 ? "home-item-value-credit" : "home-item-value-debit"}>
                                    {recurringSummary.balance >= 0 ? "+" : "-"}R$ {formatCurrency(Math.abs(recurringSummary.balance))}
                                </strong>
                            </span>
                        </div>

                        <div className="home-balance-stats">
                            <div>
                                <span>Entradas</span>
                                <strong className="home-item-value-credit">R$ {formatCurrency(currentMonthOverview.totalCredit)}</strong>
                            </div>
                            <div>
                                <span>Saídas</span>
                                <strong className="home-item-value-debit">R$ {formatCurrency(currentMonthOverview.totalDebit)}</strong>
                            </div>
                            <div>
                                <span>Resultado</span>
                                <strong className={currentMonthOverview.balance >= 0 ? "home-item-value-credit" : "home-item-value-debit"}>
                                    R$ {formatCurrency(currentMonthOverview.balance)}
                                </strong>
                            </div>
                            <div>
                                <span>Metas</span>
                                <strong>{goalsOverview.progress.toFixed(0)}%</strong>
                                <small>{goalsOverview.activeGoals} ativas</small>
                            </div>
                        </div>
                    </section>

                    {/* 2 ── AÇÕES PRINCIPAIS ───────────────────── */}
                    <section className="home-actions-section">
                        <nav className="home-actions-grid-main">
                            {mainActions.map((action, i) => (
                                <motion.button key={action.title} type="button"
                                    className={`home-action-card home-action-card-${action.variant}`}
                                    onClick={() => navigate(action.route)}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}>
                                    <div className="home-action-icon">
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>
                                    <strong>{action.title}</strong>
                                    <i className="bi bi-chevron-right home-action-chevron"></i>
                                </motion.button>
                            ))}
                        </nav>
                    </section>

                    {/* 3 ── SAVESCORE ──────────────────────────── */}
                    <SaveScoreCard score={financialScore} />

                    {/* 4 ── GRÁFICO ────────────────────────────── */}
                    <section className="home-graph-panel">
                        <GraphicCard user={user} selectedMonth={selectedMonth}
                            onSelectMonth={(monthKey) => {
                                if (monthKey === currentMonthKey) { setSelectedMonth(null); return; }
                                setSelectedMonth((cur) => cur === monthKey ? null : monthKey);
                            }} />
                    </section>

                    {/* 5 ── RECOMENDAÇÃO EDUCACIONAL ───────────── */}
                    <section className="home-education-section">
                        <EducationRecommendationCard recommendation={educationRecommendation} />
                    </section>

                    {/* 6 ── FERRAMENTAS ────────────────────────── */}
                    <section className="home-actions-section home-tools-section">
                        <div className="home-section-header">
                            <span className="home-kicker home-kicker-muted">Explorar</span>
                            <h5 className="home-section-title">Outras ferramentas</h5>
                        </div>
                        <nav className="home-tools-grid">
                            {secondaryActions.map((action) => (
                                <button key={action.title} type="button" className="home-tool-card" onClick={() => navigate(action.route)}>
                                    <div className="home-tool-icon">
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>
                                    <strong>{action.title}</strong>
                                </button>
                            ))}
                        </nav>
                    </section>

                    {/* 7 ── ATIVIDADE ──────────────────────────── */}
                    <section className="home-section">
                        <div className="home-section-header home-section-header-actions">
                            <div>
                                <span className="home-kicker">Atividade</span>
                                <h5 className="home-section-title">
                                    {selectedMonthLabel ? `Movimentações de ${selectedMonthLabel}` : "Últimas atividades"}
                                </h5>
                            </div>
                            <div className="home-header-actions">
                                <div className="home-activity-tabs">
                                    <button className={activityTab === "movements" ? "active" : ""} onClick={() => setActivityTab("movements")}>Movimentações</button>
                                    <button className={activityTab === "recurring"  ? "active" : ""} onClick={() => setActivityTab("recurring")}>Recorrentes</button>
                                </div>
                                <Button color="primary" size="sm" className="home-export-btn" onClick={handleExportPdf}>
                                    <i className="bi bi-file-earmark-text"></i> PDF
                                </Button>
                                {!selectedMonth && (
                                    <Button color="primary" size="sm" className="home-export-btn" onClick={() => navigate("/transaction-history")}>
                                        Ver tudo
                                    </Button>
                                )}
                            </div>
                        </div>

                        {statementOverview && activityTab === "movements" && (
                            <div className="home-section-summary">
                                <div><span>Créditos</span><strong className="home-item-value-credit">R$ {formatCurrency(statementOverview.totalCredit)}</strong></div>
                                <div><span>Débitos</span><strong className="home-item-value-debit">R$ {formatCurrency(statementOverview.totalDebit)}</strong></div>
                                <div>
                                    <span>Saldo</span>
                                    <strong className={statementOverview.balance >= 0 ? "home-item-value-credit" : "home-item-value-debit"}>
                                        R$ {formatCurrency(statementOverview.balance)}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {activityTab === "movements" ? (
                            displayExtratos.length > 0
                                ? <ListGroup flush className="home-list">{displayExtratos.map(renderExtratoItem)}</ListGroup>
                                : <div className="home-empty-state">Nenhuma movimentação recente.</div>
                        ) : recurringPreview.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringPreview.map((item) => (
                                    <ListGroupItem key={`${item.type}-${item.id}`}
                                        className={`home-list-item ${item.type === "credit" ? "home-list-item-credito" : "home-list-item-debito"}`}>
                                        <div className="home-list-left">
                                            <div className="home-list-icon"><i className="bi bi-repeat"></i></div>
                                            <div className="home-item-copy">
                                                <p className="home-item-title mb-1">{item.name}</p>
                                                <small className="home-item-subtitle d-block">
                                                    Todo dia {item.billingDate || item.billingDay} — {freqMap[item.frequency] || item.frequency}
                                                </small>
                                                {item.category && <small className="home-item-meta">{item.category}</small>}
                                            </div>
                                        </div>
                                        <span className={`home-item-value ${item.type === "credit" ? "home-item-value-credit" : "home-item-value-debit"}`}>
                                            {item.type === "credit" ? "+" : "-"}R$ {formatCurrency(Number(item.value))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : <div className="home-empty-state">Nenhum recorrente cadastrado.</div>}
                    </section>

                    {/* 8 ── BENEFÍCIOS ─────────────────────────── */}
                    {!selectedMonth && (
                        <section className="home-section home-benefits-section">
                            <div className="home-section-header">
                                <span className="home-kicker home-kicker-muted">Benefícios</span>
                                <h5 className="home-section-title">Programas e oportunidades</h5>
                            </div>
                            <div className="home-benefit-card" onClick={() => navigate("/benefits")}>
                                <div className="home-benefit-content">
                                    <div className="home-benefit-icon"><i className="bi bi-stars"></i></div>
                                    <div className="home-item-copy">
                                        <p className="home-item-title mb-1">Benefícios para estudantes de baixa renda</p>
                                        <small className="home-item-subtitle">Descubra auxílios, bolsas e programas de crédito estudantil.</small>
                                    </div>
                                </div>
                                <i className="bi bi-chevron-right home-benefit-arrow"></i>
                            </div>
                        </section>
                    )}

                </motion.main>
            </Container>
        </div>
    );
}