import { useEffect, useState } from "react";
import { Button, Container, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function GoalsPage() {
    const [user, setUser] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                window.location.href = "/login";
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const res = await fetch(`https://database-save-app.onrender.com/users/${parsedUser.id}`);
                if (!res.ok) return;

                const data = await res.json();

                setUser(data);
                setGoals(data.goals || []);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível.");
            }
        };

        loadUser();
    }, []);

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando dados...</div>
            </div>
        );
    }

    const persistGoals = async (updatedGoals: any[]) => {
        setGoals(updatedGoals);

        const updatedUser = { ...user, goals: updatedGoals };
        setUser(updatedUser);
        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

        try {
            await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goals: updatedGoals })
            });
        } catch {
            console.warn("Não foi possível salvar no servidor.");
        }
    };

    const handleDelete = (goalId: number) => {
        const updatedGoals = goals.filter(g => g.id !== goalId);
        persistGoals(updatedGoals);
    };

    const toggleGoalCheck = (goalId: number) => {
        const updatedGoals = goals.map(g =>
            g.id === goalId ? { ...g, checked: !g.checked } : g
        );
        persistGoals(updatedGoals);
    };

    const markAsCompleted = (goalId: number) => {
        const updatedGoals = goals.map(g =>
            g.id === goalId ? { ...g, checked: true } : g
        );

        persistGoals(updatedGoals);
        setActiveTab("completed");
    };

    const filteredGoals = goals.filter(goal =>
        goal.name.toLowerCase().includes(search.toLowerCase())
    );

    const pendingGoals = filteredGoals.filter(g => !g.checked);
    const completedGoals = filteredGoals.filter(g => g.checked);

    const IconRenderer = ({ iconClass }) => (
        <div className="home-list-icon">
            <i className={`bi ${iconClass || "bi-bullseye"}`}></i>
        </div>
    );

    return (
        <div className="background-color text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">

                <AccountHeader name={user.nome} />

                <div className="home-main">

                    <TitleHeader title="Metas" showCreateButton />

                    {/* Tabs */}

                    <div className="home-section">
                        <div className="d-flex gap-3">
                            <Button
                                color={activeTab === "pending" ? "success" : "secondary"}
                                className="fw-bold w-50 py-2"
                                onClick={() => setActiveTab("pending")}
                            >
                                Pendentes
                            </Button>

                            <Button
                                color={activeTab === "completed" ? "success" : "secondary"}
                                className="fw-bold w-50 py-2"
                                onClick={() => setActiveTab("completed")}
                            >
                                Concluídas
                            </Button>
                        </div>
                    </div>

                    {/* Busca */}

                    <section className="home-section">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar meta..."
                            className="custom-input-balance"
                        />
                    </section>

                    {/* Lista */}

                    <main className="home-section">

                        <div className="home-list">

                            {activeTab === "pending" &&
                                (pendingGoals.length === 0 ? (
                                    <div className="home-empty-state">
                                        Nenhuma meta pendente encontrada.
                                    </div>
                                ) : (
                                    pendingGoals.map(goal => (
                                        <div key={goal.id} className="home-list-item">

                                            <div className="home-list-left">

                                                <Input
                                                    type="checkbox"
                                                    checked={goal.checked}
                                                    onChange={() => toggleGoalCheck(goal.id)}
                                                    style={{ cursor: "pointer" }}
                                                />

                                                <IconRenderer iconClass={goal.image} />

                                                <div>
                                                    <p className="home-item-title mb-1">{goal.name}</p>

                                                    <span className="home-item-value home-item-value-credit">
                                                        R${" "}
                                                        {Number(goal.value).toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="d-flex gap-2">

                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    onClick={() => navigate(`/edit-goal/${goal.id}`)}
                                                >
                                                    Editar
                                                </Button>

                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    onClick={() => markAsCompleted(goal.id)}
                                                >
                                                    Concluir
                                                </Button>

                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(goal.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>

                                            </div>

                                        </div>
                                    ))
                                ))}

                            {activeTab === "completed" &&
                                (completedGoals.length === 0 ? (
                                    <div className="home-empty-state">
                                        Nenhuma meta concluída ainda.
                                    </div>
                                ) : (
                                    completedGoals.map(goal => (
                                        <div key={goal.id} className="home-list-item" style={{ opacity: 0.6 }}>

                                            <div className="home-list-left">

                                                <Input type="checkbox" checked disabled />

                                                <IconRenderer iconClass={goal.image} />

                                                <div>
                                                    <p className="home-item-title text-decoration-line-through mb-1">
                                                        {goal.name}
                                                    </p>

                                                    <span className="home-item-value home-item-value-credit">
                                                        R${" "}
                                                        {Number(goal.value).toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>

                                            </div>

                                            <Button
                                                color="danger"
                                                size="sm"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>

                                        </div>
                                    ))
                                ))}

                        </div>

                    </main>

                </div>

            </Container>
        </div>
    );
}