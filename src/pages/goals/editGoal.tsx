import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, FormGroup, Label, Input, Button } from "reactstrap";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import GoalSection from "../../components/graphic_components/goal_section";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardDeposit from "../../components/graphic_components/card.tsx";

export default function EditGoalPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [image, setImage] = useState("");

  const [depositValue, setDepositValue] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

    if (!storedUser.id) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:3001/users/${storedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);

        const foundGoal = (data.goals || []).find(
          (g: any) => g.id === Number(id)
        );

        if (foundGoal) {
          setGoal(foundGoal);
          setName(foundGoal.name);
          setValue(String(foundGoal.value));
          setImage(foundGoal.image);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="background-color text-white min-vh-100 d-flex justify-content-center align-items-center">
        Carregando meta...
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="background-color text-white min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <p className="text-center mb-3">Meta não encontrada.</p>
        <button
          className="btn btn-success fw-bold"
          onClick={() => navigate("/goals")}
        >
          Voltar para Metas
        </button>
      </div>
    );
  }

  // Corrige depósitos inconsistentes: dep.value OR dep.amount
  const totalDeposits =
    (goal.deposits || []).reduce(
      (acc: number, dep: any) => acc + Number(dep.value ?? dep.amount ?? 0),
      0
    );

  const numericValue = Number(value) || 1;

  const percentage = Math.min((totalDeposits / numericValue) * 100, 100);

  // Salvar informações editadas
  function handleSave() {
    const updatedGoal = {
      ...goal,
      name,
      value: Number(value),
      image,
    };

    const updatedUser = {
      ...user,
      goals: user.goals.map((g: any) =>
        g.id === Number(id) ? updatedGoal : g
      ),
    };

    fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then(() => {
        alert("Meta atualizada com sucesso!");
        navigate("/goals");
      })
      .catch(() => alert("Erro ao salvar alterações."));
  }

  function handleRedirectFunds() {
    const amount = Number(depositValue);

    if (!amount || amount <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    const saldo = Number(user.saldo_final ?? user.balance ?? 0);

    if (amount > saldo) {
      alert("Saldo insuficiente!");
      return;
    }

    const newDeposit = {
      id: Date.now(),
      value: amount,
      time: new Date().toLocaleString("pt-BR"),
    };

    const updatedGoal = {
      ...goal,
      deposits: [...(goal.deposits || []), newDeposit],
    };

    const updatedUser = {
      ...user,
      saldo_final: saldo - amount,
      goals: user.goals.map((g) =>
        g.id === Number(id) ? updatedGoal : g
      ),
    };

    fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then(() => {
        alert("Valor direcionado com sucesso!");
        setUser(updatedUser);
        setGoal(updatedGoal);
        setDepositValue("");
        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      })
      .catch(() => alert("Erro ao direcionar valor."));
  }

  const saldoDisponivel = Number(user.saldo_final ?? user.balance ?? 0);

  return (
    <div className="edit-goal-page min-vh-100 text-white background-color py-4">
      <Container>
        <AccountHeader name={user?.nome} />
        <TitleHeader title={`Editar Meta`} />

        <main className="mt-4">
          <GoalSection
            name={name}
            image={image}
            targetValue={numericValue}
            currentValue={totalDeposits}
          />

          <ProgressBar percentage={Number(percentage.toFixed(0))} />

          {/* Formulário */}
          <section className="mt-4">
            <h6 className="mb-3">Editar Informações</h6>

            <Form>
              <FormGroup className="mb-3">
                <Label>Nome da Meta</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <Label>Imagem (URL)</Label>
                <Input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </FormGroup>

              <Button
                color="success"
                className="fw-bold w-100 mt-3"
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
            </Form>
          </section>

          {/* Direcionar Saldo */}
          <section className="mt-5">
            <h6 className="mb-3">Direcionar saldo geral para esta meta</h6>

            <FormGroup className="mb-3">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min="1"
                value={depositValue}
                onChange={(e) => setDepositValue(e.target.value)}
                placeholder="Ex: 150"
              />
            </FormGroup>

            <Button
              color="primary"
              className="fw-bold w-100"
              onClick={handleRedirectFunds}
              disabled={!depositValue}
            >
              Direcionar para Meta
            </Button>

            <p className="text-secondary mt-2 small">
              Saldo disponível: R{" "}
              {saldoDisponivel.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </section>

          {/* Depósitos */}
          <section className="mt-4">
            <h6 className="mb-3">Depósitos</h6>

            {(goal.deposits || []).length > 0 ? (
              goal.deposits.map((dep: any) => (
                <CardDeposit
                  key={dep.id}
                  time={dep.time}
                  type="Depósito Recebido"
                  value={`R$ ${Number(
                    dep.value ?? dep.amount ?? 0
                  ).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`}
                />
              ))
            ) : (
              <p className="text-secondary">Nenhum depósito encontrado.</p>
            )}
          </section>
        </main>
      </Container>
    </div>
  );
}
