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
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

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

    let metasAtualizadas = [...user.goals];
    let extratosAtualizados = [...(user.extratos || [])];

    // -----------------------------
    // 🟦 CASO 1: DÉBITO SEM META
    // -----------------------------
    if (!selectedGoal) {
      if (valor > user.saldo_final) {
        alert("Saldo geral insuficiente!");
        return;
      }

      const novoSaldo = user.saldo_final - valor;

      extratosAtualizados.push({
        id: Date.now(),
        tipo: "debito",
        descricao: "Débito do saldo geral",
        valor: valor,
        data: new Date().toISOString().split("T")[0],
      });

      return await atualizarUsuario({
        ...user,
        saldo_final: novoSaldo,
        extratos: extratosAtualizados,
        goals: metasAtualizadas,
      });
    }

    // -----------------------------
    // 🟩 CASO 2: DÉBITO EM META
    // -----------------------------
    const goal = user.goals.find((g: any) => g.id === selectedGoal);

    if (!goal) {
      alert("Meta não encontrada.");
      return;
    }

    let totalDeposits =
      goal.deposits?.reduce((acc: number, d: any) => acc + d.value, 0) || 0;

    if (valor > totalDeposits) {
      alert("Valor maior que o saldo disponível na meta!");
      return;
    }

    const novoValorMeta = totalDeposits - valor;

    let novosDepositos =
      novoValorMeta > 0
        ? [{ id: Date.now(), value: novoValorMeta }]
        : [];

    if (novoValorMeta <= 0) {
      // remove meta
      metasAtualizadas = metasAtualizadas.filter(
        (g: any) => g.id !== selectedGoal
      );
    } else {
      metasAtualizadas = metasAtualizadas.map((g: any) =>
        g.id === selectedGoal ? { ...g, deposits: novosDepositos } : g
      );
    }

    extratosAtualizados.push({
      id: Date.now(),
      tipo: "debito",
      descricao: `Débito da meta: ${goal.name}`,
      valor: valor,
      data: new Date().toISOString().split("T")[0],
    });

    return await atualizarUsuario({
      ...user,
      goals: metasAtualizadas,
      extratos: extratosAtualizados,
    });
  }

  // Função que salva no backend e localStorage
  async function atualizarUsuario(updatedUser: any) {
    try {
      setLoading(true);

      const res = await fetch(`http://localhost:3001/users/${updatedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) {
        alert("Erro ao atualizar usuário!");
        setLoading(false);
        return;
      }

      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setWithdrawValue("");
      setSelectedGoal(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
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
              <h3 className="mb-4 text-center fw-bold">💸 Realizar Débito</h3>

              {user ? (
                <>
                  {/* Seleção de meta OPCIONAL */}
                  <Label className="fw-bold mb-2">Meta (opcional)</Label>
                  <Input
                    type="select"
                    className="mb-4 fw-bold"
                    value={selectedGoal ?? ""}
                    onChange={(e) =>
                      setSelectedGoal(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <option value="">Nenhuma meta (usar saldo geral)</option>

                    {user.goals?.length > 0 &&
                      user.goals.map((g: any) => {
                        const total = g.deposits?.reduce(
                          (acc: number, d: any) => acc + d.value,
                          0
                        );
                        return (
                          <option key={g.id} value={g.id}>
                            {g.name} — R$ {total.toFixed(2).replace(".", ",")}
                          </option>
                        );
                      })}
                  </Input>

                  {/* Valor */}
                  <Label className="fw-bold">Valor do débito</Label>
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

                  {/* Botão */}
                  <Button
                    color="danger"
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="w-100 fw-bold py-2 rounded-pill"
                  >
                    {loading ? "Processando..." : "Confirmar Débito"}
                  </Button>

                  {/* Sucesso */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center mt-3 text-success fw-bold"
                    >
                      ✅ Débito realizado com sucesso!
                    </motion.div>
                  )}

                  {/* Histórico */}
                  {user.extratos?.length > 0 && (
                    <div className="mt-5">
                      <h5 className="fw-bold mb-3">📉 Últimos débitos</h5>
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
                                - R$ {item.valor
                                  .toFixed(2)
                                  .replace(".", ",")}
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
