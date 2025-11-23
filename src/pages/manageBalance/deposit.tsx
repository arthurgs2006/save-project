import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { motion } from "framer-motion";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function DepositPage() {
  const [user, setUser] = useState<any>(null);

  const [depositValue, setDepositValue] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("none");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("loggedUser");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    fetch(`https://database-save-app.onrender.com/users/${parsed.id}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  async function handleDeposit() {
    if (!user) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    const deposit = Number(depositValue);
    if (isNaN(deposit) || deposit <= 0) {
      alert("Digite um valor válido!");
      return;
    }

    const newBalance = (user.saldo_final || 0) + deposit;

    const newStatement = {
      id: Date.now(),
      tipo: "credito",
      descricao:
        selectedGoal === "none"
          ? "Depósito realizado"
          : `Depósito na meta: ${
              user.goals.find((g: any) => g.id === Number(selectedGoal))?.name
            }`,
      valor: deposit,
      data: new Date().toISOString().split("T")[0],
    };

    let updatedGoals = [...(user.goals || [])];

    if (selectedGoal !== "none") {
      updatedGoals = updatedGoals.map((goal: any) => {
        if (goal.id === Number(selectedGoal)) {
          return {
            ...goal,
            deposits: [
              ...(goal.deposits || []),
              {
                id: Date.now(),
                value: deposit,
                time: new Date().toISOString(),
              },
            ],
          };
        }
        return goal;
      });
    }

    const updatedUser = {
      ...user,
      saldo_final: newBalance,
      extratos: [...(user.extratos || []), newStatement],
      goals: updatedGoals,
    };

    try {
      setLoading(true);

      const res = await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Erro ao atualizar dados");

      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setDepositValue("");
      setSelectedGoal("none");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar depósito.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="background-color text-white min-vh-100 d-flex align-items-center py-5">
      <Container>
        
        <Row className="justify-content-center">
          <Col md={6}>
            <motion.div
              className="p-4 rounded shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            
            >
               <TitleHeader title="Depositar"/>
              {!user ? (
                <p className="text-center text-secondary">
                  Carregando informações...
                </p>
              ) : (
                <>
                  <Card
                    className="border-0 mb-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  >
                    <CardBody className="text-center">
                      <h6 className="text-secondary mb-1">Saldo Atual</h6>
                      <motion.h2
                        key={user.saldo_final}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="fw-bold text-success"
                      >
                        R$
                        {user.saldo_final
                          ?.toFixed(2)
                          .replace(".", ",") || "0,00"}
                      </motion.h2>
                    </CardBody>
                  </Card>

                  <Label className="fw-bold">Valor do Depósito</Label>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="h4 mb-0">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={depositValue}
                      onChange={(e) => setDepositValue(e.target.value)}
                      placeholder="0,00"
                      className="custom-input-balance text-center fw-bold"
                      style={{ fontSize: "1.2rem" }}
                    />
                  </div>

                  <Label className="fw-bold mt-3">Direcionar depósito para</Label>
                  <Input
                    type="select"
                    className="mb-4"
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                  >
                    <option value="none">Saldo geral</option>
                    {user.goals?.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Input>

                  <Button
                    color="success"
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-100 fw-bold py-2 rounded-pill"
                  >
                    {loading ? "Processando..." : "Confirmar Depósito"}
                  </Button>

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center mt-3 text-success fw-bold"
                    >
                      ✅ Depósito realizado!
                    </motion.div>
                  )}

                  {user.extratos?.length > 0 && (
                    <div className="mt-5">
                      <h5 className="fw-bold mb-3">📜 Histórico</h5>
                      <ListGroup flush>
                        {[...user.extratos]
                          .reverse()
                          .slice(0, 5)
                          .map((item) => (
                            <ListGroupItem
                              key={item.id}
                              className="d-flex justify-content-between align-items-center text-white"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.06)",
                                border: "none",
                              }}
                            >
                              <span>{item.descricao}</span>
                              <span className="fw-bold text-success">
                                + R$ {item.valor.toFixed(2).replace(".", ",")}
                              </span>
                            </ListGroupItem>
                          ))}
                      </ListGroup>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}