import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import { BASE_URL, BENEFITS_API_URL } from "../../config";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import SaveScoreCard from "../../components/financial_health/SaveScoreCard";

import {
    analyzeFinancialHealth,
    type FinancialScoreResponse,
} from "../../services/financialHealthApi";

import "./FinancialHealth.scss";

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
}

interface RecurringItem {
    id: number | string;
    name: string;
    value: number;
    type?: "credit" | "debit";
    tipo?: "credito" | "debito";
    frequency: string;
    monthlyEquivalent?: number;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
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
    nome?: string;
    name?: string;
    saldo_final: number;
    receita?: number;
    extratos?: Extrato[];
    recurringDebts?: RecurringItem[];
    recurringCredits?: RecurringItem[];
    goals?: Goal[];
}

function getApiRoot() {
    return BENEFITS_API_URL;
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function getMonthKeyFromDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

function getDateFromValue(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

function getMonthStart(monthKey: string) {
    const [year, month] = monthKey.split("-");
    return new Date(Number(year), Number(month) - 1, 1);
}

function getMonthEnd(monthKey: string) {
    const [year, month] = monthKey.split("-");
    return new Date(Number(year), Number(month), 0);
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
        return Number(item.monthlyEquivalent);
    }

    const value = Number(item.value || 0);

    if (item.frequency === "daily") return value * 30;
    if (item.frequency === "weekly") return value * 4.33;
    if (item.frequency === "yearly") return value / 12;

    return value;
}

function normalizeRecurringItem(item: any): RecurringItem {
    const rawType = String(item.type ?? item.Type ?? "").toLowerCase();

    return {
        id: item.id ?? item.Id ?? Date.now(),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type: rawType === "credit" ? "credit" : "debit",
        frequency: item.frequency ?? item.Frequency ?? "monthly",
        monthlyEquivalent: Number(item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0),
        startDate: item.startDate ?? item.StartDate ?? null,
        endDate: item.endDate ?? item.EndDate ?? null,
        isActive: item.isActive ?? item.IsActive ?? true,
        createdAt: item.createdAt ?? item.CreatedAt ?? "",
    };
}

function normalizeStatement(item: any): Extrato {
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
    };
}

function normalizeGoal(item: any): Goal {
    return {
        id: item.id ?? item.Id ?? Date.now(),
        title: item.title ?? item.Title ?? item.name ?? item.Name ?? "",
        name: item.name ?? item.Name ?? item.title ?? item.Title ?? "",
        targetAmount: Number(item.targetAmount ?? item.TargetAmount ?? 0),
        currentAmount: Number(item.currentAmount ?? item.CurrentAmount ?? 0),
        status: item.status ?? item.Status ?? "active",
    };
}

export default function FinancialHealth() {
    const [user, setUser] = useState<User | null>(null);
    const [score, setScore] = useState<FinancialScoreResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const currentMonthKey = getMonthKeyFromDate(new Date());

    useEffect(() => {
        async function loadData() {
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
                const response = await fetch(`${BASE_URL}/api/auth/users/${parsedUser.id}`);

                if (response.ok) {
                    const serverUser = await response.json();

                    baseUser = {
                        ...serverUser,
                        saldo_final: Number(
                            parsedUser.saldo_final ?? serverUser.saldo_final ?? 0
                        ),
                        extratos: parsedUser.extratos || serverUser.extratos || [],
                        goals: parsedUser.goals || serverUser.goals || [],
                        recurringDebts:
                            parsedUser.recurringDebts || serverUser.recurringDebts || [],
                        recurringCredits:
                            parsedUser.recurringCredits || serverUser.recurringCredits || [],
                    };
                }
            } catch {
                console.warn("Servidor principal indisponível. Usando cache local.");
            }

            try {
                const statementsResponse = await fetch(
                    `${getApiRoot()}/balance/user/${parsedUser.id}/statements`
                );

                const rawStatements = await statementsResponse.text();

                if (statementsResponse.ok) {
                    const statementsData = JSON.parse(rawStatements);

                    baseUser = {
                        ...baseUser,
                        extratos: Array.isArray(statementsData)
                            ? statementsData.map(normalizeStatement)
                            : baseUser.extratos || [],
                    };
                }
            } catch (error) {
                console.warn("Erro ao buscar extratos da API .NET.", error);
            }

            try {
                const recurringResponse = await fetch(
                    `${getApiRoot()}/recurring-transactions/user/${parsedUser.id}`
                );

                const rawRecurring = await recurringResponse.text();

                if (recurringResponse.ok) {
                    const recurringData = JSON.parse(rawRecurring);

                    const normalized = Array.isArray(recurringData)
                        ? recurringData.map(normalizeRecurringItem)
                        : [];

                    baseUser = {
                        ...baseUser,
                        recurringDebts: normalized.filter((item) => item.type === "debit"),
                        recurringCredits: normalized.filter((item) => item.type === "credit"),
                    };
                }
            } catch (error) {
                console.warn("Erro ao buscar recorrentes da API .NET.", error);
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
                            : baseUser.goals || [],
                    };
                }
            } catch (error) {
                console.warn("Erro ao buscar metas da API .NET.", error);
            }

            setUser(baseUser);
            localStorage.setItem("loggedUser", JSON.stringify(baseUser));

            setLoading(false);
        }

        loadData();
    }, [navigate]);

    const analysisPayload = useMemo(() => {
        if (!user) return null;

        const goals = user.goals || [];
        const extratos = user.extratos || [];
        const recurringCredits = user.recurringCredits || [];
        const recurringDebts = user.recurringDebts || [];

        const currentItems = extratos.filter((item) => {
            return getMonthKey(item.data || item.createdAt) === currentMonthKey;
        });

        const monthlyCredits = currentItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const monthlyDebits = currentItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const monthlyRecurringCredits = recurringCredits
            .filter((item) => isRecurringValidForMonth(item, currentMonthKey))
            .reduce((sum, item) => sum + getRecurringMonthlyEquivalent(item), 0);

        const monthlyRecurringDebits = recurringDebts
            .filter((item) => isRecurringValidForMonth(item, currentMonthKey))
            .reduce((sum, item) => sum + getRecurringMonthlyEquivalent(item), 0);

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

        return {
            userId: user.id,

            balance: Number(user.saldo_final || 0),
            monthlyIncome: monthlyRecurringCredits || monthlyCredits,

            monthlyRecurringCredits,
            monthlyRecurringDebits,

            monthlyCredits,
            monthlyDebits,

            transactionsCount: extratos.length,

            goalsCount: goals.length,
            activeGoalsCount: goals.filter((goal) => goal.status !== "completed").length,
            completedGoalsCount: goals.filter((goal) => goal.status === "completed").length,

            goalsTargetTotal,
            goalsCurrentTotal,

            hasEmergencyReserve,

            lessonsOpened: Number(localStorage.getItem("lessonsOpened") || 0),
            lessonsCompleted: Number(localStorage.getItem("lessonsCompleted") || 0),
        };
    }, [user, currentMonthKey]);

    useEffect(() => {
        async function loadScore() {
            if (!analysisPayload) return;

            const response = await analyzeFinancialHealth(analysisPayload);
            setScore(response);
        }

        loadScore();
    }, [analysisPayload]);

    const metrics = useMemo(() => {
        if (!analysisPayload) {
            return {
                recurringResult: 0,
                monthlyResult: 0,
                goalsProgress: 0,
            };
        }

        const recurringResult =
            analysisPayload.monthlyRecurringCredits -
            analysisPayload.monthlyRecurringDebits;

        const monthlyResult =
            analysisPayload.monthlyCredits - analysisPayload.monthlyDebits;

        const goalsProgress =
            analysisPayload.goalsTargetTotal > 0
                ? Math.min(
                      (analysisPayload.goalsCurrentTotal /
                          analysisPayload.goalsTargetTotal) *
                          100,
                      100
                  )
                : 0;

        return {
            recurringResult,
            monthlyResult,
            goalsProgress,
        };
    }, [analysisPayload]);

    function handleActionClick(route: string, lessonSlug?: string) {
        if (route) {
            navigate(route);
            return;
        }

        if (lessonSlug) {
            navigate(`/financial-education/${lessonSlug}`);
            return;
        }

        navigate("/financial-education");
    }

    if (loading) {
        return (
            <main className="financial-health-page">
                <div className="financial-health-loading">
                    Carregando diagnóstico...
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="financial-health-page">
                <div className="financial-health-loading">
                    Usuário não encontrado.
                </div>
            </main>
        );
    }

    return (
        <main className="financial-health-page">
            <Container className="financial-health-container">
                <AccountHeader name={user.nome || user.name} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader
                        title="Diagnóstico Financeiro"
                        backLink="/homescreen"
                    />

                    <section className="financial-health-hero">
                        <div>
                            <span className="financial-health-badge">
                                SaveScore
                            </span>

                            <h1>Seu dinheiro conectado em uma visão geral</h1>

                            <p>
                                O diagnóstico cruza saldo, recorrentes, metas,
                                movimentações e educação financeira para mostrar onde
                                você está forte e o que pode melhorar.
                            </p>
                        </div>

                        <div className="financial-health-hero-card">
                            <span>Resumo do mês</span>
                            <strong>
                                {formatCurrency(metrics.monthlyResult)}
                            </strong>
                            <small>
                                Resultado entre entradas e saídas registradas neste mês.
                            </small>
                        </div>
                    </section>

                    <SaveScoreCard score={score} />

                    <section className="financial-health-metrics">
                        <div>
                            <span>Saldo atual</span>
                            <strong>{formatCurrency(Number(user.saldo_final || 0))}</strong>
                        </div>

                        <div>
                            <span>Resultado recorrente</span>
                            <strong
                                className={
                                    metrics.recurringResult >= 0 ? "positive" : "negative"
                                }
                            >
                                {formatCurrency(metrics.recurringResult)}
                            </strong>
                        </div>

                        <div>
                            <span>Progresso em metas</span>
                            <strong>{metrics.goalsProgress.toFixed(0)}%</strong>
                        </div>

                        <div>
                            <span>Movimentações</span>
                            <strong>{analysisPayload?.transactionsCount || 0}</strong>
                        </div>
                    </section>

                    {score && (
                        <>
                            <section className="financial-health-section">
                                <div className="financial-health-section-header">
                                    <div>
                                        <span className="financial-health-badge secondary">
                                            Pilares
                                        </span>
                                        <h2>O que compõe seu SaveScore</h2>
                                    </div>
                                </div>

                                <div className="financial-health-pillars-grid">
                                    {score.pillars.map((pillar) => (
                                        <article
                                            className="financial-health-pillar-card"
                                            key={pillar.name}
                                        >
                                            <div
                                                className="financial-health-pillar-icon"
                                                style={{ backgroundColor: pillar.color }}
                                            >
                                                <i className={`bi ${pillar.icon}`}></i>
                                            </div>

                                            <div className="financial-health-pillar-copy">
                                                <div>
                                                    <span>{pillar.status}</span>
                                                    <strong>{pillar.name}</strong>
                                                </div>

                                                <b>{pillar.score}/100</b>
                                            </div>

                                            <div className="financial-health-pillar-track">
                                                <div
                                                    style={{
                                                        width: `${pillar.score}%`,
                                                        backgroundColor: pillar.color,
                                                    }}
                                                />
                                            </div>

                                            <p>{pillar.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className="financial-health-grid-section">
                                <div className="financial-health-section">
                                    <div className="financial-health-section-header">
                                        <div>
                                            <span className="financial-health-badge success">
                                                Pontos fortes
                                            </span>
                                            <h2>O que está funcionando</h2>
                                        </div>
                                    </div>

                                    <div className="financial-health-insight-list">
                                        {score.strengths.map((item) => (
                                            <article
                                                className={`financial-health-insight ${item.type}`}
                                                key={item.title}
                                            >
                                                <i className={`bi ${item.icon}`}></i>

                                                <div>
                                                    <strong>{item.title}</strong>
                                                    <p>{item.message}</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                <div className="financial-health-section">
                                    <div className="financial-health-section-header">
                                        <div>
                                            <span className="financial-health-badge warning">
                                                Atenção
                                            </span>
                                            <h2>O que pode melhorar</h2>
                                        </div>
                                    </div>

                                    <div className="financial-health-insight-list">
                                        {score.warnings.length > 0 ? (
                                            score.warnings.map((item) => (
                                                <article
                                                    className={`financial-health-insight ${item.type}`}
                                                    key={item.title}
                                                >
                                                    <i className={`bi ${item.icon}`}></i>

                                                    <div>
                                                        <strong>{item.title}</strong>
                                                        <p>{item.message}</p>
                                                    </div>
                                                </article>
                                            ))
                                        ) : (
                                            <article className="financial-health-insight success">
                                                <i className="bi bi-check-circle"></i>
                                                <div>
                                                    <strong>Nenhum alerta crítico</strong>
                                                    <p>
                                                        Seu diagnóstico não encontrou pontos
                                                        urgentes agora. Continue acompanhando
                                                        seus dados.
                                                    </p>
                                                </div>
                                            </article>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="financial-health-section">
                                <div className="financial-health-section-header">
                                    <div>
                                        <span className="financial-health-badge secondary">
                                            Próximas ações
                                        </span>
                                        <h2>Como melhorar seu diagnóstico</h2>
                                    </div>
                                </div>

                                <div className="financial-health-actions-grid">
                                    {score.recommendedActions.map((action) => (
                                        <article
                                            className={`financial-health-action-card ${action.priority}`}
                                            key={action.title}
                                        >
                                            <div className="financial-health-action-icon">
                                                <i className={`bi ${action.icon}`}></i>
                                            </div>

                                            <div>
                                                <span>{action.priority}</span>
                                                <h3>{action.title}</h3>
                                                <p>{action.description}</p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleActionClick(
                                                        action.route,
                                                        action.lessonSlug
                                                    )
                                                }
                                            >
                                                {action.actionLabel || "Abrir"}
                                                <i className="bi bi-arrow-right"></i>
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className="financial-health-lesson-card">
                                <div>
                                    <span className="financial-health-badge">
                                        Aula recomendada
                                    </span>
                                    <h2>{score.mainLessonTitle}</h2>
                                    <p>
                                        Essa aula foi escolhida com base no principal ponto
                                        de evolução do seu diagnóstico.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/financial-education/${score.mainLessonSlug}`
                                        )
                                    }
                                >
                                    Abrir aula
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </section>
                        </>
                    )}
                </motion.div>
            </Container>
        </main>
    );
}