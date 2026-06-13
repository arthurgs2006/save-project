import { useEffect, useMemo, useState } from "react";
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

import "./DepositPage.scss";

interface DepositStatement {
    id: number | string;
    transactionId: string;
    tipo: "credito" | "debito" | string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
    dataHora: string;
    createdAt: string;
    status: string;
    metodo: string;
    origem: string;
    category?: string;
    goalId?: number | null;
    goalName?: string | null;
}

interface GoalDeposit {
    id: number;
    amount: number;
    description: string;
    date: string;
    type: "add" | "remove";
}

interface Goal {
    id: number;
    userId?: string;
    name?: string;
    title?: string;
    targetAmount?: number;
    currentAmount?: number;
    monthlyContribution?: number;
    deadline?: string | null;
    category?: string;
    priority?: string;
    icon?: string;
    color?: string;
    notes?: string;
    deposits?: GoalDeposit[];
    status?: "active" | "completed";
    progressPercentage?: number;
    missingAmount?: number;
    monthlyNeeded?: number;
    insightTitle?: string;
    insightMessage?: string;
    insightTone?: string;
    isCompleted?: boolean;
    isExpired?: boolean;
    updatedAt?: string;
}

interface RecurringItem {
    id: number | string;
    value: number;
    type?: "credit" | "debit";
    tipo?: "credito" | "debito";
    billingDate?: string | number;
    billingDay?: string | number;
    frequency: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    monthlyEquivalent?: number;
    createdAt?: string;
}

interface User {
    id: number | string;
    nome?: string;
    name?: string;
    saldo_final: number;
    extratos: DepositStatement[];
    goals?: Goal[];
    recurringDebts?: RecurringItem[];
    recurringCredits?: RecurringItem[];
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

function getRecurringBalanceAdjustment(user: User | null) {
    if (!user) return 0;
    const today = new Date();
    const monthKey = getMonthKeyFromDate(today);

    const totalCredits = (user.recurringCredits || [])
        .filter((i) => hasRecurringOccurredThisMonth(i, monthKey, today))
        .reduce((s, i) => s + getRecurringMonthlyEquivalent(i), 0);

    const totalDebts = (user.recurringDebts || [])
        .filter((i) => hasRecurringOccurredThisMonth(i, monthKey, today))
        .reduce((s, i) => s + getRecurringMonthlyEquivalent(i), 0);

    return totalCredits - totalDebts;
}

interface BalanceOperationResponse {
    userId: string;
    previousBalance: number;
    newBalance: number;
    statement: DepositStatement;
    message: string;
}

function getApiRoot() {
    return BENEFITS_API_URL;
}

function normalizeGoal(item: any): Goal {
    return {
        id: Number(item.id ?? item.Id ?? Date.now()),
        userId: String(item.userId ?? item.UserId ?? ""),
        title: item.title ?? item.Title ?? item.name ?? item.Name ?? "",
        name: item.name ?? item.Name ?? item.title ?? item.Title ?? "",
        targetAmount: Number(item.targetAmount ?? item.TargetAmount ?? 0),
        currentAmount: Number(item.currentAmount ?? item.CurrentAmount ?? 0),
        monthlyContribution: Number(
            item.monthlyContribution ?? item.MonthlyContribution ?? 0
        ),
        deadline: item.deadline ?? item.Deadline ?? null,
        category: item.category ?? item.Category ?? "outros",
        priority: item.priority ?? item.Priority ?? "media",
        icon: item.icon ?? item.Icon ?? "bi-bullseye",
        color: item.color ?? item.Color ?? "#38bdf8",
        notes: item.notes ?? item.Notes ?? "",
        status: item.status ?? item.Status ?? "active",
        progressPercentage: Number(
            item.progressPercentage ?? item.ProgressPercentage ?? 0
        ),
        missingAmount: Number(item.missingAmount ?? item.MissingAmount ?? 0),
        monthlyNeeded: Number(item.monthlyNeeded ?? item.MonthlyNeeded ?? 0),
        insightTitle: item.insightTitle ?? item.InsightTitle ?? "",
        insightMessage: item.insightMessage ?? item.InsightMessage ?? "",
        insightTone: item.insightTone ?? item.InsightTone ?? "info",
        isCompleted: Boolean(item.isCompleted ?? item.IsCompleted ?? false),
        isExpired: Boolean(item.isExpired ?? item.IsExpired ?? false),
        deposits: Array.isArray(item.deposits ?? item.Deposits)
            ? (item.deposits ?? item.Deposits).map((deposit: any) => ({
                  id: Number(deposit.id ?? deposit.Id ?? Date.now()),
                  amount: Number(deposit.amount ?? deposit.Amount ?? 0),
                  description: deposit.description ?? deposit.Description ?? "",
                  date: deposit.date ?? deposit.Date ?? new Date().toISOString(),
                  type: deposit.type ?? deposit.Type ?? "add",
              }))
            : [],
        updatedAt: item.updatedAt ?? item.UpdatedAt ?? new Date().toISOString(),
    };
}

function normalizeStatement(item: any): DepositStatement {
    return {
        id: item.id ?? item.Id ?? Date.now(),
        transactionId: item.transactionId ?? item.TransactionId ?? "",
        tipo: item.tipo ?? item.Tipo ?? "credito",
        descricao: item.descricao ?? item.Descricao ?? "",
        valor: Number(item.valor ?? item.Valor ?? 0),
        data: item.data ?? item.Data ?? "",
        hora: item.hora ?? item.Hora ?? "",
        dataHora: item.dataHora ?? item.DataHora ?? "",
        createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
        status: item.status ?? item.Status ?? "concluido",
        metodo: item.metodo ?? item.Metodo ?? "saldo_manual",
        origem: item.origem ?? item.Origem ?? "deposito",
        category: item.category ?? item.Category ?? "",
        goalId: item.goalId ?? item.GoalId ?? null,
        goalName: item.goalName ?? item.GoalName ?? null,
    };
}

function mergeStatements(
    localStatements: DepositStatement[] = [],
    apiStatements: DepositStatement[] = []
) {
    const map = new Map<string, DepositStatement>();

    [...localStatements, ...apiStatements].forEach((item) => {
        const key = String(item.transactionId || item.id);
        map.set(key, item);
    });

    return Array.from(map.values());
}

function hasEmergencyReserveGoal(goals: Goal[] = []) {
    return goals.some((goal) => {
        const text = [
            goal.title,
            goal.name,
            goal.category,
            goal.notes,
            goal.insightTitle,
            goal.insightMessage,
        ]
            .join(" ")
            .toLowerCase();

        return (
            text.includes("reserva") ||
            text.includes("emergência") ||
            text.includes("emergencia")
        );
    });
}

export default function DepositPage() {
    const [user, setUser] = useState<User | null>(null);
    const [depositValue, setDepositValue] = useState("");
    const [selectedGoal, setSelectedGoal] = useState("none");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Conta");
    const [loading, setLoading] = useState(false);

    const [educationRecommendation, setEducationRecommendation] =
        useState<EducationRecommendation | null>(null);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) return;

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
                const response = await fetch(`${BASE_URL}/api/auth/users/${parsedUser.id}`);

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
                        recurringDebts:   parsedUser.recurringDebts   || serverUser.recurringDebts   || [],
                        recurringCredits: parsedUser.recurringCredits || serverUser.recurringCredits || [],
                    };
                }
            } catch {
                console.warn(
                    "Erro ao carregar usuário no servidor principal. Usando dados locais."
                );
            }

            try {
                const goalsResponse = await fetch(
                    `${getApiRoot()}/goals/user/${parsedUser.id}?status=all`
                );

                const rawGoals = await goalsResponse.text();

                if (goalsResponse.ok) {
                    const goalsData = JSON.parse(rawGoals);

                    baseUser = {
                        ...baseUser,
                        goals: Array.isArray(goalsData)
                            ? goalsData.map(normalizeGoal)
                            : [],
                    };
                } else {
                    console.warn("Não foi possível carregar metas da API .NET:", rawGoals);
                }
            } catch (error) {
                console.warn("Erro ao buscar metas da API .NET.", error);
            }

            try {
                const statementsResponse = await fetch(
                    `${getApiRoot()}/balance/user/${parsedUser.id}/statements`
                );

                const rawStatements = await statementsResponse.text();

                if (statementsResponse.ok) {
                    const statementsData = JSON.parse(rawStatements);

                    const apiStatements = Array.isArray(statementsData)
                        ? statementsData.map(normalizeStatement)
                        : [];

                    baseUser = {
                        ...baseUser,
                        extratos: mergeStatements(
                            baseUser.extratos || [],
                            apiStatements
                        ),
                    };
                } else {
                    console.warn("Não foi possível carregar extratos da API .NET:", {
                        status: statementsResponse.status,
                        body: rawStatements,
                    });
                }
            } catch (error) {
                console.warn("Erro ao buscar extratos da API .NET.", error);
            }

            setUser(baseUser);
            localStorage.setItem("loggedUser", JSON.stringify(baseUser));
        }

        loadUser();
    }, []);

    const numericDeposit = useMemo(() => {
        return Number(depositValue.replace(",", ".")) || 0;
    }, [depositValue]);

    const selectedGoalData = useMemo(() => {
        if (!user || selectedGoal === "none") return null;

        return user.goals?.find((goal) => goal.id === Number(selectedGoal)) || null;
    }, [selectedGoal, user]);

    const recentStatements = useMemo(() => {
        if (!user?.extratos?.length) return [];

        return [...user.extratos]
            .reverse()
            .filter(
                (transaction) =>
                    transaction.origem === "deposito" || transaction.tipo === "credito"
            )
            .slice(0, 5);
    }, [user]);

    const preview = useMemo(() => {
        const currentBalance = Number(user?.saldo_final || 0) + getRecurringBalanceAdjustment(user);
        const nextBalance = currentBalance + numericDeposit;

        const goalCurrent = Number(selectedGoalData?.currentAmount || 0);
        const goalTarget = Number(selectedGoalData?.targetAmount || 0);
        const goalNextAmount = goalCurrent + numericDeposit;
        const goalProgress =
            goalTarget > 0 ? Math.min((goalNextAmount / goalTarget) * 100, 100) : 0;

        let insight = "Informe um valor para visualizar o impacto do depósito.";

        if (numericDeposit > 0 && selectedGoalData) {
            insight = `Esse depósito será somado ao seu saldo e também direcionado para a meta "${getGoalName(selectedGoalData)}".`;
        } else if (numericDeposit > 0) {
            insight =
                "Esse depósito será adicionado ao seu saldo geral e registrado no histórico.";
        }

        return {
            currentBalance,
            nextBalance,
            goalCurrent,
            goalTarget,
            goalNextAmount,
            goalProgress,
            insight,
        };
    }, [numericDeposit, selectedGoalData, user]);

    useEffect(() => {
        async function loadEducationRecommendation() {
            if (!user?.id) return;

            const goals = user.goals || [];

            const recommendation = await getEducationRecommendation(user.id, "deposit", {
                amount: numericDeposit,
                currentBalance: Number(user.saldo_final || 0),
                hasGoals: goals.length > 0,
                hasEmergencyReserve: hasEmergencyReserveGoal(goals),
            });

            setEducationRecommendation(recommendation);
        }

        loadEducationRecommendation();
    }, [user?.id, user?.saldo_final, user?.goals, numericDeposit]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getGoalName(goal: Goal) {
        return goal.title || goal.name || "Meta sem nome";
    }

    function resetForm() {
        setDepositValue("");
        setSelectedGoal("none");
        setDescription("");
        setCategory("Conta");
    }

    async function reloadGoals(userId: string | number) {
        try {
            const response = await fetch(`${getApiRoot()}/goals/user/${userId}?status=all`);
            const raw = await response.text();

            if (!response.ok) {
                console.warn("Erro ao recarregar metas:", raw);
                return null;
            }

            const data = JSON.parse(raw);

            return Array.isArray(data) ? data.map(normalizeGoal) : [];
        } catch (error) {
            console.warn("Erro ao recarregar metas.", error);
            return null;
        }
    }

    async function handleDeposit() {
        if (!user) {
            setAlert({
                isOpen: true,
                message: "Usuário não encontrado. Faça login novamente.",
                type: "danger",
            });
            return;
        }

        if (!String(user.id || "").trim()) {
            setAlert({
                isOpen: true,
                message: "ID do usuário inválido. Faça login novamente.",
                type: "danger",
            });
            return;
        }

        if (numericDeposit <= 0) {
            setAlert({
                isOpen: true,
                message: "Digite um valor válido para o depósito.",
                type: "warning",
            });
            return;
        }

        const payload = {
            userId: String(user.id),
            amount: numericDeposit,
            currentBalance: Number(user.saldo_final || 0),
            category,
            description: description.trim(),
            goalId: selectedGoalData ? Number(selectedGoalData.id) : null,
        };

        try {
            setLoading(true);

            const url = `${getApiRoot()}/balance/deposit`;

            console.log("URL DEPÓSITO:", url);
            console.log("PAYLOAD DEPÓSITO:", payload);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await response.text();

            if (!response.ok) {
                console.error("Erro da API ao realizar depósito:", {
                    url,
                    status: response.status,
                    body: raw,
                    payload,
                });

                throw new Error(raw || "Erro ao realizar depósito.");
            }

            const result: BalanceOperationResponse = JSON.parse(raw);
            const statement = normalizeStatement(result.statement);

            const reloadedGoals = await reloadGoals(user.id);

            const updatedUser: User = {
                ...user,
                saldo_final: Number(result.newBalance),
                extratos: mergeStatements([...(user.extratos || []), statement], []),
                goals: reloadedGoals || user.goals || [],
            };

            setUser(updatedUser);
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

            resetForm();

            setAlert({
                isOpen: true,
                message: result.message || "Depósito realizado com sucesso.",
                type: "success",
            });
        } catch (error) {
            console.error(error);

            setAlert({
                isOpen: true,
                message:
                    "Erro ao realizar depósito. Confira se a API .NET está rodando e se a rota /api/balance/deposit foi registrada.",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="deposit-page">
            <Container className="deposit-container">
                <AccountHeader name={user?.nome || user?.name} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Depositar" />

                    {!user ? (
                        <div className="deposit-empty">Carregando informações...</div>
                    ) : (
                        <>
                            <section className="deposit-hero">
                                <div>
                                    <span className="deposit-badge">Novo depósito</span>
                                    <h1>{formatCurrency(preview.currentBalance)}</h1>
                                    <p>Saldo atual disponível na sua conta SaveApp.</p>
                                </div>

                                <div className="deposit-hero-grid">
                                    <div>
                                        <span>Valor do depósito</span>
                                        <strong className="positive">
                                            {formatCurrency(numericDeposit)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Saldo após depósito</span>
                                        <strong>{formatCurrency(preview.nextBalance)}</strong>
                                    </div>

                                    <div>
                                        <span>Destino</span>
                                        <strong>
                                            {selectedGoalData
                                                ? getGoalName(selectedGoalData)
                                                : "Saldo geral"}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            <section className="deposit-layout">
                                <div className="deposit-form-card">
                                    <div className="deposit-form-header">
                                        <span className="deposit-badge secondary">
                                            Registro manual
                                        </span>
                                        <h2>Informações do depósito</h2>
                                        <p>
                                            Registre entradas no saldo e, se quiser,
                                            direcione o valor para uma meta financeira.
                                        </p>
                                    </div>

                                    <div className="deposit-form-grid">
                                        <label>
                                            Valor do depósito
                                            <div className="deposit-money-input">
                                                <span>R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={depositValue}
                                                    onChange={(event) =>
                                                        setDepositValue(event.target.value)
                                                    }
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </label>

                                        <label>
                                            Categoria
                                            <select
                                                value={category}
                                                onChange={(event) =>
                                                    setCategory(event.target.value)
                                                }
                                            >
                                                <option value="Conta">Conta</option>
                                                <option value="Salário">Salário</option>
                                                <option value="Renda extra">Renda extra</option>
                                                <option value="Reembolso">Reembolso</option>
                                                <option value="Meta">Meta</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                        </label>

                                        <label>
                                            Direcionar para
                                            <select
                                                value={selectedGoal}
                                                onChange={(event) =>
                                                    setSelectedGoal(event.target.value)
                                                }
                                            >
                                                <option value="none">Saldo geral</option>
                                                {user.goals?.map((goal) => (
                                                    <option key={goal.id} value={goal.id}>
                                                        {getGoalName(goal)}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <label className="deposit-description-label">
                                        Descrição
                                        <textarea
                                            value={description}
                                            onChange={(event) =>
                                                setDescription(event.target.value)
                                            }
                                            placeholder="Ex: depósito do salário, dinheiro guardado, aporte para meta..."
                                        />
                                    </label>

                                    <div className="deposit-insight">
                                        <strong>Insight</strong>
                                        <p>{preview.insight}</p>
                                    </div>

                                    <div className="deposit-actions">
                                        <button
                                            type="button"
                                            className="deposit-secondary-btn"
                                            onClick={resetForm}
                                            disabled={loading}
                                        >
                                            Limpar
                                        </button>

                                        <button
                                            type="button"
                                            className="deposit-main-btn"
                                            onClick={handleDeposit}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Processando..."
                                                : "Confirmar depósito"}
                                        </button>
                                    </div>
                                </div>

                                <aside className="deposit-preview-card">
                                    <span className="deposit-badge">Prévia</span>

                                    <div className="deposit-preview-icon">
                                        <i className="bi bi-arrow-down-left"></i>
                                    </div>

                                    <h2>{formatCurrency(numericDeposit)}</h2>

                                    <p>
                                        {selectedGoalData
                                            ? `Será direcionado para ${getGoalName(selectedGoalData)}.`
                                            : "Será adicionado ao saldo geral."}
                                    </p>

                                    {selectedGoalData && (
                                        <div className="deposit-goal-preview">
                                            <div className="deposit-goal-header">
                                                <span>Progresso da meta</span>
                                                <strong>
                                                    {preview.goalProgress.toFixed(0)}%
                                                </strong>
                                            </div>

                                            <div className="deposit-progress-track">
                                                <div
                                                    style={{
                                                        width: `${preview.goalProgress}%`,
                                                    }}
                                                />
                                            </div>

                                            <small>
                                                {formatCurrency(preview.goalNextAmount)} de{" "}
                                                {formatCurrency(preview.goalTarget)}
                                            </small>
                                        </div>
                                    )}
                                </aside>
                            </section>

                            <EducationRecommendationCard
                                recommendation={educationRecommendation}
                            />

                            {recentStatements.length > 0 && (
                                <section className="deposit-history">
                                    <div className="deposit-history-header">
                                        <div>
                                            <span className="deposit-badge">Histórico</span>
                                            <h2>Depósitos recentes</h2>
                                        </div>
                                    </div>

                                    <div className="deposit-history-list">
                                        {recentStatements.map((transaction) => (
                                            <article
                                                className="deposit-history-item"
                                                key={transaction.id}
                                            >
                                                <div className="deposit-history-left">
                                                    <div className="deposit-history-icon">
                                                        <i className="bi bi-arrow-down-left"></i>
                                                    </div>

                                                    <div>
                                                        <h3>{transaction.descricao}</h3>
                                                        <p>{transaction.dataHora}</p>
                                                        {transaction.transactionId && (
                                                            <small>
                                                                ID: {transaction.transactionId}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="deposit-history-value">
                                                    <strong>
                                                        +{" "}
                                                        {formatCurrency(
                                                            Number(transaction.valor)
                                                        )}
                                                    </strong>
                                                    <span>{transaction.status}</span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
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