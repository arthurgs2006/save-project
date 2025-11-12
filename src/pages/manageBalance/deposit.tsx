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

export default function DepositPage() {
  const [user, setUser] = useState<any>(null);
  const [depositValue, setDepositValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function handleDeposit() {
    if (!user) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    const deposit = Number(depositValue);
    if (isNaN(deposit) || deposit <= 0) {
      alert("Digite um valor de depósito válido!");
      return;
    }

    const novoSaldo = (user.saldo_final || 0) + deposit;

    // Cria novo registro de extrato
    const novoExtrato = {
      id: Date.now(),
      tipo: "credito",
      descricao: "Depósito realizado",
      valor: deposit,
      data: new Date().toISOString().split("T")[0],
    };

    const extratosAtualizados = [...(user.extratos || []), novoExtrato];

    try {
      setLoading(true);

      // Atualiza usuário no JSON Server
      const res = await fetch(`http://localhost:3001/users/${String(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saldo_final: novoSaldo,
          extratos: extratosAtualizados,
        }),
      });

      if (!res.ok) {
        alert("Erro ao atualizar saldo!");
        setLoading(false);
        return;
      }

      // Atualiza dados localmente
      const updatedUser = { ...user, saldo_final: novoSaldo, extratos: extratosAtualizados };
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setDepositValue("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 2000); // animação de sucesso por 2s
    } catch (error) {
      console.error("Erro ao realizar depósito:", error);
      alert("Erro de conexão com o servidor.");
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
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <h3 className="mb-4 text-center fw-bold">💰 Depósito</h3>

              {user ? (
                <>
                  {/* Saldo atual */}
                  <Card className="border-0 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <CardBody className="text-center">
                      <h6 className="text-secondary mb-1">Saldo Atual</h6>
                      <motion.h2
                        key={user.saldo_final}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="fw-bold text-success"
                      >
                        R$ {user.saldo_final?.toFixed(2).replace(".", ",") || "0,00"}
                      </motion.h2>
                    </CardBody>
                  </Card>

                  {/* Campo de depósito */}
                  <Label className="fw-bold">Valor do Depósito</Label>
                  <div className="d-flex align-items-center gap-3 mb-4">
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

                  {/* Botão de confirmação */}
                  <Button
                    color="success"
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-100 fw-bold py-2 rounded-pill"
                  >
                    {loading ? "Processando..." : "Confirmar Depósito"}
                  </Button>

                  {/* Feedback visual */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center mt-3 text-success fw-bold"
                    >
                      ✅ Depósito realizado com sucesso!
                    </motion.div>
                  )}

                  {/* Histórico de extratos */}
                  {user.extratos?.length > 0 && (
                    <div className="mt-5">
                      <h5 className="fw-bold mb-3">📜 Histórico de Depósitos</h5>
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
              ) : (
                <p className="text-center text-secondary">Carregando informações...</p>
              )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
