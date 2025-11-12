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

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null);
  const [withdrawValue, setWithdrawValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Carrega usuário logado
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function handleWithdraw() {
    if (!user) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    const valor = Number(withdrawValue);
    if (isNaN(valor) || valor <= 0) {
      alert("Digite um valor de saque válido!");
      return;
    }

    if (valor > user.saldo_final) {
      alert("Saldo insuficiente para realizar o saque!");
      return;
    }

    const novoSaldo = user.saldo_final - valor;

    const novoExtrato = {
      id: Date.now(),
      tipo: "debito",
      descricao: "Saque realizado",
      valor: valor,
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

      // Atualiza localmente
      const updatedUser = { ...user, saldo_final: novoSaldo, extratos: extratosAtualizados };
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setWithdrawValue("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao realizar saque:", error);
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
            >
              <h3 className="mb-4 text-center fw-bold">💸 Saque</h3>

              {user ? (
                <>
                  {/* Saldo atual */}
                  <Card className="border-0 mb-4" >
                    <CardBody className="text-center bg-transparent">
                      <h6 className="text-secondary mb-1">Saldo Atual</h6>
                      <motion.h2
                        key={user.saldo_final}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="fw-bold text-info"
                      >
                        R$ {user.saldo_final?.toFixed(2).replace(".", ",") || "0,00"}
                      </motion.h2>
                    </CardBody>
                  </Card>

                  {/* Campo de saque */}
                  <Label className="fw-bold">Valor do Saque</Label>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <span className="h4 mb-0">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={withdrawValue}
                      onChange={(e) => setWithdrawValue(e.target.value)}
                      placeholder="0,00"
                      className="custom-input-balance text-center fw-bold"
                      style={{ fontSize: "1.2rem" }}
                    />
                  </div>

                  {/* Botão de confirmação */}
                  <Button
                    color="danger"
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="w-100 fw-bold py-2 rounded-pill"
                  >
                    {loading ? "Processando..." : "Confirmar Saque"}
                  </Button>

                  {/* Feedback visual */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center mt-3 text-success fw-bold"
                    >
                      ✅ Saque realizado com sucesso!
                    </motion.div>
                  )}

                  {/* Histórico de débitos */}
                  {user.extratos?.length > 0 && (
                    <div className="mt-5">
                      <h5 className="fw-bold mb-3">📉 Histórico de Débitos</h5>
                      <ListGroup flush>
                        {[...user.extratos]
                          .filter((e) => e.tipo === "debito")
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
                              <span className="fw-bold text-danger">
                                - R$ {item.valor.toFixed(2).replace(".", ",")}
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
