import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./DepositPage.scss";

interface DepositStatement {
    id: number;
    transactionId: string;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
    dataHora: string;
    createdAt: string;
    status: "concluido";
    metodo: "saldo_manual";
    origem: "deposito";
    goalId?: number | null;
    goalName?: string | null;
}

interface GoalDeposit {
    id: number;
    transactionId: string;
    value?: number;
    amount?: number;
    time?: string;
    date: string;
    hour: string;
    dateTimeLabel: string;
    status: "concluido";
    method: "saldo_manual";
    type?: "add";
    description?: string;
}

interface Goal {
    id: number;
    name?: string;
    title?: string;
    targetAmount?: number;
    currentAmount?: number;
    deposits?: GoalDeposit[];
    status?: "active" | "completed";
    updatedAt?: string;
}

interface User {
    id: number;
    nome?: string;
    name?: string;
    saldo_final: number;
    extratos: DepositStatement[];
    goals?: Goal[];
}

interface DepositMetadata {
    id: number;
    transactionId: string;
    createdAt: string;
    date: string;
    hour: string;
    dateTimeLabel: string;
}

export default function DepositPage() {
    const [user, setUser] = useState<User | null>(null);
    const [depositValue, setDepositValue] = useState("");
    const [selectedGoal, setSelectedGoal] = useState("none");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) return;

            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            try {
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (!response.ok) {
                    throw new Error("Erro ao carregar usuário");
                }

                const data: User = await response.json();

                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Erro ao carregar usuário. Usando dados locais.");
            }
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
            .filter((transaction) => transaction.origem === "deposito" || transaction.tipo === "credito")
            .slice(0, 5);
    }, [user]);

    const preview = useMemo(() => {
        const currentBalance = Number(user?.saldo_final || 0);
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
            insight = "Esse depósito será adicionado ao seu saldo geral e registrado no histórico.";
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

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getGoalName(goal: Goal) {
        return goal.title || goal.name || "Meta sem nome";
    }

    function buildDepositMetadata(): DepositMetadata {
        const now = new Date();
        const timestamp = now.getTime();

        const date = now.toLocaleDateString("pt-BR");
        const hour = now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        return {
            id: timestamp,
            transactionId: `DEP-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: now.toISOString(),
            date,
            hour,
            dateTimeLabel: `${date} às ${hour}`,
        };
    }

    function createDepositStatement(
        meta: DepositMetadata,
        deposit: number,
        goal: Goal | null
    ): DepositStatement {
        const customDescription = description.trim();

        return {
            id: meta.id,
            transactionId: meta.transactionId,
            tipo: "credito",
            descricao:
                customDescription ||
                (goal
                    ? `Depósito direcionado para a meta: ${getGoalName(goal)}`
                    : "Depósito realizado no saldo geral"),
            valor: deposit,
            data: meta.date,
            hora: meta.hour,
            dataHora: meta.dateTimeLabel,
            createdAt: meta.createdAt,
            status: "concluido",
            metodo: "saldo_manual",
            origem: "deposito",
            goalId: goal?.id ?? null,
            goalName: goal ? getGoalName(goal) : null,
        };
    }

    function createGoalDeposit(meta: DepositMetadata, deposit: number): GoalDeposit {
        return {
            id: meta.id,
            transactionId: meta.transactionId,
            value: deposit,
            amount: deposit,
            time: meta.createdAt,
            date: meta.date,
            hour: meta.hour,
            dateTimeLabel: meta.dateTimeLabel,
            status: "concluido",
            method: "saldo_manual",
            type: "add",
            description: description.trim() || "Depósito manual",
        };
    }

    function updateLocalGoals(updatedGoals: Goal[]) {
        const storedGoals = localStorage.getItem("saveapp_goals");

        if (!storedGoals) return;

        try {
            const parsedGoals = JSON.parse(storedGoals);

            if (!Array.isArray(parsedGoals)) return;

            const syncedGoals = parsedGoals.map((localGoal: Goal) => {
                const updatedGoal = updatedGoals.find((goal) => goal.id === localGoal.id);

                return updatedGoal
                    ? {
                          ...localGoal,
                          currentAmount: updatedGoal.currentAmount,
                          deposits: updatedGoal.deposits,
                          status:
                              Number(updatedGoal.currentAmount || 0) >=
                              Number(updatedGoal.targetAmount || localGoal.targetAmount || 0)
                                  ? "completed"
                                  : localGoal.status,
                          updatedAt: new Date().toISOString(),
                      }
                    : localGoal;
            });

            localStorage.setItem("saveapp_goals", JSON.stringify(syncedGoals));
        } catch {
            return;
        }
    }

    function resetForm() {
        setDepositValue("");
        setSelectedGoal("none");
        setDescription("");
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

        if (numericDeposit <= 0) {
            setAlert({
                isOpen: true,
                message: "Digite um valor válido para o depósito.",
                type: "warning",
            });
            return;
        }

        const meta = buildDepositMetadata();
        const newBalance = Number(user.saldo_final || 0) + numericDeposit;

        const newStatement = createDepositStatement(
            meta,
            numericDeposit,
            selectedGoalData
        );

        let updatedGoals = [...(user.goals || [])];

        if (selectedGoalData) {
            const goalDeposit = createGoalDeposit(meta, numericDeposit);

            updatedGoals = updatedGoals.map((goal) => {
                if (goal.id !== selectedGoalData.id) return goal;

                return {
                    ...goal,
                    currentAmount: Number(goal.currentAmount || 0) + numericDeposit,
                    deposits: [...(goal.deposits || []), goalDeposit],
                };
            });
        }

        const updatedUser: User = {
            ...user,
            saldo_final: newBalance,
            extratos: [...(user.extratos || []), newStatement],
            goals: updatedGoals,
        };

        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar dados");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            updateLocalGoals(updatedGoals);

            setUser(updatedUser);
            resetForm();

            setAlert({
                isOpen: true,
                message: selectedGoalData
                    ? "Depósito realizado e meta atualizada com sucesso."
                    : "Depósito realizado com sucesso.",
                type: "success",
            });
        } catch {
            setAlert({
                isOpen: true,
                message: "Erro ao realizar depósito.",
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
        {loading ? "Processando..." : "Confirmar depósito"}
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
                                                        <small>
                                                            ID: {transaction.transactionId}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="deposit-history-value">
                                                    <strong>
                                                        + {formatCurrency(Number(transaction.valor))}
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