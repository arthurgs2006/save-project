import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
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

type GoalDeposit = {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: "add" | "remove";
};

type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline: string;
  category: GoalCategory;
  priority: GoalPriority;
  icon: string;
  color: string;
  notes: string;
  status: GoalStatus;
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

const STORAGE_KEY = "saveapp_goals";

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(date: string) {
  if (!date) return "Sem prazo";

  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString("pt-BR");
}

function getDaysLeft(deadline: string) {
  if (!deadline) return null;

  const today = new Date();
  const endDate = new Date(`${deadline}T00:00:00`);

  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diff = endDate.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getMonthsLeft(deadline: string) {
  const daysLeft = getDaysLeft(deadline);

  if (daysLeft === null) return null;

  return Math.max(Math.ceil(daysLeft / 30), 1);
}

function calculateProgress(goal: Goal) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0;

  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

function getGoalInsight(goal: Goal) {
  const progress = calculateProgress(goal);
  const missingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const daysLeft = getDaysLeft(goal.deadline);
  const monthsLeft = getMonthsLeft(goal.deadline);
  const monthlyNeeded = monthsLeft ? missingAmount / monthsLeft : 0;

  if (goal.status === "completed" || progress >= 100) {
    return {
      title: "Meta alcançada",
      message: "Essa meta já chegou ao valor planejado. Você pode mantê-la concluída ou aumentar o objetivo.",
      tone: "success",
    };
  }

  if (daysLeft !== null && daysLeft < 0) {
    return {
      title: "Prazo vencido",
      message: `Ainda faltam ${formatMoney(missingAmount)}. Considere ajustar o prazo ou reduzir o valor alvo.`,
      tone: "danger",
    };
  }

  if (monthsLeft && goal.monthlyContribution >= monthlyNeeded) {
    return {
      title: "Você está no caminho certo",
      message: `Mantendo ${formatMoney(goal.monthlyContribution)} por mês, a meta tende a ser alcançada dentro do prazo.`,
      tone: "success",
    };
  }

  if (monthsLeft && monthlyNeeded > 0) {
    return {
      title: "Aporte recomendado",
      message: `Para alcançar no prazo, seria ideal guardar cerca de ${formatMoney(monthlyNeeded)} por mês.`,
      tone: "warning",
    };
  }

  return {
    title: "Meta em andamento",
    message: "Defina um prazo e um aporte mensal para receber uma previsão mais precisa.",
    tone: "info",
  };
}

function buildGoalFromForm(form: GoalForm, editingGoal?: Goal): Goal {
  const now = new Date().toISOString();

  const targetAmount = Number(form.targetAmount) || 0;
  const currentAmount = Number(form.currentAmount) || 0;
  const monthlyContribution = Number(form.monthlyContribution) || 0;

  return {
    id: editingGoal?.id || Date.now(),
    title: form.title.trim(),
    targetAmount,
    currentAmount,
    monthlyContribution,
    deadline: form.deadline,
    category: form.category,
    priority: form.priority,
    icon: form.icon,
    color: form.color,
    notes: form.notes.trim(),
    status: editingGoal?.status || "active",
    deposits: editingGoal?.deposits || [],
    createdAt: editingGoal?.createdAt || now,
    updatedAt: now,
  };
}

export default function GoalsPage() {
  const [userName, setUserName] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedGoals = localStorage.getItem(STORAGE_KEY);
    const storedUser = localStorage.getItem("loggedUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user?.nome || user?.name || "");

        if (!storedGoals && Array.isArray(user?.goals)) {
          const migratedGoals = user.goals.map((goal: any) => {
            const deposits = goal.deposits || [];
            const currentAmount = deposits.reduce(
              (acc: number, dep: any) => acc + Number(dep.value ?? dep.amount ?? 0),
              0
            );

            return {
              id: goal.id || Date.now(),
              title: goal.title || goal.name || "Meta sem nome",
              targetAmount: Number(goal.targetAmount || goal.value || 0),
              currentAmount: Number(goal.currentAmount || currentAmount || 0),
              monthlyContribution: Number(goal.monthlyContribution || 0),
              deadline: goal.deadline || "",
              category: goal.category || "outros",
              priority: goal.priority || "media",
              icon: goal.icon || goal.image || "bi-bullseye",
              color: goal.color || "#38bdf8",
              notes: goal.notes || "",
              status: goal.status || (goal.checked ? "completed" : "active"),
              deposits: [],
              createdAt: goal.createdAt || new Date().toISOString(),
              updatedAt: goal.updatedAt || new Date().toISOString(),
            };
          });

          setGoals(migratedGoals);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedGoals));
          return;
        }
      } catch {
        setUserName("");
      }
    }

    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

    const storedUser = localStorage.getItem("loggedUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          goals,
        };

        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      } catch {
        return;
      }
    }
  }, [goals]);

  const editingGoal = useMemo(() => {
    return goals.find((goal) => goal.id === editingId) || null;
  }, [goals, editingId]);

  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        if (filter === "all") return true;
        return goal.status === filter;
      })
      .filter((goal) => {
        const text = `${goal.title} ${goal.category} ${goal.priority}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active" ? -1 : 1;

        const priorityWeight: Record<GoalPriority, number> = {
          alta: 3,
          media: 2,
          baixa: 1,
        };

        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
  }, [goals, filter, search]);

  const summary = useMemo(() => {
    const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
    const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
    const activeGoals = goals.filter((goal) => goal.status === "active").length;
    const completedGoals = goals.filter((goal) => goal.status === "completed").length;
    const progress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

    return {
      totalTarget,
      totalSaved,
      activeGoals,
      completedGoals,
      progress,
    };
  }, [goals]);

  function updateForm(field: keyof GoalForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      showMessage("Digite o nome da meta.");
      return;
    }

    if (Number(form.targetAmount) <= 0) {
      showMessage("Digite um valor alvo válido.");
      return;
    }

    if (Number(form.currentAmount) < 0) {
      showMessage("O valor atual não pode ser negativo.");
      return;
    }

    if (Number(form.currentAmount) > Number(form.targetAmount)) {
      showMessage("O valor atual não pode ser maior que o valor alvo.");
      return;
    }

    if (Number(form.monthlyContribution) < 0) {
      showMessage("O aporte mensal não pode ser negativo.");
      return;
    }

    const newGoal = buildGoalFromForm(form, editingGoal || undefined);

    if (newGoal.currentAmount >= newGoal.targetAmount) {
      newGoal.status = "completed";
    }

    if (editingId) {
      setGoals((prev) =>
        prev.map((goal) => (goal.id === editingId ? newGoal : goal))
      );

      showMessage("Meta atualizada com sucesso.");
    } else {
      setGoals((prev) => [newGoal, ...prev]);
      showMessage("Meta criada com sucesso.");
    }

    resetForm();
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);

    setForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      monthlyContribution: String(goal.monthlyContribution),
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
      icon: goal.icon,
      color: goal.color,
      notes: goal.notes,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteGoal(goalId: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta meta?");

    if (!confirmed) return;

    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));

    if (editingId === goalId) resetForm();

    showMessage("Meta excluída.");
  }

  function toggleCompleted(goalId: number) {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          status: goal.status === "completed" ? "active" : "completed",
          currentAmount:
            goal.status === "active"
              ? Math.max(goal.currentAmount, goal.targetAmount)
              : goal.currentAmount,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showMessage("Status da meta atualizado.");
  }

  function openDeposit(goalId: number) {
    setDepositGoalId(goalId);
    setDepositAmount("");
    setDepositDescription("");
  }

  function closeDeposit() {
    setDepositGoalId(null);
    setDepositAmount("");
    setDepositDescription("");
  }

  function addDeposit(type: "add" | "remove") {
    if (!depositGoalId) return;

    const amount = Number(depositAmount);

    if (!amount || amount <= 0) {
      showMessage("Digite um valor válido.");
      return;
    }

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== depositGoalId) return goal;

        const nextAmount =
          type === "add"
            ? goal.currentAmount + amount
            : Math.max(goal.currentAmount - amount, 0);

        const updatedGoal: Goal = {
          ...goal,
          currentAmount: Math.min(nextAmount, goal.targetAmount),
          deposits: [
            {
              id: Date.now(),
              amount,
              description:
                depositDescription.trim() ||
                (type === "add" ? "Aporte manual" : "Remoção manual"),
              date: new Date().toISOString(),
              type,
            },
            ...goal.deposits,
          ],
          status: nextAmount >= goal.targetAmount ? "completed" : "active",
          updatedAt: new Date().toISOString(),
        };

        return updatedGoal;
      })
    );

    closeDeposit();
    showMessage(type === "add" ? "Valor adicionado à meta." : "Valor removido da meta.");
  }

  function duplicateGoal(goal: Goal) {
    const copiedGoal: Goal = {
      ...goal,
      id: Date.now(),
      title: `${goal.title} cópia`,
      currentAmount: 0,
      status: "active",
      deposits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => [copiedGoal, ...prev]);
    showMessage("Meta duplicada.");
  }

  return (
    <div className="goals-page">
      <Container className="goals-container">
        <AccountHeader name={userName} />

        <TitleHeader title="Metas" />

        {message && <div className="goals-toast">{message}</div>}

        <section className="goals-hero">
          <div>
            <span className="goals-badge">Planejamento pessoal</span>
            <h1>Organize suas metas e acompanhe seu progresso</h1>
            <p>
              Crie objetivos financeiros, registre aportes, acompanhe o prazo e veja
              previsões simples para entender se você está no ritmo certo.
            </p>
          </div>

          <div className="goals-hero-progress">
            <span>Progresso geral</span>
            <strong>{summary.progress.toFixed(0)}%</strong>

            <div className="goals-progress-track">
              <div style={{ width: `${summary.progress}%` }} />
            </div>

            <small>
              {formatMoney(summary.totalSaved)} guardados de{" "}
              {formatMoney(summary.totalTarget)}
            </small>
          </div>
        </section>

        <section className="goals-summary-grid">
          <div className="goals-summary-card">
            <span>Total planejado</span>
            <strong>{formatMoney(summary.totalTarget)}</strong>
          </div>

          <div className="goals-summary-card">
            <span>Total guardado</span>
            <strong>{formatMoney(summary.totalSaved)}</strong>
          </div>

          <div className="goals-summary-card">
            <span>Metas ativas</span>
            <strong>{summary.activeGoals}</strong>
          </div>

          <div className="goals-summary-card">
            <span>Concluídas</span>
            <strong>{summary.completedGoals}</strong>
          </div>
        </section>

        <section className="goals-layout">
          <form className="goals-form-card" onSubmit={handleSubmit}>
            <div className="goals-form-header">
              <div>
                <span className="goals-badge secondary">
                  {editingId ? "Editando meta" : "Nova meta"}
                </span>
                <h2>{editingId ? "Atualizar objetivo" : "Criar objetivo"}</h2>
                <p>
                  Preencha os dados principais para o SaveApp calcular progresso,
                  previsão e recomendação.
                </p>
              </div>

              {editingId && (
                <button type="button" className="goals-ghost-btn" onClick={resetForm}>
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="goals-form-grid">
              <label>
                Nome da meta
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Ex: Reserva de emergência"
                />
              </label>

              <label>
                Categoria
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value as GoalCategory)
                  }
                >
                  <option value="reserva">Reserva</option>
                  <option value="viagem">Viagem</option>
                  <option value="estudos">Estudos</option>
                  <option value="compras">Compras</option>
                  <option value="casa">Casa</option>
                  <option value="veiculo">Veículo</option>
                  <option value="investimento">Investimento</option>
                  <option value="outros">Outros</option>
                </select>
              </label>

              <label>
                Valor alvo
                <input
                  type="number"
                  min="1"
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
                  value={form.monthlyContribution}
                  onChange={(event) =>
                    updateForm("monthlyContribution", event.target.value)
                  }
                  placeholder="Ex: 400"
                />
              </label>

              <label>
                Prazo
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => updateForm("deadline", event.target.value)}
                />
              </label>

              <label>
                Prioridade
                <select
                  value={form.priority}
                  onChange={(event) =>
                    updateForm("priority", event.target.value as GoalPriority)
                  }
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </label>

              <label>
                Ícone
                <select
                  value={form.icon}
                  onChange={(event) => updateForm("icon", event.target.value)}
                >
                  {iconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="goals-color-row">
              <span>Cor da meta</span>

              <div>
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
            </div>

            <label className="goals-notes-label">
              Observações
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Ex: guardar esse dinheiro apenas para emergências."
              />
            </label>

            <button type="submit" className="goals-main-btn">
              {editingId ? "Salvar alterações" : "Criar meta"}
            </button>
          </form>

          <aside className="goals-preview-card">
            <span className="goals-badge">Prévia</span>

            <div className="goals-preview-icon" style={{ color: form.color }}>
              <i className={`bi ${form.icon}`} />
            </div>

            <h2>{form.title || "Nome da meta"}</h2>

            <p>
              {categoryLabels[form.category]} • Prioridade{" "}
              {priorityLabels[form.priority]}
            </p>

            <strong>{formatMoney(Number(form.targetAmount) || 0)}</strong>

            <div className="goals-progress-track">
              <div
                style={{
                  width: `${
                    Number(form.targetAmount) > 0
                      ? Math.min(
                          (Number(form.currentAmount) /
                            Number(form.targetAmount)) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                  background: form.color,
                }}
              />
            </div>

            <small>
              {formatMoney(Number(form.currentAmount) || 0)} guardados até agora
            </small>
          </aside>
        </section>

        <section className="goals-toolbar">
          <div className="goals-tabs">
            <button
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Ativas
            </button>

            <button
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              Concluídas
            </button>

            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar meta..."
          />
        </section>

        <section className="goals-list">
          {filteredGoals.length === 0 ? (
            <div className="goals-empty">
              <i className="bi bi-bullseye" />
              <h3>Nenhuma meta encontrada</h3>
              <p>Crie sua primeira meta ou altere os filtros de busca.</p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const progress = calculateProgress(goal);
              const missingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
              const daysLeft = getDaysLeft(goal.deadline);
              const monthsLeft = getMonthsLeft(goal.deadline);
              const monthlyNeeded = monthsLeft ? missingAmount / monthsLeft : 0;
              const insight = getGoalInsight(goal);

              return (
                <article className="goal-card" key={goal.id}>
                  <div className="goal-card-top">
                    <div className="goal-title-area">
                      <div className="goal-icon" style={{ color: goal.color }}>
                        <i className={`bi ${goal.icon}`} />
                      </div>

                      <div>
                        <div className="goal-tags">
                          <span>{categoryLabels[goal.category]}</span>
                          <span className={`priority ${goal.priority}`}>
                            {priorityLabels[goal.priority]}
                          </span>
                          {goal.status === "completed" && (
                            <span className="completed-tag">Concluída</span>
                          )}
                        </div>

                        <h3>{goal.title}</h3>

                        <p>
                          {formatMoney(goal.currentAmount)} de{" "}
                          {formatMoney(goal.targetAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="goal-actions">
                      <button onClick={() => openDeposit(goal.id)}>
                        Aporte
                      </button>

                      <button onClick={() => startEdit(goal)}>
                        Editar
                      </button>

                      <button onClick={() => duplicateGoal(goal)}>
                        Duplicar
                      </button>

                      <button onClick={() => toggleCompleted(goal.id)}>
                        {goal.status === "completed" ? "Reabrir" : "Concluir"}
                      </button>

                      <button className="danger" onClick={() => deleteGoal(goal.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress-area">
                    <div className="goal-progress-info">
                      <strong>{progress.toFixed(0)}%</strong>
                      <span>{formatMoney(missingAmount)} restantes</span>
                    </div>

                    <div className="goals-progress-track">
                      <div
                        style={{
                          width: `${progress}%`,
                          background: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="goal-metrics">
                    <div>
                      <span>Prazo</span>
                      <strong>{formatDate(goal.deadline)}</strong>
                    </div>

                    <div>
                      <span>Dias restantes</span>
                      <strong>
                        {daysLeft === null
                          ? "Sem prazo"
                          : daysLeft < 0
                          ? "Vencida"
                          : `${daysLeft} dias`}
                      </strong>
                    </div>

                    <div>
                      <span>Aporte mensal</span>
                      <strong>{formatMoney(goal.monthlyContribution)}</strong>
                    </div>

                    <div>
                      <span>Necessário/mês</span>
                      <strong>
                        {monthsLeft ? formatMoney(monthlyNeeded) : "Sem prazo"}
                      </strong>
                    </div>
                  </div>

                  <div className={`goal-insight ${insight.tone}`}>
                    <strong>{insight.title}</strong>
                    <p>{insight.message}</p>
                  </div>

                  {goal.notes && (
                    <p className="goal-notes">
                      <strong>Observação:</strong> {goal.notes}
                    </p>
                  )}

                  {depositGoalId === goal.id && (
                    <div className="deposit-box">
                      <div className="deposit-grid">
                        <label>
                          Valor
                          <input
                            type="number"
                            min="1"
                            value={depositAmount}
                            onChange={(event) => setDepositAmount(event.target.value)}
                            placeholder="Ex: 200"
                          />
                        </label>

                        <label>
                          Descrição
                          <input
                            value={depositDescription}
                            onChange={(event) =>
                              setDepositDescription(event.target.value)
                            }
                            placeholder="Ex: aporte do mês"
                          />
                        </label>
                      </div>

                      <div className="deposit-actions">
                        <button onClick={() => addDeposit("add")}>
                          Adicionar
                        </button>

                        <button onClick={() => addDeposit("remove")}>
                          Remover
                        </button>

                        <button className="ghost" onClick={closeDeposit}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {goal.deposits.length > 0 && (
                    <details className="goal-history">
                      <summary>Histórico de movimentações</summary>

                      <div>
                        {goal.deposits.slice(0, 5).map((deposit) => (
                          <p key={deposit.id}>
                            <span>
                              {deposit.type === "add" ? "+" : "-"}{" "}
                              {formatMoney(deposit.amount)}
                            </span>

                            <small>
                              {deposit.description} •{" "}
                              {new Date(deposit.date).toLocaleDateString("pt-BR")}
                            </small>
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </article>
              );
            })
          )}
        </section>
      </Container>
    </div>
  );
}