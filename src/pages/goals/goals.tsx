import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import { BENEFITS_API_URL } from "../../config";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

import EducationRecommendationCard from "../../components/education/EducationRecommendationCard";
import {
    getEducationRecommendation,
    type EducationRecommendation,
} from "../../services/educationApi";

import "./Goals.scss";

type GoalStatus = "active" | "completed";
type GoalPriority = "baixa" | "media" | "alta";
type GoalCategory =
    | "reserva"
    | "viagem"
    | "estudos"
    | "compras"
    | "casa"
    | "veiculo"
    | "investimento"
    | "outros";

type GoalMovementType = "add" | "remove";

type GoalDeposit = {
    id: number;
    amount: number;
    description: string;
    date: string;
    type: GoalMovementType;
};

type Goal = {
    id: number;
    userId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string | null;
    category: GoalCategory;
    priority: GoalPriority;
    icon: string;
    color: string;
    notes: string;
    status: GoalStatus;

    progressPercentage: number;
    missingAmount: number;
    daysLeft: number | null;
    monthsLeft: number | null;
    monthlyNeeded: number;

    insightTitle: string;
    insightMessage: string;
    insightTone: "success" | "warning" | "danger" | "info";

    isCompleted: boolean;
    isExpired: boolean;

    deposits: GoalDeposit[];

    createdAt: string;
    updatedAt: string;
};

type GoalForm = {
    title: string;
    targetAmount: string;
    currentAmount: string;
    monthlyContribution: string;
    deadline: string;
    category: GoalCategory;
    priority: GoalPriority;
    icon: string;
    color: string;
    notes: string;
};

type User = {
    id: number | string;
    nome?: string;
    name?: string;
    goals?: Goal[];
};

const emptyForm: GoalForm = {
    title: "",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    deadline: "",
    category: "reserva",
    priority: "media",
    icon: "bi-bullseye",
    color: "#38bdf8",
    notes: "",
};

const categoryLabels: Record<GoalCategory, string> = {
    reserva: "Reserva",
    viagem: "Viagem",
    estudos: "Estudos",
    compras: "Compras",
    casa: "Casa",
    veiculo: "Veículo",
    investimento: "Investimento",
    outros: "Outros",
};

const priorityLabels: Record<GoalPriority, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
};

const iconOptions = [
    { value: "bi-bullseye", label: "Meta" },
    { value: "bi-piggy-bank-fill", label: "Reserva" },
    { value: "bi-airplane-fill", label: "Viagem" },
    { value: "bi-mortarboard-fill", label: "Estudos" },
    { value: "bi-bag-fill", label: "Compra" },
    { value: "bi-house-door-fill", label: "Casa" },
    { value: "bi-car-front-fill", label: "Veículo" },
    { value: "bi-graph-up-arrow", label: "Investimento" },
    { value: "bi-gift-fill", label: "Presente" },
];

const colorOptions = [
    "#38bdf8",
    "#22c55e",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
    "#14b8a6",
];

function getApiRoot() {
    return BENEFITS_API_URL;
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value || 0);
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
    if (!value) return "Sem prazo";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10).split("-").reverse().join("/");
    }

    return date.toLocaleDateString("pt-BR");
}

function normalizeNullableNumber(value: unknown) {
    if (value === null || value === undefined) return null;

    const parsed = Number(value);

    return Number.isNaN(parsed) ? null : parsed;
}

function normalizeGoal(item: any): Goal {
    const rawDaysLeft = item.daysLeft ?? item.DaysLeft;
    const rawMonthsLeft = item.monthsLeft ?? item.MonthsLeft;

    return {
        id: Number(item.id ?? item.Id ?? Date.now()),
        userId: String(item.userId ?? item.UserId ?? ""),

        title: item.title ?? item.Title ?? "",
        targetAmount: Number(item.targetAmount ?? item.TargetAmount ?? 0),
        currentAmount: Number(item.currentAmount ?? item.CurrentAmount ?? 0),
        monthlyContribution: Number(
            item.monthlyContribution ?? item.MonthlyContribution ?? 0
        ),

        deadline: item.deadline ?? item.Deadline ?? null,

        category: (item.category ?? item.Category ?? "reserva") as GoalCategory,
        priority: (item.priority ?? item.Priority ?? "media") as GoalPriority,

        icon: item.icon ?? item.Icon ?? "bi-bullseye",
        color: item.color ?? item.Color ?? "#38bdf8",
        notes: item.notes ?? item.Notes ?? "",

        status: (item.status ?? item.Status ?? "active") as GoalStatus,

        progressPercentage: Number(
            item.progressPercentage ?? item.ProgressPercentage ?? 0
        ),
        missingAmount: Number(item.missingAmount ?? item.MissingAmount ?? 0),
        daysLeft: normalizeNullableNumber(rawDaysLeft),
        monthsLeft: normalizeNullableNumber(rawMonthsLeft),
        monthlyNeeded: Number(item.monthlyNeeded ?? item.MonthlyNeeded ?? 0),

        insightTitle:
            item.insightTitle ?? item.InsightTitle ?? "Meta em andamento",
        insightMessage:
            item.insightMessage ??
            item.InsightMessage ??
            "Acompanhe sua evolução para manter a meta no caminho certo.",
        insightTone: (item.insightTone ?? item.InsightTone ?? "info") as
            | "success"
            | "warning"
            | "danger"
            | "info",

        isCompleted: Boolean(item.isCompleted ?? item.IsCompleted ?? false),
        isExpired: Boolean(item.isExpired ?? item.IsExpired ?? false),

        deposits: Array.isArray(item.deposits ?? item.Deposits)
            ? (item.deposits ?? item.Deposits).map((deposit: any) => ({
                  id: Number(deposit.id ?? deposit.Id ?? Date.now()),
                  amount: Number(deposit.amount ?? deposit.Amount ?? 0),
                  description: deposit.description ?? deposit.Description ?? "",
                  date: deposit.date ?? deposit.Date ?? new Date().toISOString(),
                  type: (deposit.type ?? deposit.Type ?? "add") as GoalMovementType,
              }))
            : [],

        createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.UpdatedAt ?? new Date().toISOString(),
    };
}

function buildGoalPayload(form: GoalForm, userId: number | string) {
    return {
        userId: String(userId),
        title: form.title.trim(),
        targetAmount: Number(form.targetAmount || 0),
        currentAmount: Number(form.currentAmount || 0),
        monthlyContribution: Number(form.monthlyContribution || 0),
        deadline: form.deadline && form.deadline !== "sem-prazo" ? form.deadline : null,
        category: form.category,
        priority: form.priority,
        icon: form.icon,
        color: form.color,
        notes: form.notes.trim(),
    };
}

function getMainGoalForEducation(goals: Goal[]) {
    const activeGoals = goals.filter((goal) => goal.status === "active");

    if (activeGoals.length === 0) return goals[0] || null;

    const withoutContribution = activeGoals.find(
        (goal) => Number(goal.monthlyContribution || 0) <= 0
    );

    if (withoutContribution) return withoutContribution;

    const mostIncomplete = [...activeGoals].sort(
        (a, b) => Number(b.missingAmount || 0) - Number(a.missingAmount || 0)
    )[0];

    return mostIncomplete || activeGoals[0] || null;
}

export default function GoalsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [form, setForm] = useState<GoalForm>(emptyForm);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [movementGoalId, setMovementGoalId] = useState<number | null>(null);
    const [movementType, setMovementType] = useState<GoalMovementType>("add");
    const [movementAmount, setMovementAmount] = useState("");
    const [movementDescription, setMovementDescription] = useState("");

    const [educationRecommendation, setEducationRecommendation] =
        useState<EducationRecommendation | null>(null);

    const [filter, setFilter] = useState<"active" | "completed" | "all">(
        "active"
    );
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const userName = user?.nome || user?.name || "Usuário";

    useEffect(() => {
        async function loadInitialData() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                setLoading(false);
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            await loadGoals(parsedUser.id, "active");

            setLoading(false);
        }

        loadInitialData();
    }, []);

    useEffect(() => {
        if (!user) return;

        loadGoals(user.id, filter);
    }, [filter]);

    useEffect(() => {
        async function loadEducationRecommendation() {
            if (!user?.id) return;

            const mainGoal = getMainGoalForEducation(goals);

            const recommendation = await getEducationRecommendation(user.id, "goals", {
                hasGoals: goals.length > 0,
                goalTargetAmount: mainGoal?.targetAmount || 0,
                goalCurrentAmount: mainGoal?.currentAmount || 0,
                monthlyContribution: mainGoal?.monthlyContribution || 0,
            });

            setEducationRecommendation(recommendation);
        }

        loadEducationRecommendation();
    }, [user?.id, goals]);

    async function loadGoals(userId: number | string, status = filter) {
        try {
            const response = await fetch(
                `${getApiRoot()}/goals/user/${userId}?status=${status}`
            );

            if (!response.ok) {
                const raw = await response.text();

                console.error("Erro da API ao carregar metas:", {
                    url: `${getApiRoot()}/goals/user/${userId}?status=${status}`,
                    status: response.status,
                    body: raw,
                });

                throw new Error("Erro ao carregar metas.");
            }

            const data = await response.json();
            const normalizedGoals = Array.isArray(data)
                ? data.map(normalizeGoal)
                : [];

            setGoals(normalizedGoals);
            updateUserGoalsCache(normalizedGoals);
        } catch (error) {
            console.warn("Falha ao buscar metas na API. Usando cache local.", error);

            const storedUser = localStorage.getItem("loggedUser");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const localGoals = Array.isArray(parsedUser.goals)
                    ? parsedUser.goals.map(normalizeGoal)
                    : [];

                setGoals(
                    status === "all"
                        ? localGoals
                        : localGoals.filter((goal: Goal) => goal.status === status)
                );
            }
        }
    }

    function updateUserGoalsCache(updatedGoals: Goal[]) {
        const storedUser = localStorage.getItem("loggedUser");

        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const updatedUser = {
            ...parsedUser,
            goals: updatedGoals,
        };

        setUser(updatedUser);
        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    }

    const filteredGoals = useMemo(() => {
        const term = search.trim().toLowerCase();

        return goals.filter((goal) => {
            const matchesSearch =
                !term ||
                [
                    goal.title,
                    goal.category,
                    goal.priority,
                    goal.notes,
                    goal.insightTitle,
                    goal.insightMessage,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);

            return matchesSearch;
        });
    }, [goals, search]);

    const summary = useMemo(() => {
        const allGoals = goals;
        const activeGoals = allGoals.filter((goal) => goal.status === "active");
        const completedGoals = allGoals.filter(
            (goal) => goal.status === "completed" || goal.isCompleted
        );

        const targetTotal = allGoals.reduce(
            (sum, goal) => sum + goal.targetAmount,
            0
        );

        const currentTotal = allGoals.reduce(
            (sum, goal) => sum + goal.currentAmount,
            0
        );

        const averageProgress =
            allGoals.length > 0
                ? allGoals.reduce((sum, goal) => sum + goal.progressPercentage, 0) /
                  allGoals.length
                : 0;

        return {
            total: allGoals.length,
            active: activeGoals.length,
            completed: completedGoals.length,
            targetTotal,
            currentTotal,
            averageProgress,
        };
    }, [goals]);

    function updateForm<K extends keyof GoalForm>(key: K, value: GoalForm[K]) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function resetForm() {
        setForm(emptyForm);
        setEditingId(null);
    }

    function validateForm() {
        if (!user) {
            showMessage("Usuário não encontrado. Faça login novamente.");
            return false;
        }

        if (!String(user.id || "").trim()) {
            showMessage("ID do usuário inválido. Faça login novamente.");
            return false;
        }

        if (!form.title.trim()) {
            showMessage("Informe o nome da meta.");
            return false;
        }

        if (Number(form.targetAmount || 0) <= 0) {
            showMessage("O valor alvo precisa ser maior que zero.");
            return false;
        }

        if (Number(form.currentAmount || 0) < 0) {
            showMessage("O valor atual não pode ser negativo.");
            return false;
        }

        if (Number(form.monthlyContribution || 0) < 0) {
            showMessage("O aporte mensal não pode ser negativo.");
            return false;
        }

        return true;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm() || !user) return;

        try {
            setSaving(true);

            const payload = buildGoalPayload(form, user.id);
            const url = editingId
                ? `${getApiRoot()}/goals/${editingId}`
                : `${getApiRoot()}/goals`;

            console.log("URL SALVAR META:", url);
            console.log("PAYLOAD META:", payload);

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro da API ao salvar meta:", {
                    url,
                    status: response.status,
                    body: raw,
                    payload,
                });

                throw new Error(raw || "Erro ao salvar meta.");
            }

            const savedGoal = normalizeGoal(JSON.parse(raw));

            const updatedGoals = editingId
                ? goals.map((goal) => (goal.id === editingId ? savedGoal : goal))
                : [savedGoal, ...goals];

            setGoals(updatedGoals);
            updateUserGoalsCache(updatedGoals);

            showMessage(
                editingId ? "Meta atualizada com sucesso." : "Meta criada com sucesso."
            );
            resetForm();
        } catch (error) {
            console.error("Erro completo ao salvar meta:", error);
            showMessage("Erro ao salvar meta. Verifique se a API .NET está rodando.");
        } finally {
            setSaving(false);
        }
    }

    function startEdit(goal: Goal) {
        setEditingId(goal.id);
        setForm({
            title: goal.title,
            targetAmount: String(goal.targetAmount),
            currentAmount: String(goal.currentAmount),
            monthlyContribution: String(goal.monthlyContribution),
            deadline: toInputDate(goal.deadline),
            category: goal.category,
            priority: goal.priority,
            icon: goal.icon || "bi-bullseye",
            color: goal.color || "#38bdf8",
            notes: goal.notes,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(goalId: number) {
        const confirmed = window.confirm("Deseja excluir essa meta?");

        if (!confirmed) return;

        try {
            const response = await fetch(`${getApiRoot()}/goals/${goalId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const raw = await response.text();

                console.error("Erro da API ao excluir meta:", {
                    status: response.status,
                    body: raw,
                });

                throw new Error("Erro ao excluir meta.");
            }

            const updatedGoals = goals.filter((goal) => goal.id !== goalId);
            setGoals(updatedGoals);
            updateUserGoalsCache(updatedGoals);

            showMessage("Meta excluída com sucesso.");
        } catch (error) {
            console.error(error);
            showMessage("Erro ao excluir meta.");
        }
    }

    async function handleToggleStatus(goalId: number) {
        try {
            const response = await fetch(
                `${getApiRoot()}/goals/${goalId}/toggle-status`,
                {
                    method: "PATCH",
                }
            );

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro da API ao alterar status:", {
                    status: response.status,
                    body: raw,
                });

                throw new Error(raw || "Erro ao alterar status.");
            }

            const updatedGoal = normalizeGoal(JSON.parse(raw));
            const updatedGoals = goals.map((goal) =>
                goal.id === goalId ? updatedGoal : goal
            );

            setGoals(updatedGoals);
            updateUserGoalsCache(updatedGoals);

            showMessage("Status da meta atualizado.");
        } catch (error) {
            console.error(error);
            showMessage("Erro ao atualizar status da meta.");
        }
    }

    async function handleMovement(goalId: number) {
        if (Number(movementAmount || 0) <= 0) {
            showMessage("Informe um valor válido.");
            return;
        }

        try {
            const response = await fetch(`${getApiRoot()}/goals/${goalId}/movement`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(movementAmount),
                    description: movementDescription.trim(),
                    type: movementType,
                }),
            });

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro da API ao movimentar meta:", {
                    status: response.status,
                    body: raw,
                });

                throw new Error(raw || "Erro ao movimentar meta.");
            }

            const updatedGoal = normalizeGoal(JSON.parse(raw));
            const updatedGoals = goals.map((goal) =>
                goal.id === goalId ? updatedGoal : goal
            );

            setGoals(updatedGoals);
            updateUserGoalsCache(updatedGoals);

            setMovementGoalId(null);
            setMovementAmount("");
            setMovementDescription("");
            setMovementType("add");

            showMessage(
                movementType === "add"
                    ? "Valor adicionado à meta."
                    : "Valor removido da meta."
            );
        } catch (error) {
            console.error(error);
            showMessage("Erro ao movimentar meta.");
        }
    }

    function showMessage(text: string) {
        setMessage(text);

        window.setTimeout(() => {
            setMessage("");
        }, 3500);
    }

    if (loading) {
        return (
            <main className="goals-page">
                <div className="goals-loading">Carregando metas...</div>
            </main>
        );
    }

    return (
        <main className="goals-page">
            <Container className="goals-container">
                <AccountHeader name={userName} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Metas" backLink="/homescreen" />

                    {message && <div className="goals-message">{message}</div>}

                    <section className="goals-hero">
                        <div>
                            <span className="goals-badge">
                                Planejamento financeiro
                            </span>
                            <h1>Organize seus objetivos com metas inteligentes</h1>
                            <p>
                                Crie metas, acompanhe progresso, registre depósitos e
                                receba previsões calculadas pelo back-end.
                            </p>
                        </div>

                        <div className="goals-hero-card">
                            <span>Progresso médio</span>
                            <strong>{summary.averageProgress.toFixed(0)}%</strong>
                            <small>
                                {summary.completed} concluída(s) de {summary.total} meta(s)
                            </small>
                        </div>
                    </section>

                    <section className="goals-summary-grid">
                        <div>
                            <span>Total planejado</span>
                            <strong>{formatMoney(summary.targetTotal)}</strong>
                        </div>

                        <div>
                            <span>Já guardado</span>
                            <strong>{formatMoney(summary.currentTotal)}</strong>
                        </div>

                        <div>
                            <span>Metas ativas</span>
                            <strong>{summary.active}</strong>
                        </div>

                        <div>
                            <span>Concluídas</span>
                            <strong>{summary.completed}</strong>
                        </div>
                    </section>

                    <EducationRecommendationCard
                        recommendation={educationRecommendation}
                    />

                    <section className="goals-form-card">
                        <div className="goals-section-header">
                            <span className="goals-badge secondary">
                                {editingId ? "Editando meta" : "Nova meta"}
                            </span>
                            <h2>{editingId ? "Editar meta" : "Criar nova meta"}</h2>
                            <p>
                                Escolha o ícone, a cor e os dados da meta. O progresso e
                                os insights serão calculados pela API.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="goals-form-preview">
                                <div
                                    className="goal-icon"
                                    style={{ backgroundColor: form.color }}
                                >
                                    <i className={`bi ${form.icon}`}></i>
                                </div>

                                <div>
                                    <span>Prévia da meta</span>
                                    <strong>{form.title || "Nova meta"}</strong>
                                    <small>
                                        {categoryLabels[form.category]} • Prioridade{" "}
                                        {priorityLabels[form.priority]}
                                    </small>
                                </div>
                            </div>

                            <div className="goals-form-grid">
                                <label>
                                    Nome da meta
                                    <input
                                        value={form.title}
                                        onChange={(event) =>
                                            updateForm("title", event.target.value)
                                        }
                                        placeholder="Ex: Reserva de emergência"
                                    />
                                </label>

                                <label>
                                    Valor alvo
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.targetAmount}
                                        onChange={(event) =>
                                            updateForm("targetAmount", event.target.value)
                                        }
                                        placeholder="Ex: 10000"
                                    />
                                </label>

                                <label>
                                    Valor atual
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.currentAmount}
                                        onChange={(event) =>
                                            updateForm("currentAmount", event.target.value)
                                        }
                                        placeholder="Ex: 1500"
                                    />
                                </label>

                                <label>
                                    Aporte mensal planejado
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.monthlyContribution}
                                        onChange={(event) =>
                                            updateForm(
                                                "monthlyContribution",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex: 500"
                                    />
                                </label>

                                <label>
                                    Prazo
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        disabled={form.deadline === "sem-prazo"}
                                        onChange={(event) =>
                                            updateForm("deadline", event.target.value)
                                        }
                                    />

                                    <div className="goal-no-deadline-check">
                                        <input
                                            type="checkbox"
                                            id="goal-no-deadline"
                                            checked={form.deadline === "sem-prazo"}
                                            onChange={(event) =>
                                                updateForm(
                                                    "deadline",
                                                    event.target.checked ? "sem-prazo" : ""
                                                )
                                            }
                                        />
                                        <label htmlFor="goal-no-deadline">
                                            Meta sem prazo definido
                                        </label>
                                    </div>
                                </label>

                                <label>
                                    Categoria
                                    <select
                                        value={form.category}
                                        onChange={(event) =>
                                            updateForm(
                                                "category",
                                                event.target.value as GoalCategory
                                            )
                                        }
                                    >
                                        {Object.entries(categoryLabels).map(
                                            ([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Prioridade
                                    <select
                                        value={form.priority}
                                        onChange={(event) =>
                                            updateForm(
                                                "priority",
                                                event.target.value as GoalPriority
                                            )
                                        }
                                    >
                                        {Object.entries(priorityLabels).map(
                                            ([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Ícone
                                    <select
                                        value={form.icon}
                                        onChange={(event) =>
                                            updateForm("icon", event.target.value)
                                        }
                                    >
                                        {iconOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="goals-icon-picker">
                                {iconOptions.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={form.icon === item.value ? "active" : ""}
                                        onClick={() => updateForm("icon", item.value)}
                                        title={item.label}
                                    >
                                        <i className={`bi ${item.value}`}></i>
                                    </button>
                                ))}
                            </div>

                            <div className="goals-color-list">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={form.color === color ? "active" : ""}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateForm("color", color)}
                                    />
                                ))}
                            </div>

                            <label className="goals-textarea-label">
                                Observações
                                <textarea
                                    value={form.notes}
                                    onChange={(event) =>
                                        updateForm("notes", event.target.value)
                                    }
                                    placeholder="Ex: guardar para emergências, viagem, entrada de um carro..."
                                />
                            </label>

                            <div className="goals-form-actions">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="goals-secondary-btn"
                                >
                                    Limpar
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="goals-main-btn"
                                >
                                    {saving
                                        ? "Salvando..."
                                        : editingId
                                          ? "Salvar alterações"
                                          : "Criar meta"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="goals-toolbar">
                        <div className="goals-search">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar meta por nome, categoria ou insight..."
                            />
                        </div>

                        <div className="goals-filter-buttons">
                            <button
                                type="button"
                                className={filter === "active" ? "active" : ""}
                                onClick={() => setFilter("active")}
                            >
                                Ativas
                            </button>

                            <button
                                type="button"
                                className={filter === "completed" ? "active" : ""}
                                onClick={() => setFilter("completed")}
                            >
                                Concluídas
                            </button>

                            <button
                                type="button"
                                className={filter === "all" ? "active" : ""}
                                onClick={() => setFilter("all")}
                            >
                                Todas
                            </button>
                        </div>
                    </section>

                    <section className="goals-list">
                        {filteredGoals.length === 0 ? (
                            <div className="goals-empty">
                                <i className="bi bi-bullseye"></i>
                                <h3>Nenhuma meta encontrada</h3>
                                <p>Crie uma nova meta ou ajuste os filtros de busca.</p>
                            </div>
                        ) : (
                            filteredGoals.map((goal) => (
                                <article className="goal-card" key={goal.id}>
                                    <div className="goal-card-header">
                                        <div className="goal-card-title">
                                            <div
                                                className="goal-icon"
                                                style={{ backgroundColor: goal.color }}
                                            >
                                                <i className={`bi ${goal.icon || "bi-bullseye"}`}></i>
                                            </div>

                                            <div>
                                                <span>
                                                    {categoryLabels[goal.category] ||
                                                        goal.category}{" "}
                                                    • Prioridade{" "}
                                                    {priorityLabels[goal.priority] ||
                                                        goal.priority}
                                                </span>
                                                <h3>{goal.title}</h3>
                                            </div>
                                        </div>

                                        <span className={`goal-status ${goal.status}`}>
                                            {goal.isCompleted ||
                                            goal.status === "completed"
                                                ? "Concluída"
                                                : goal.isExpired
                                                  ? "Prazo vencido"
                                                  : "Ativa"}
                                        </span>
                                    </div>

                                    <div className="goal-money-row">
                                        <div>
                                            <span>Guardado</span>
                                            <strong>{formatMoney(goal.currentAmount)}</strong>
                                        </div>

                                        <div>
                                            <span>Meta</span>
                                            <strong>{formatMoney(goal.targetAmount)}</strong>
                                        </div>

                                        <div>
                                            <span>Falta</span>
                                            <strong>{formatMoney(goal.missingAmount)}</strong>
                                        </div>

                                        <div>
                                            <span>Aporte necessário</span>
                                            <strong>{formatMoney(goal.monthlyNeeded)}</strong>
                                        </div>
                                    </div>

                                    <div className="goal-progress-area">
                                        <div className="goal-progress-header">
                                            <span>{goal.progressPercentage.toFixed(0)}%</span>
                                            <small>Prazo: {formatDate(goal.deadline)}</small>
                                        </div>

                                        <div className="goal-progress-track">
                                            <div
                                                style={{
                                                    width: `${Math.min(
                                                        goal.progressPercentage,
                                                        100
                                                    )}%`,
                                                    backgroundColor: goal.color,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={`goal-insight ${goal.insightTone}`}>
                                        <strong>{goal.insightTitle}</strong>
                                        <p>{goal.insightMessage}</p>
                                    </div>

                                    {goal.notes && (
                                        <p className="goal-notes">{goal.notes}</p>
                                    )}

                                    {movementGoalId === goal.id && (
                                        <div className="goal-movement-box">
                                            <div className="goal-movement-type">
                                                <button
                                                    type="button"
                                                    className={
                                                        movementType === "add" ? "active" : ""
                                                    }
                                                    onClick={() => setMovementType("add")}
                                                >
                                                    Adicionar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        movementType === "remove"
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() => setMovementType("remove")}
                                                >
                                                    Remover
                                                </button>
                                            </div>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={movementAmount}
                                                onChange={(event) =>
                                                    setMovementAmount(event.target.value)
                                                }
                                                placeholder="Valor"
                                            />

                                            <input
                                                value={movementDescription}
                                                onChange={(event) =>
                                                    setMovementDescription(event.target.value)
                                                }
                                                placeholder="Descrição da movimentação"
                                            />

                                            <div className="goal-movement-actions">
                                                <button
                                                    type="button"
                                                    className="goals-secondary-btn"
                                                    onClick={() => setMovementGoalId(null)}
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="goals-main-btn"
                                                    onClick={() => handleMovement(goal.id)}
                                                >
                                                    Confirmar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {goal.deposits.length > 0 && (
                                        <div className="goal-deposits-list">
                                            <span>Últimas movimentações</span>

                                            {goal.deposits.slice(0, 3).map((deposit) => (
                                                <div key={deposit.id}>
                                                    <small>
                                                        {deposit.type === "add" ? "+" : "-"}{" "}
                                                        {formatMoney(deposit.amount)}
                                                    </small>
                                                    <p>
                                                        {deposit.description ||
                                                            "Movimentação registrada"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="goal-card-actions">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMovementGoalId(goal.id);
                                                setMovementType("add");
                                            }}
                                        >
                                            Movimentar
                                        </button>

                                        <button type="button" onClick={() => startEdit(goal)}>
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(goal.id)}
                                        >
                                            {goal.status === "completed"
                                                ? "Reabrir"
                                                : "Concluir"}
                                        </button>

                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                </motion.div>
            </Container>
        </main>
    );
}