import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import { exportStatementPdf } from "../../utils/pdf";
import { BASE_URL, BENEFITS_API_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";

import EducationRecommendationCard from "../../components/education/EducationRecommendationCard";
import {
    getEducationRecommendation,
    type EducationRecommendation,
} from "../../services/educationApi";

import SaveScoreCard from "../../components/financial_health/SaveScoreCard";
import {
    analyzeFinancialHealth,
    type FinancialScoreResponse,
} from "../../services/financialHealthApi";

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
    description: string;
    icon: string;
    route: string;
    variant: "deposit" | "withdraw" | "goals" | "recurring";
};

type ToolAction = {
    title: string;
    description: string;
    icon: string;
    route: string;
};

const mainActions: QuickAction[] = [
    {
        title: "Depósito",
        description: "Adicionar saldo ou guardar em uma meta.",
        icon: "bi-arrow-down-left",
        route: "/deposit",
        variant: "deposit",
    },
    {
        title: "Saque",
        description: "Registrar saída e atualizar o saldo.",
        icon: "bi-arrow-up-right",
        route: "/withdraw",
        variant: "withdraw",
    },
    {
        title: "Metas",
        description: "Acompanhar objetivos e progresso.",
        icon: "bi-bullseye",
        route: "/goals",
        variant: "goals",
    },
    {
        title: "Recorrentes",
        description: "Controlar entradas e custos fixos.",
        icon: "bi-repeat",
        route: "/registerDebt",
        variant: "recurring",
    },
];

const secondaryActions: ToolAction[] = [
    {
        title: "Moedas",
        description: "Câmbio e conversões.",
        icon: "bi-currency-exchange",
        route: "/currency",
    },
    {
        title: "Investimentos",
        description: "Simulações e educação financeira.",
        icon: "bi-graph-up-arrow",
        route: "/investments",
    },
    {
        title: "Cartões e Bancos",
        description: "Compare contas, cartões, taxas e benefícios.",
        icon: "bi-credit-card-2-front",
        route: "/cards-banks",
    },
    {
        title: "Educação Financeira",
        description: "Aprenda a tomar decisões melhores com seu dinheiro.",
        icon: "bi-mortarboard-fill",
        route: "/financial-education",
    },
];

function getBenefitsApiRoot() {
    return BENEFITS_API_URL;
}

function normalizeRecurringItem(item: any): RecurringItem {
    const rawType = String(item.type ?? item.Type ?? "").toLowerCase();

    return {
        id: item.id ?? item.Id ?? Date.now(),
        userId: String(item.userId ?? item.UserId ?? ""),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type: rawType === "credit" ? "credit" : "debit",
        billingDate:
            item.billingDate ??
            item.BillingDate ??
            item.billingDay ??
            item.BillingDay ??
            1,
        billingDay:
            item.billingDay ??
            item.BillingDay ??
            item.billingDate ??
            item.BillingDate ??
            1,
        frequency: item.frequency ?? item.Frequency ?? "monthly",
        category: item.category ?? item.Category ?? "",
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

function mergeStatements(
    localStatements: Extrato[] = [],
    apiStatements: Extrato[] = []
) {
    const map = new Map<string, Extrato>();

    [...localStatements, ...apiStatements].forEach((item) => {
        const key = String(item.transactionId || item.id);
        map.set(key, item);
    });

    return Array.from(map.values());
}

function getDateFromValue(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

function getMonthKeyFromDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthStart(monthKey: string) {
    const [year, month] = monthKey.split("-");

    return new Date(Number(year), Number(month) - 1, 1);
}

function getMonthEnd(monthKey: string) {
    const [year, month] = monthKey.split("-");

    return new Date(Number(year), Number(month), 0);
}

function getRecurringType(item: RecurringItem) {
    if (item.type === "credit" || item.tipo === "credito") return "credit";

    return "debit";
}

function isRecurringValidForMonth(item: RecurringItem, monthKey: string) {
    if (item.isActive === false) return false;

    const monthStart = getMonthStart(monthKey);
    const monthEnd = getMonthEnd(monthKey);

    const startDate = getDateFromValue(item.startDate || item.createdAt || null);
    const endDate = getDateFromValue(item.endDate || null);

    if (startDate && startDate > monthEnd) return false;
    if (endDate && endDate < monthStart) return false;

    return true;
}

function getRecurringMonthlyEquivalent(item: RecurringItem) {
    if (item.monthlyEquivalent && item.monthlyEquivalent > 0) {
        return item.monthlyEquivalent;
    }

    const value = Number(item.value || 0);

    if (item.frequency === "daily") return value * 30;
    if (item.frequency === "weekly") return value * 4.33;
    if (item.frequency === "yearly") return value / 12;

    return value;
}

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [activityTab, setActivityTab] = useState<"movements" | "recurring">(
        "movements"
    );

    const [educationRecommendation, setEducationRecommendation] =
        useState<EducationRecommendation | null>(null);

    const [financialScore, setFinancialScore] =
        useState<FinancialScoreResponse | null>(null);

    const navigate = useNavigate();

    const freqMap: Record<string, string> = {
        daily: "Diária",
        weekly: "Semanal",
        monthly: "Mensal",
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
                saldo_final: Number(parsedUser.saldo_final || 0),
                extratos: parsedUser.extratos || [],
                goals: parsedUser.goals || [],
                recurringDebts: parsedUser.recurringDebts || [],
                recurringCredits: parsedUser.recurringCredits || [],
            };

            setUser(baseUser);

            try {
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (response.ok) {
                    const serverUser = await response.json();

                    baseUser = {
                        ...serverUser,
                        saldo_final: Number(
                            parsedUser.saldo_final ?? serverUser.saldo_final ?? 0
                        ),
                        extratos: mergeStatements(
                            serverUser.extratos || [],
                            parsedUser.extratos || []
                        ),
                        goals: parsedUser.goals || serverUser.goals || [],
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
                console.warn("Servidor principal indisponível. Usando usuário local.");
            }

            try {
                const balanceUrl = `${getBenefitsApiRoot()}/balance/user/${
                    parsedUser.id
                }/statements`;

                console.log("URL EXTRATOS BALANCE HOME:", balanceUrl);

                const balanceResponse = await fetch(balanceUrl);
                const rawBalance = await balanceResponse.text();

                if (balanceResponse.ok) {
                    const balanceData = JSON.parse(rawBalance);

                    const apiStatements = Array.isArray(balanceData)
                        ? balanceData.map(normalizeBalanceStatement)
                        : [];

                    baseUser = {
                        ...baseUser,
                        extratos: mergeStatements(
                            baseUser.extratos || [],
                            apiStatements
                        ),
                    };
                } else {
                    console.warn("Não foi possível buscar extratos do BalanceService:", {
                        status: balanceResponse.status,
                        body: rawBalance,
                    });
                }
            } catch (error) {
                console.warn("Não foi possível carregar extratos da API .NET na Home.", error);
            }

            try {
                const recurringUrl = `${getBenefitsApiRoot()}/recurring-transactions/user/${
                    parsedUser.id
                }`;

                console.log("URL RECORRENTES HOME:", recurringUrl);

                const recurringResponse = await fetch(recurringUrl);
                const raw = await recurringResponse.text();

                if (recurringResponse.ok) {
                    const recurringData = JSON.parse(raw);

                    const normalizedRecurrings = Array.isArray(recurringData)
                        ? recurringData.map(normalizeRecurringItem)
                        : [];

                    baseUser = {
                        ...baseUser,
                        recurringDebts: normalizedRecurrings.filter(
                            (item) => getRecurringType(item) === "debit"
                        ),
                        recurringCredits: normalizedRecurrings.filter(
                            (item) => getRecurringType(item) === "credit"
                        ),
                    };
                } else {
                    console.error("Erro ao buscar recorrentes na Home:", {
                        status: recurringResponse.status,
                        body: raw,
                    });
                }
            } catch (error) {
                console.warn("Não foi possível carregar recorrentes da API .NET na Home.", error);
            }

            setUser(baseUser);
            localStorage.setItem("loggedUser", JSON.stringify(baseUser));
        }

        loadUser();
    }, [navigate]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function getCurrentMonthKey() {
        return getMonthKeyFromDate(new Date());
    }

    function getMonthKey(dateStr?: string) {
        if (!dateStr) return "";

        const parts = dateStr.split("/");

        if (parts.length === 3) {
            const [, month, year] = parts;
            return `${year}-${String(Number(month)).padStart(2, "0")}`;
        }

        const parsed = new Date(dateStr);

        if (Number.isNaN(parsed.getTime())) return "";

        return getMonthKeyFromDate(parsed);
    }

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function calculateTotalForMonth(recurring: RecurringItem, monthKey: string) {
        if (!isRecurringValidForMonth(recurring, monthKey)) return 0;

        if (recurring.monthlyEquivalent && recurring.monthlyEquivalent > 0) {
            return recurring.monthlyEquivalent;
        }

        const [year, monthStr] = monthKey.split("-");
        const yearNumber = Number(year);
        const monthNumber = Number(monthStr) - 1;
        const daysInMonth = getDaysInMonth(yearNumber, monthNumber);

        switch (recurring.frequency) {
            case "daily":
                return Number(recurring.value || 0) * daysInMonth;
            case "weekly":
                return Number(recurring.value || 0) * Math.ceil(daysInMonth / 7);
            case "yearly":
                return Number(recurring.value || 0) / 12;
            case "monthly":
            default:
                return Number(recurring.value || 0);
        }
    }

    function getUserFirstName() {
        const name = user?.nome || user?.name || "usuário";
        return name.split(" ")[0];
    }

    function getTransactionTitle(item: Extrato) {
        if (item.descricao) return item.descricao;
        return item.tipo === "credito" ? "Depósito" : "Saque";
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

    const currentMonthKey = getCurrentMonthKey();

    const selectedMonthLabel = useMemo(() => {
        if (!selectedMonth) return null;

        const [year, month] = selectedMonth.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);

        return date.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
        });
    }, [selectedMonth]);

    const statementMonthKey = selectedMonth || currentMonthKey;

    const statementMonthLabel =
        selectedMonthLabel ||
        new Date().toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
        });

    const statementMode = selectedMonth
        ? selectedMonth < currentMonthKey
            ? "past"
            : selectedMonth === currentMonthKey
              ? "current"
              : "future"
        : "current";

    const recurringDebts = user?.recurringDebts || [];
    const recurringCredits = user?.recurringCredits || [];

    const recurringSummary = useMemo(() => {
        const totalCredits = recurringCredits
            .filter((item) => isRecurringValidForMonth(item, currentMonthKey))
            .reduce((sum, item) => sum + getRecurringMonthlyEquivalent(item), 0);

        const totalDebts = recurringDebts
            .filter((item) => isRecurringValidForMonth(item, currentMonthKey))
            .reduce((sum, item) => sum + getRecurringMonthlyEquivalent(item), 0);

        return {
            totalCredits,
            totalDebts,
            balance: totalCredits - totalDebts,
        };
    }, [recurringCredits, recurringDebts, currentMonthKey]);

    useEffect(() => {
        async function loadEducationRecommendation() {
            if (!user?.id) return;

            const recommendation = await getEducationRecommendation(user.id, "home", {
                balance: Number(user.saldo_final || 0),
                recurringCredits: recurringSummary.totalCredits,
                recurringDebits: recurringSummary.totalDebts,
            });

            setEducationRecommendation(recommendation);
        }

        loadEducationRecommendation();
    }, [
        user?.id,
        user?.saldo_final,
        recurringSummary.totalCredits,
        recurringSummary.totalDebts,
    ]);

    const projectedBalance = useMemo(() => {
        if (!user) return 0;

        if (!selectedMonth) {
            return Number(user.saldo_final || 0) + recurringSummary.balance;
        }

        if (selectedMonth < currentMonthKey) {
            return Number(user.saldo_final || 0);
        }

        let sum = 0;
        let monthCursor = currentMonthKey;

        while (monthCursor <= selectedMonth) {
            for (const debt of user.recurringDebts || []) {
                sum -= calculateTotalForMonth(debt, monthCursor);
            }

            for (const credit of user.recurringCredits || []) {
                sum += calculateTotalForMonth(credit, monthCursor);
            }

            const [year, month] = monthCursor.split("-");
            const next = new Date(Number(year), Number(month), 1);

            monthCursor = `${next.getFullYear()}-${String(
                next.getMonth() + 1
            ).padStart(2, "0")}`;
        }

        return Number(user.saldo_final || 0) + sum;
    }, [user, selectedMonth, currentMonthKey, recurringSummary.balance]);

    const statementItems = useMemo(() => {
        if (!user) return [];

        const actualItems = [...(user.extratos || [])].filter(
            (item) => getMonthKey(item.data || item.createdAt) === statementMonthKey
        );

        const showRecurringInMonth = statementMonthKey >= currentMonthKey;

        const recurringPreview: Extrato[] = showRecurringInMonth
            ? [
                  ...(user.recurringDebts || [])
                      .filter((debt) =>
                          isRecurringValidForMonth(debt, statementMonthKey)
                      )
                      .map((debt) => ({
                          id: `recurring-debit-${debt.id}-${statementMonthKey}`,
                          data: `${statementMonthKey.split("-")[1]}/${
                              statementMonthKey.split("-")[0]
                          }`,
                          descricao: `Débito recorrente: ${debt.name}`,
                          valor: calculateTotalForMonth(debt, statementMonthKey),
                          tipo: "debito" as const,
                          status:
                              statementMode === "future" ? "Previsto" : "Recorrente",
                      })),
                  ...(user.recurringCredits || [])
                      .filter((credit) =>
                          isRecurringValidForMonth(credit, statementMonthKey)
                      )
                      .map((credit) => ({
                          id: `recurring-credit-${credit.id}-${statementMonthKey}`,
                          data: `${statementMonthKey.split("-")[1]}/${
                              statementMonthKey.split("-")[0]
                          }`,
                          descricao: `Crédito recorrente: ${credit.name}`,
                          valor: calculateTotalForMonth(credit, statementMonthKey),
                          tipo: "credito" as const,
                          status:
                              statementMode === "future" ? "Previsto" : "Recorrente",
                      })),
              ]
            : [];

        return [...actualItems, ...recurringPreview];
    }, [user, statementMonthKey, currentMonthKey, statementMode]);

    const displayExtratos = useMemo(() => {
        if (!user) return [];

        if (!selectedMonth) {
            return [...(user.extratos || [])].reverse().slice(0, 5);
        }

        return statementItems;
    }, [user, selectedMonth, statementItems]);

    const statementOverview = useMemo(() => {
        if (!statementItems.length) return null;

        const totalCredit = statementItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const totalDebit = statementItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const balance = totalCredit - totalDebit;

        const biggestMovement = statementItems.reduce((current, item) => {
            return Math.abs(Number(item.valor)) > Math.abs(Number(current.valor))
                ? item
                : current;
        }, statementItems[0]);

        return {
            totalCredit,
            totalDebit,
            balance,
            count: statementItems.length,
            biggestMovement,
            statusText: balance < 0 ? "Atenção" : "Adequado",
            note:
                statementMode === "future"
                    ? "Projeção com base nos seus recorrentes."
                    : statementMode === "past"
                      ? "Extrato histórico do mês selecionado."
                      : "Movimentações do mês atual.",
        };
    }, [statementItems, statementMode]);

    const currentMonthOverview = useMemo(() => {
        if (!user) {
            return {
                totalCredit: 0,
                totalDebit: 0,
                balance: 0,
            };
        }

        const currentItems = (user.extratos || []).filter((item) => {
            return getMonthKey(item.data || item.createdAt) === currentMonthKey;
        });

        const totalCredit = currentItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const totalDebit = currentItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        return {
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
        };
    }, [user, currentMonthKey]);

    const goalsOverview = useMemo(() => {
        const goals = user?.goals || [];

        const activeGoals = goals.filter(
            (goal) => goal.status !== "completed"
        ).length;

        const completedGoals = goals.filter(
            (goal) => goal.status === "completed"
        ).length;

        const totalTarget = goals.reduce(
            (sum, goal) => sum + Number(goal.targetAmount || 0),
            0
        );

        const totalCurrent = goals.reduce(
            (sum, goal) => sum + Number(goal.currentAmount || 0),
            0
        );

        const progress =
            totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0;

        return {
            activeGoals,
            completedGoals,
            totalTarget,
            totalCurrent,
            progress,
        };
    }, [user]);

    useEffect(() => {
        async function loadFinancialHealth() {
            if (!user?.id) return;

            const goals = user.goals || [];
            const extratos = user.extratos || [];

            const currentItems = extratos.filter((item) => {
                return getMonthKey(item.data || item.createdAt) === currentMonthKey;
            });

            const monthlyCredits = currentItems
                .filter((item) => item.tipo === "credito")
                .reduce((sum, item) => sum + Number(item.valor || 0), 0);

            const monthlyDebits = currentItems
                .filter((item) => item.tipo === "debito")
                .reduce((sum, item) => sum + Number(item.valor || 0), 0);

            const goalsTargetTotal = goals.reduce(
                (sum, goal) => sum + Number(goal.targetAmount || 0),
                0
            );

            const goalsCurrentTotal = goals.reduce(
                (sum, goal) => sum + Number(goal.currentAmount || 0),
                0
            );

            const hasEmergencyReserve = goals.some((goal) => {
                const text = `${goal.title || ""} ${goal.name || ""}`.toLowerCase();

                return (
                    text.includes("reserva") ||
                    text.includes("emergência") ||
                    text.includes("emergencia")
                );
            });

            const response = await analyzeFinancialHealth({
                userId: user.id,

                balance: Number(user.saldo_final || 0),
                monthlyIncome: recurringSummary.totalCredits || monthlyCredits,

                monthlyRecurringCredits: recurringSummary.totalCredits,
                monthlyRecurringDebits: recurringSummary.totalDebts,

                monthlyCredits,
                monthlyDebits,

                transactionsCount: extratos.length,

                goalsCount: goals.length,
                activeGoalsCount: goals.filter(
                    (goal) => goal.status !== "completed"
                ).length,
                completedGoalsCount: goals.filter(
                    (goal) => goal.status === "completed"
                ).length,

                goalsTargetTotal,
                goalsCurrentTotal,

                hasEmergencyReserve,

                lessonsOpened: Number(localStorage.getItem("lessonsOpened") || 0),
                lessonsCompleted: Number(
                    localStorage.getItem("lessonsCompleted") || 0
                ),
            });

            setFinancialScore(response);
        }

        loadFinancialHealth();
    }, [
        user?.id,
        user?.saldo_final,
        user?.extratos,
        user?.goals,
        recurringSummary.totalCredits,
        recurringSummary.totalDebts,
        currentMonthKey,
    ]);

    const homeInsight = useMemo(() => {
        if (recurringSummary.balance < 0) {
            return "Seus custos recorrentes estão pesando no saldo projetado.";
        }

        if (recurringSummary.balance > 0) {
            return "Suas entradas recorrentes estão ajudando o saldo projetado.";
        }

        if (currentMonthOverview.balance > 0) {
            return "Você está com resultado positivo neste mês.";
        }

        if (currentMonthOverview.balance < 0) {
            return "Suas saídas passaram das entradas neste mês.";
        }

        return "Acompanhe seus gastos, metas e recorrentes em um só lugar.";
    }, [currentMonthOverview.balance, recurringSummary.balance]);

    const recurringPreview = useMemo(() => {
        const credits = recurringCredits.map((item) => ({
            ...item,
            type: "credit" as const,
        }));

        const debts = recurringDebts.map((item) => ({
            ...item,
            type: "debit" as const,
        }));

        return [...credits, ...debts].slice(0, 6);
    }, [recurringCredits, recurringDebts]);

    function handleExportPdf() {
        if (!user) return;

        const rows = statementItems.map((item) => ({
            data: item.data,
            hora: item.hora || "",
            descricao:
                item.descricao || (item.tipo === "credito" ? "Crédito" : "Débito"),
            tipo: item.tipo === "credito" ? "Crédito" : "Débito",
            valor: `R$ ${formatCurrency(Number(item.valor))}`,
        }));

        const totalCredit = statementItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);

        const totalDebit = statementItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);

        const balance = totalCredit - totalDebit;

        const footers = [
            { label: "Total crédito", value: `R$ ${formatCurrency(totalCredit)}` },
            { label: "Total débito", value: `R$ ${formatCurrency(totalDebit)}` },
            { label: "Saldo do período", value: `R$ ${formatCurrency(balance)}` },
            { label: "Panorama", value: balance < 0 ? "Atenção" : "Adequado" },
        ];

        const fileName = selectedMonth
            ? `extrato_${selectedMonth}.pdf`
            : `extrato_atual_${currentMonthKey}.pdf`;

        exportStatementPdf({
            title: `Extrato de ${statementMonthLabel}`,
            subtitle: `Usuário: ${user.nome}`,
            logoText: "SAVE PROJECT",
            rows,
            footers,
            fileName,
        });
    }

    function renderExtratoItem(item: Extrato) {
        return (
            <ListGroupItem
                key={item.id}
                className={`home-list-item home-list-item-${item.tipo}`}
                onClick={() => {
                    if (String(item.id).includes("recurring")) return;
                    navigate(`/transaction/${item.id}`);
                }}
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

                        {getSafeExtraInfo(item) && (
                            <small className="home-item-meta">
                                {getSafeExtraInfo(item)}
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

                <motion.main
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <section className="home-hero-panel">
                        <div className="home-hero-copy">
                            <span className="home-kicker">Resumo financeiro</span>
                            {/* <h1>Olá, {getUserFirstName()}</h1> */}
                            <h1>Já sabe dos seus gastos?</h1>
                            <p>{homeInsight}</p>
                        </div>

                        <div className="home-balance-wrap">
                            <p className="home-balance-label">
                                {selectedMonth ? "Saldo projetado" : "Saldo bancário"}
                            </p>

                            <motion.h2
                                className="home-balance-value"
                                key={projectedBalance}
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                R$ {formatCurrency(Number(projectedBalance))}
                            </motion.h2>

                            <span className="home-balance-note">
                                Recorrentes/mês:{" "}
                                <strong
                                    className={
                                        recurringSummary.balance >= 0
                                            ? "home-item-value-credit"
                                            : "home-item-value-debit"
                                    }
                                >
                                    {recurringSummary.balance >= 0 ? "+" : "-"}R${" "}
                                    {formatCurrency(Math.abs(recurringSummary.balance))}
                                </strong>
                            </span>
                        </div>
                    </section>

                    <SaveScoreCard score={financialScore} />

                    <section className="home-graph-panel">
                        <GraphicCard
                            user={user}
                            selectedMonth={selectedMonth}
                            onSelectMonth={(monthKey) => {
                                if (monthKey === currentMonthKey) {
                                    setSelectedMonth(null);
                                    return;
                                }

                                setSelectedMonth((current) =>
                                    current === monthKey ? null : monthKey
                                );
                            }}
                        />
                    </section>

                    <section className="home-education-section">
                        <div className="home-section-header">
                            <div>
                                <span className="home-kicker home-kicker-muted">
                                    Aprenda com seus dados
                                </span>
                                <h5 className="home-section-title">
                                    Interpretação financeira do mês
                                </h5>
                            </div>
                        </div>

                        <EducationRecommendationCard
                            recommendation={educationRecommendation}
                        />
                    </section>

                    <section className="home-actions-section home-actions-section-main">
                        <div className="home-section-header">
                            <div>
                                <span className="home-kicker">Ações principais</span>
                                <h5 className="home-section-title">
                                    O que você quer fazer agora?
                                </h5>
                            </div>
                        </div>

                        <nav className="home-actions-grid home-actions-grid-main">
                            {mainActions.map((action, index) => (
                                <motion.button
                                    key={action.title}
                                    type="button"
                                    className={`home-action-card home-action-card-${action.variant}`}
                                    onClick={() => navigate(action.route)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04, duration: 0.25 }}
                                >
                                    <div className="home-action-icon">
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>

                                    <div className="home-action-content">
                                        <strong>{action.title}</strong>
                                        <small>{action.description}</small>
                                    </div>

                                    <i className="bi bi-chevron-right home-action-chevron"></i>
                                </motion.button>
                            ))}
                        </nav>
                    </section>

                    <section className="home-mini-overview">
                        <div className="home-mini-card">
                            <span>Entradas do mês</span>
                            <strong className="home-item-value-credit">
                                R$ {formatCurrency(currentMonthOverview.totalCredit)}
                            </strong>
                        </div>

                        <div className="home-mini-card">
                            <span>Saídas do mês</span>
                            <strong className="home-item-value-debit">
                                R$ {formatCurrency(currentMonthOverview.totalDebit)}
                            </strong>
                        </div>

                        <div className="home-mini-card">
                            <span>Resultado</span>
                            <strong
                                className={
                                    currentMonthOverview.balance >= 0
                                        ? "home-item-value-credit"
                                        : "home-item-value-debit"
                                }
                            >
                                R$ {formatCurrency(currentMonthOverview.balance)}
                            </strong>
                        </div>

                        <div className="home-mini-card">
                            <span>Metas</span>
                            <strong>{goalsOverview.progress.toFixed(0)}%</strong>
                            <small>
                                {goalsOverview.activeGoals} ativas •{" "}
                                {goalsOverview.completedGoals} concluídas
                            </small>
                        </div>
                    </section>

                    <section className="home-actions-section home-tools-section">
                        <div className="home-section-header">
                            <div>
                                <span className="home-kicker home-kicker-muted">
                                    Outras ferramentas
                                </span>
                                <h5 className="home-section-title">Explorar recursos</h5>
                            </div>
                        </div>

                        <nav className="home-tools-grid">
                            {secondaryActions.map((action) => (
                                <button
                                    key={action.title}
                                    type="button"
                                    className="home-tool-card"
                                    onClick={() => navigate(action.route)}
                                >
                                    <div className="home-tool-icon">
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>

                                    <div>
                                        <strong>{action.title}</strong>
                                        <small>{action.description}</small>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header home-section-header-actions">
                            <div>
                                <span className="home-kicker">Atividade</span>
                                <h5 className="home-section-title">
                                    {selectedMonthLabel
                                        ? `Movimentações de ${selectedMonthLabel}`
                                        : "Últimas atividades"}
                                </h5>
                            </div>

                            <div className="home-header-actions">
                                <div className="home-activity-tabs">
                                    <button
                                        className={activityTab === "movements" ? "active" : ""}
                                        onClick={() => setActivityTab("movements")}
                                    >
                                        Movimentações
                                    </button>

                                    <button
                                        className={activityTab === "recurring" ? "active" : ""}
                                        onClick={() => setActivityTab("recurring")}
                                    >
                                        Recorrentes
                                    </button>
                                </div>

                                <Button
                                    color="primary"
                                    size="sm"
                                    className="home-export-btn"
                                    onClick={handleExportPdf}
                                >
                                    <i className="bi bi-file-earmark-text"></i>
                                    PDF
                                </Button>

                                {!selectedMonth && (
                                    <Button
                                        color="primary"
                                        size="sm"
                                        className="home-export-btn"
                                        onClick={() => navigate("/transaction-history")}
                                    >
                                        Ver tudo
                                    </Button>
                                )}
                            </div>
                        </div>

                        {statementOverview && activityTab === "movements" && (
                            <div className="home-section-summary">
                                <div>
                                    <span>Créditos</span>
                                    <strong className="home-item-value-credit">
                                        R$ {formatCurrency(statementOverview.totalCredit)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Débitos</span>
                                    <strong className="home-item-value-debit">
                                        R$ {formatCurrency(statementOverview.totalDebit)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Saldo do período</span>
                                    <strong
                                        className={
                                            statementOverview.balance >= 0
                                                ? "home-item-value-credit"
                                                : "home-item-value-debit"
                                        }
                                    >
                                        R$ {formatCurrency(statementOverview.balance)}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {activityTab === "movements" ? (
                            displayExtratos.length > 0 ? (
                                <ListGroup flush className="home-list">
                                    {displayExtratos.map(renderExtratoItem)}
                                </ListGroup>
                            ) : (
                                <div className="home-empty-state">
                                    Nenhuma movimentação recente.
                                </div>
                            )
                        ) : recurringPreview.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringPreview.map((item) => (
                                    <ListGroupItem
                                        key={`${item.type}-${item.id}`}
                                        className={`home-list-item ${
                                            item.type === "credit"
                                                ? "home-list-item-credito"
                                                : "home-list-item-debito"
                                        }`}
                                    >
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i className="bi bi-repeat"></i>
                                            </div>

                                            <div className="home-item-copy">
                                                <p className="home-item-title mb-1">
                                                    {item.name}
                                                </p>

                                                <small className="home-item-subtitle d-block">
                                                    Todo dia{" "}
                                                    {item.billingDate || item.billingDay} —{" "}
                                                    {freqMap[item.frequency] ||
                                                        item.frequency}
                                                </small>

                                                {item.category && (
                                                    <small className="home-item-meta">
                                                        {item.category}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`home-item-value ${
                                                item.type === "credit"
                                                    ? "home-item-value-credit"
                                                    : "home-item-value-debit"
                                            }`}
                                        >
                                            {item.type === "credit" ? "+" : "-"}R${" "}
                                            {formatCurrency(Number(item.value))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhum recorrente cadastrado.
                            </div>
                        )}
                    </section>

                    {!selectedMonth && (
                        <section id="benefits" className="home-section home-benefits-section">
                            <div className="home-section-header">
                                <div>
                                    <span className="home-kicker home-kicker-muted">
                                        Benefícios
                                    </span>
                                    <h5 className="home-section-title">
                                        Programas e oportunidades
                                    </h5>
                                </div>
                            </div>

                            <div
                                className="home-benefit-card"
                                onClick={() => navigate("/benefits")}
                            >
                                <div className="home-benefit-content">
                                    <div className="home-benefit-icon">
                                        <i className="bi bi-stars"></i>
                                    </div>

                                    <div className="home-item-copy">
                                        <p className="home-item-title mb-1">
                                            Benefícios para estudantes de baixa renda
                                        </p>
                                        <small className="home-item-subtitle">
                                            Descubra auxílios, bolsas e programas de crédito estudantil.
                                        </small>
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