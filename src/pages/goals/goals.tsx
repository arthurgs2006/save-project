import { useEffect, useState } from "react";
import { Button, Container, Input, InputGroup, InputGroupText } from "reactstrap";
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
        const res = await fetch(`http://localhost:3001/users/${parsedUser.id}`);
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
      <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
        Carregando dados...
      </div>
    );
  }

  const persistGoals = async (updatedGoals: any[]) => {
    setGoals(updatedGoals);

    const updatedUser = { ...user, goals: updatedGoals };
    setUser(updatedUser);
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

    try {
      await fetch(`http://localhost:3001/users/${user.id}`, {
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
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "4px",
        backgroundColor: "#3A5BFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <i className={`bi ${iconClass || "bi-bullseye"} fs-5 text-white`}></i>
    </div>
  );

  return (
    <div className="min-vh-100 text-white background-color py-4">
      <Container>
        <AccountHeader name={user.nome} />
        <TitleHeader title="Metas" showCreateButton />


        <div className="d-flex gap-3 my-3">
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


        <InputGroup className="mb-4">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-dark text-white border-secondary"
            placeholder="Pesquisar meta..."
          />
          <InputGroupText className="bg-secondary border-secondary">
            <i className="bi bi-search text-white"></i>
          </InputGroupText>
        </InputGroup>


        <main>
          <ul className="list-unstyled">

            {activeTab === "pending" &&
              (pendingGoals.length === 0 ? (
                <p className="text-secondary">Nenhuma meta pendente encontrada.</p>
              ) : (
                pendingGoals.map(goal => (
                  <li
                    key={goal.id}
                    className="p-3 mb-3 rounded bg-dark border border-secondary goal-item"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Input
                        type="checkbox"
                        checked={goal.checked}
                        onChange={() => toggleGoalCheck(goal.id)}
                        className="form-check-input m-0"
                        style={{ cursor: "pointer" }}
                      />

                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center gap-3">
                          <IconRenderer iconClass={goal.image} />
                          <strong>{goal.name}</strong>
                        </div>

                        <span className="text-success fw-bold">
                          R${" "}
                          {Number(goal.value).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>


                    <div className="mt-3 d-flex justify-content-end gap-2">
                      <Button
                        color="success"
                        className="px-3 fw-bold py-1"
                        onClick={() => navigate(`/edit-goal/${goal.id}`)}
                      >
                        Editar
                      </Button>

                      <Button
                        color="info"
                        className="px-3 fw-bold py-1"
                        onClick={() => markAsCompleted(goal.id)}
                      >
                        Concluir
                      </Button>

                      <Button
                        color="danger"
                        className="px-3 fw-bold py-1 d-flex align-items-center gap-2"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <i className="bi bi-trash"></i>
                        Remover
                      </Button>
                    </div>
                  </li>
                ))
              ))}

  
            {activeTab === "completed" &&
              (completedGoals.length === 0 ? (
                <p className="text-secondary">Nenhuma meta concluída ainda.</p>
              ) : (
                completedGoals.map(goal => (
                  <li
                    key={goal.id}
                    className="p-3 mb-3 rounded bg-dark border border-secondary"
                    style={{ opacity: 0.6 }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Input type="checkbox" checked disabled className="m-0" />

                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center gap-3">
                          <IconRenderer iconClass={goal.image} />
                          <strong className="text-decoration-line-through">
                            {goal.name}
                          </strong>
                        </div>

                        <span className="text-success fw-bold">
                          R${" "}
                          {Number(goal.value).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-end">
                      <Button
                        color="danger"
                        className="px-3 fw-bold py-1 d-flex align-items-center gap-2"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <i className="bi bi-trash"></i>
                        Remover
                      </Button>
                    </div>
                  </li>
                ))
              ))}
          </ul>
        </main>
      </Container>
    </div>
  );
}
