import { useState, useEffect } from "react";
import { Container, Form, FormGroup, Label, Input, Button, Card, CardBody } from "reactstrap";
import { useNavigate } from "react-router-dom";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import GoalSection from "../../components/graphic_components/goal_section";
import ProgressBar from "../../components/graphic_components/progress_bar";

export default function CreateGoalPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  // Estados da nova meta
  const [name, setName] = useState("");
  const [value, setValue] = useState<string>("");
  const [image, setImage] = useState("");

  // Valor inicial opcional da meta
  const [initialDeposit, setInitialDeposit] = useState<string>("");

  // Valor digitado no campo de redirecionamento
  const [depositValue, setDepositValue] = useState<string>("");

  // Valor total realmente direcionado (pode ser somado várias vezes)
  const [redirectedAmount, setRedirectedAmount] = useState<number>(0);

  // Carrega o usuário logado
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

    fetch(`http://localhost:3001/users/${storedUser.id}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) {
    return (
      <div className="background-color text-white min-vh-100 d-flex justify-content-center align-items-center">
        Carregando usuário...
      </div>
    );
  }

  // 👉 Direcionar saldo geral ANTES de criar a meta
  const handleRedirectFunds = () => {
    if (!depositValue) return;

    const amount = Number(depositValue);

    if (amount > user.saldo_final) {
      alert("Saldo insuficiente!");
      return;
    }

    // Soma ao total já direcionado
    setRedirectedAmount((prev) => prev + amount);

    // Atualiza saldo do usuário no estado
    const updatedUser = {
      ...user,
      saldo_final: user.saldo_final - amount,
    };

    setUser(updatedUser);
    setDepositValue("");

    alert(`R$ ${amount.toFixed(2)} direcionados para esta meta.`);
  };

  // 👉 Criar meta
  const handleCreateGoal = async (e: any) => {
    e.preventDefault();

    const numericValue = Number(value);
    const initDep = Number(initialDeposit);

    const newGoal = {
      id: Date.now(),
      name,
      value: numericValue,
      image,
      deposits: []
    };

    // Depósito inicial manual
    if (initDep > 0) {
      newGoal.deposits.push({
        id: Date.now() + 1,
        amount: initDep,
        date: new Date().toISOString()
      });
    }

    // Depósito vindo do saldo geral
    if (redirectedAmount > 0) {
      newGoal.deposits.push({
        id: Date.now() + 2,
        amount: redirectedAmount,
        date: new Date().toISOString()
      });
    }

    // Atualiza o usuário com a nova meta
    const updatedUser = {
      ...user,
      saldo_final: user.saldo_final,
      goals: [...(user.goals || []), newGoal]
    };

    await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser)
    });

    navigate("/goals");
  };

  return (
    <div className="create-goal-page min-vh-100 text-white background-color py-4">
      <Container>
        <AccountHeader name={user?.nome} />

        <TitleHeader 
          title="Criar Nova Meta"
          backLink="/goals"
        />

        <main className="mt-4">

          {/* Direcionar valor inicial opcional */}
          {user.balance > 0 && (
            <Card className="mb-4 text-dark">
              <CardBody>
                <h6 className="fw-bold">Direcionar saldo disponível</h6>
                <p className="mb-2">Saldo atual: <strong>R$ {user.balance.toFixed(2)}</strong></p>

                <Input
                  type="number"
                  min={0}
                  max={user.balance}
                  placeholder="Digite quanto deseja direcionar"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                />

                {Number(initialDeposit) > user.balance && (
                  <p className="text-danger mt-2">Saldo insuficiente.</p>
                )}
              </CardBody>
            </Card>
          )}

          {/* Preview da Meta */}
          {name && Number(value) > 0 && (
            <>
              <GoalSection
                name={name}
                image={image}
                targetValue={Number(value)}
                currentValue={(Number(initialDeposit) || 0) + redirectedAmount}
              />

              <ProgressBar
                percentage={
                  value && Number(value) > 0
                    ? ((Number(initialDeposit) + redirectedAmount) / Number(value)) * 100
                    : 0
                }
              />
            </>
          )}

          {/* Formulário */}
          <Form onSubmit={handleCreateGoal} className="mt-4">
            
            <FormGroup>
              <Label for="goalName">Nome da Meta</Label>
              <Input
                id="goalName"
                type="text"
                placeholder="Ex: Comprar Notebook"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="goalValue">Valor Necessário (R$)</Label>
              <Input
                id="goalValue"
                type="number"
                min="1"
                placeholder="Ex: 3500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="goalImage">URL da Imagem</Label>
              <Input
                id="goalImage"
                type="text"
                placeholder="Ex: https://imagem.com/notebook.png"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </FormGroup>

            {/* Direcionar saldo geral */}
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
                Saldo disponível: R${" "}
                {user.saldo_final.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </section>

            <div className="mt-4 d-flex gap-3">
              <Button color="success" type="submit">
                Criar Meta
              </Button>

              <Button color="secondary" onClick={() => navigate("/goals")}>
                Cancelar
              </Button>
            </div>
          </Form>

        </main>
      </Container>
    </div>
  );
}
