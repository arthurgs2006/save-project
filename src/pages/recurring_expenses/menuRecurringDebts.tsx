import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
} from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function RecurringDebtsMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const freqMap: any = {
    monthly: "Mensal",
    weekly: "Semanal",
    yearly: "Anual",
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    fetch(`https://database-save-app.onrender.com/users/${parsed.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          localStorage.setItem("loggedUser", JSON.stringify(data));
        }
      })
      .catch(() => console.warn("Servidor indisponível."));
  }, []);

  async function removerDebito(id: number) {
    if (!user) return;
    const confirmar = window.confirm("Tem certeza que deseja cancelar este débito?");
    if (!confirmar) return;
    setLoading(true);
    const novosDebitos = (user.recurringDebts || []).filter((d: any) => d.id !== id);
    const updated = { ...user, recurringDebts: novosDebitos };
    try {
      await fetch(`https://database-save-app.onrender.com/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      localStorage.setItem("loggedUser", JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      alert("Erro ao excluir débito.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
        Carregando...
      </div>
    );
  }

  return (
    <div className="background-color text-white min-vh-100">
      <Container className="py-4">
        <AccountHeader name={user.nome} />
        <TitleHeader title="Débitos Recorrentes" />
        <div className="text-end mb-3">
          <Button
            color="primary"
            className="rounded-pill d-flex align-items-center gap-2 px-3"
            onClick={() => navigate("/registerDebt/newRecurringDebt")}
          >
            <i className="bi bi-plus-circle"></i>
            Novo Débito
          </Button>
        </div>
        {user.recurringDebts && user.recurringDebts.length > 0 ? (
          <ListGroup flush>
            {user.recurringDebts.map((debt: any) => (
              <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ListGroupItem className="bg-dark text-white border-0 rounded p-3 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1">{debt.name}</h6>
                    <small className="text-secondary">R$ {Number(debt.value).toFixed(2).replace(".", ",")}</small>
                    <br />
                    <small className="text-secondary">{freqMap[debt.frequency]} — dia {debt.billingDate}</small>
                  </div>
                  <Button color="danger" size="sm" className="rounded-circle" onClick={() => removerDebito(debt.id)} disabled={loading}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </ListGroupItem>
              </motion.div>
            ))}
          </ListGroup>
        ) : (
          <h5 className="text-center text-secondary mt-4">Nenhum débito recorrente encontrado.</h5>
        )}
      </Container>
    </div>
  );
}
