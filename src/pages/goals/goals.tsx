import { useEffect, useMemo, useState } from "react";
import { Button, Container, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import ProgressBar from "../../components/graphic_components/progress_bar";

type GoalDeposit = {
    id: number;
    value?: number;
    amount?: number;
    time: string;
};

type Goal = {
    id: number;
    name: string;
    value: number | string;
    image?: string;
    checked?: boolean;
    deposits?: GoalDeposit[];
};

type User = {
    id: number;
    nome: string;
    goals?: Goal[];
};

export default function GoalsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

    const navigate = useNavigate();

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
                const response = await fetch(
                    `${BASE_URL}/users/${parsedUser.id}`
                );

                if (!response.ok) return;

                const data: User = await response.json();

                setUser(data);
                setGoals(data.goals || []);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível.");
            }
        }

        loadUser();
    }, [navigate]);

    async function persistGoals(updatedGoals: Goal[]) {
        if (!user) return;

        setGoals(updatedGoals);

        const updatedUser = {
            ...user,
            goals: updatedGoals,
        };

        setUser(updatedUser);
        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

        try {
            await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goals: updatedGoals }),
            });
        } catch {
            console.warn("Não foi possível salvar no servidor.");
        }
    }

    function handleDelete(goalId: number) {
        const updatedGoals = goals.filter((goal) => goal.id !== goalId);
        persistGoals(updatedGoals);
    }

    function toggleGoalCheck(goalId: number) {
        const updatedGoals = goals.map((goal) =>
            goal.id === goalId
                ? { ...goal, checked: !goal.checked }
                : goal
        );

        persistGoals(updatedGoals);
    }

    function markAsCompleted(goalId: number) {
        const updatedGoals = goals.map((goal) =>
            goal.id === goalId
                ? { ...goal, checked: true }
                : goal
        );

        persistGoals(updatedGoals);
        setActiveTab("completed");
    }

    const filteredGoals = useMemo(() => {
        return goals.filter((goal) =>
            goal.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [goals, search]);

    const pendingGoals = useMemo(() => {
        return filteredGoals.filter((goal) => !goal.checked);
    }, [filteredGoals]);

    const completedGoals = useMemo(() => {
        return filteredGoals.filter((goal) => goal.checked);
    }, [filteredGoals]);

    function IconRenderer({ iconClass }: { iconClass?: string }) {
        return (
            <div className="home-list-icon">
                <i className={`bi ${iconClass || "bi-bullseye"}`}></i>
            </div>
        );
    }

    function GoalCard({
        goal,
        completed = false,
    }: {
        goal: Goal;
        completed?: boolean;
    }) {
        const totalDeposits = (goal.deposits || []).reduce(
            (acc, dep) => acc + Number(dep.value ?? dep.amount ?? 0),
            0
        );

        const numericValue = Number(goal.value) || 1;
        const percentage = Math.min((totalDeposits / numericValue) * 100, 100);

        return (
            <div
                className="home-list-item"
                style={{
                    opacity: completed ? 0.65 : 1,
                    cursor: "default",
                    alignItems: "stretch",
                }}
            >
                <div className="w-100">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div className="home-list-left">
                            <Input
                                type="checkbox"
                                checked={!!goal.checked}
                                disabled={completed}
                                onChange={!completed ? () => toggleGoalCheck(goal.id) : undefined}
                                style={{ cursor: completed ? "default" : "pointer" }}
                            />

                            <IconRenderer iconClass={goal.image} />

                            <div>
                                <p
                                    className={`home-item-title mb-1 ${completed ? "text-decoration-line-through" : ""
                                        }`}
                                >
                                    {goal.name}
                                </p>

                                <span className="home-item-value home-item-value-credit d-block">
                                    R${" "}
                                    {Number(goal.value).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>

                                <small className="home-item-subtitle">
                                    Guardado: R${" "}
                                    {totalDeposits.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </small>
                            </div>
                        </div>

                        {completed ? (
                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => handleDelete(goal.id)}
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        ) : (
                            <div className="d-flex gap-2 flex-wrap justify-content-end">
                                <Button
                                    color="link"
                                    className="home-action-btn"
                                    onClick={() => navigate(`/edit-goal/${goal.id}`)}
                                >
                                    Editar
                                </Button>

                                <Button
                                    color="link"
                                    className="home-action-btn home-action-btn-primary"
                                    onClick={() => markAsCompleted(goal.id)}
                                >
                                    Concluir
                                </Button>

                                <Button
                                    color="link"
                                    className="home-action-btn"
                                    onClick={() => handleDelete(goal.id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-3">
                        <ProgressBar percentage={Number(percentage.toFixed(0))} />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="background-color text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={user.nome} />

                <div className="home-main">
                    <TitleHeader title="Metas" showCreateButton />

                    <section className="home-section">
                        <div className="home-graph-card">
                            <div className="d-flex gap-3">
                                <Button
                                    color="link"
                                    className={`home-action-btn w-50 fw-bold ${activeTab === "pending" ? "home-action-btn-primary" : ""}`}
                                    onClick={() => setActiveTab("pending")}
                                >
                                    Pendentes
                                </Button>

                                <Button
                                    color="link"
                                    className={`home-action-btn w-50 fw-bold ${activeTab === "completed" ? "home-action-btn-primary" : ""}`}
                                    onClick={() => setActiveTab("completed")}
                                >
                                    Concluídas
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="home-section">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar meta..."
                            className="custom-input-balance"
                        />
                    </section>

                    <main className="home-section">
                        <div className="home-list">
                            {activeTab === "pending" &&
                                (pendingGoals.length === 0 ? (
                                    <div className="home-empty-state">
                                        Nenhuma meta pendente encontrada.
                                    </div>
                                ) : (
                                    pendingGoals.map((goal) => (
                                        <GoalCard key={goal.id} goal={goal} />
                                    ))
                                ))}

                            {activeTab === "completed" &&
                                (completedGoals.length === 0 ? (
                                    <div className="home-empty-state">
                                        Nenhuma meta concluída ainda.
                                    </div>
                                ) : (
                                    completedGoals.map((goal) => (
                                        <GoalCard key={goal.id} goal={goal} completed />
                                    ))
                                ))}
                        </div>
                    </main>
                </div>
            </Container>
        </div>
    );
}