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

  const [name, setName] = useState("");
  const [value, setValue] = useState<string>("");

  const [initialDeposit, setInitialDeposit] = useState<string>("");
  const [depositValue, setDepositValue] = useState<string>("");

  const [redirectedAmount, setRedirectedAmount] = useState<number>(0);
  const [icon, setIcon] = useState<string>(""); 

  const randomIcons = [
    "bi-piggy-bank-fill",
    "bi-bag-fill",
    "bi-gift-fill",
    "bi-coin",
    "bi-cash-coin",
    "bi-star-fill",
  ];

  const getRandomIcon = () => {
    const index = Math.floor(Math.random() * randomIcons.length);
    return randomIcons[index];
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

    fetch(`https://database-save-app.onrender.com/users/${storedUser.id}`)
      .then((res) => res.json())
      .then((data) => setUser(data));


    setIcon(getRandomIcon());
  }, []);

  if (!user) {
    return (
      <div className="background-color text-white min-vh-100 d-flex justify-content-center align-items-center">
        Carregando usuário...
      </div>
    );
  }

  const handleRedirectFunds = () => {
    if (!depositValue) return;

    const amount = Number(depositValue);

    if (amount > user.saldo_final) {
      alert("Saldo insuficiente!");
      return;
    }

    setRedirectedAmount((prev) => prev + amount);

    const updatedUser = {
      ...user,
      saldo_final: user.saldo_final - amount,
    };

    setUser(updatedUser);
    setDepositValue("");

    alert(`R$ ${amount.toFixed(2)} direcionados para esta meta.`);
  };

  const handleCreateGoal = async (e: any) => {
    e.preventDefault();

    const numericValue = Number(value);
    const initDep = Number(initialDeposit);

    const goalIcon = icon;

    const newGoal = {
      id: Date.now(),
      name,
      value: numericValue,
      image: goalIcon, 
      deposits: []
    };

    if (initDep > 0) {
      newGoal.deposits.push({
        id: Date.now() + 1,
        amount: initDep,
        date: new Date().toISOString()
      });
    }

    if (redirectedAmount > 0) {
      newGoal.deposits.push({
        id: Date.now() + 2,
        amount: redirectedAmount,
        date: new Date().toISOString()
      });
    }

    const updatedUser = {
      ...user,
      saldo_final: user.saldo_final,
      goals: [...(user.goals || []), newGoal]
    };

    await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
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

          {user.balance > 0 && (
            <Card className="mb-4 text-dark">
              <CardBody>
                <h6 className="fw-bold">Direcionar saldo disponível</h6>
                <p className="mb-2">Saldo atual: <strong>R$ {user.balance?.toFixed(2) || '0.00'}</strong></p>

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

          {name && Number(value) > 0 && icon && ( 
            <>
              <GoalSection
                name={name}
                image={icon} 
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
                disabled={!depositValue || Number(depositValue) <= 0 || Number(depositValue) > user.saldo_final} // Melhoria na desativação
              >
                Direcionar para Meta
              </Button>

              <p className="text-secondary mt-2 small">
                Saldo disponível:{" "}
                R${user.saldo_final.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </section>

            <div className="mt-4 d-flex gap-3">
              <Button color="success" type="submit" disabled={!name || Number(value) <= 0}>
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