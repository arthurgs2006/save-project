import { useEffect, useState } from "react";
import { Button, Container, Input, InputGroup, InputGroupText } from "reactstrap";
import { useNavigate } from "react-router-dom";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  const navigate = useNavigate();

  // Carregar metas
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");
    if (!user.id) return;

    fetch(`http://localhost:3001/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setGoals(data.goals || []);
      })
      .catch(err => console.error("Erro ao carregar metas:", err));
  }, []);

  // Salvar metas
  const persistGoals = async (updatedGoals: any[]) => {
    const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");
    if (!user.id) return;

    setGoals(updatedGoals);

    await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: updatedGoals })
    });
  };

  // Remover meta
  const handleDelete = async (goalId: number) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    persistGoals(updatedGoals);
  };

  // MARCAR / DESMARCAR CHECKBOX
  const toggleGoalCheck = (goalId: number) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId ? { ...g, checked: !g.checked } : g
    );
    persistGoals(updatedGoals);
  };

  // MARCAR COMO CONCLUÍDA PELO BOTÃO
  const markAsCompleted = (goalId: number) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId ? { ...g, checked: true } : g
    );
    persistGoals(updatedGoals);

    setActiveTab("completed"); // muda de aba automaticamente
  };

  // Filtragem
  const filteredGoals = goals.filter(goal =>
    goal.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingGoals = filteredGoals.filter(g => !g.checked);
  const completedGoals = filteredGoals.filter(g => g.checked);

  return (
    <div className="min-vh-100 text-white background-color py-4">
      <Container>
        <AccountHeader />
        <TitleHeader title="Metas" showCreateButton />

        {/* Alternância */}
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

        {/* Busca */}
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

        {/* Listagem */}
        <main>
          <ul className="list-unstyled">

            {/* === PENDENTES === */}
            {activeTab === "pending" && (
              <>
                {pendingGoals.length === 0 ? (
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
                        />

                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={goal.image}
                              alt="goal"
                              className="rounded"
                              width={40}
                              height={40}
                            />
                            <strong>{goal.name}</strong>
                          </div>

                          <span className="text-success fw-bold">
                            R$ {Number(goal.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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

                        {/* BOTÃO CONCLUIR */}
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
                )}
              </>
            )}

            {/* === CONCLUÍDAS === */}
            {activeTab === "completed" && (
              <>
                {completedGoals.length === 0 ? (
                  <p className="text-secondary">Nenhuma meta concluída ainda.</p>
                ) : (
                  completedGoals.map(goal => (
                    <li
                      key={goal.id}
                      className="p-3 mb-3 rounded bg-dark border border-secondary"
                      style={{ opacity: 0.6 }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Input
                          type="checkbox"
                          checked={goal.checked}
                          disabled
                          className="form-check-input m-0"
                        />

                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={goal.image}
                              alt="goal"
                              className="rounded"
                              width={40}
                              height={40}
                            />
                            <strong className="text-decoration-line-through">{goal.name}</strong>
                          </div>

                          <span className="text-success fw-bold">
                            R$ {Number(goal.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                )}
              </>
            )}
          </ul>
        </main>
      </Container>
    </div>
  );
}
