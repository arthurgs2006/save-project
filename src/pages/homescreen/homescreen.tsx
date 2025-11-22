import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";

interface Extrato {
  id: number | string;
  data: string;
  valor: number;
  tipo: "credito" | "debito";
}

interface RecurringDebt {
  id: number | string;
  name: string;
  value: number;
  billingDate: string;
  frequency: string;
}

interface User {
  id: number | string;
  nome: string;
  saldo_final: number;
  extratos: Extrato[];
  recurringDebts: RecurringDebt[];
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`http://localhost:3001/users/${parsedUser.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          localStorage.setItem("loggedUser", JSON.stringify(data));
        }
      })
      .catch(() => console.warn("Servidor indisponível."));
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
        Carregando dados...
      </div>
    );
  }

  const freqMap: Record<string, string> = {
    monthly: "Mensal",
    weekly: "Semanal",
    yearly: "Anual",
  };

  const ultimosExtratos = [...(user.extratos || [])].reverse().slice(0, 4);
  const recurringDebts = user.recurringDebts || [];

  return (
    <div className="background-color text-white min-vh-100 d-flex flex-column">
      <Container className="py-4 flex-grow-1 d-flex flex-column">
        <AccountHeader name={user.nome} />

        <motion.main
          className="pt-4 flex-grow-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-center mb-5">
            <p className="text-secondary mb-1">Saldo bancário</p>
            <h1 className="fw-bold text-info">
              R$ {Number(user.saldo_final).toFixed(2).replace(".", ",")}
            </h1>
          </div>

          <GraphicCard user={user} />

          <nav className="d-flex justify-content-center gap-4 mt-5 flex-wrap">
            <Button
              color="link"
              className="text-white p-0 nav-btn-custom"
              onClick={() => navigate("/deposit")}
            >
              <div className="nav-icon-wrapper text-center">
                <i className="bi bi-arrow-down-circle fs-2"></i>
                <div className="nav-label mt-1 small">Depositar</div>
              </div>
            </Button>

            <Button
              color="link"
              className="text-white p-0 nav-btn-custom"
              onClick={() => navigate("/debts")}
            >
              <div className="nav-icon-wrapper text-center">
                <i className="bi bi-arrow-up-circle fs-2"></i>
                <div className="nav-label mt-1 small">Sacar</div>
              </div>
            </Button>

            <Button
              color="link"
              className="text-white p-0 nav-btn-custom"
              onClick={() => navigate("/goals")}
            >
              <div className="nav-icon-wrapper text-center">
                <i className="bi bi-bullseye fs-2"></i>
                <div className="nav-label mt-1 small">Metas</div>
              </div>
            </Button>

            <Button
              color="link"
              className="text-white p-0 nav-btn-custom"
              onClick={() => navigate("/registerDebt")}
            >
              <div className="nav-icon-wrapper text-center">
                <i className="bi bi-repeat fs-2"></i>
                <div className="nav-label mt-1 small">Recorrentes</div>
              </div>
            </Button>
          </nav>

          <section className="mt-5 text-start">
            <h5 className="mb-3">Últimas Movimentações</h5>

            {ultimosExtratos.length > 0 ? (
              <ListGroup flush>
                {ultimosExtratos.map((item) => (
                  <ListGroupItem
                    key={item.id}
                    className="d-flex justify-content-between align-items-center bg-dark text-white border-0 rounded mb-2 p-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/transaction/${item.id}`)}
                  >
                    <div>
                      <p className="mb-1 fw-bold">
                        {item.tipo === "credito" ? "Depósito" : "Débito"}
                      </p>
                      <small className="text-secondary">{item.data}</small>
                    </div>

                    <span
                      className={`fw-bold ${
                        item.tipo === "credito" ? "text-success" : "text-danger"
                      }`}
                    >
                      {item.tipo === "credito" ? "+" : "-"}R${" "}
                      {Number(item.valor).toFixed(2).replace(".", ",")}
                    </span>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <h1 className="text-secondary">Nenhuma movimentação recente.</h1>
            )}
          </section>

          <section id="benefits" className="mt-3">
            <ListGroupItem
              className="d-flex justify-content-between align-items-center bg-dark text-white border-0 rounded p-3 shadow-sm benefit-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/benefits")}
            >
              <div>
                <p className="mb-1 fw-bold">
                  <i className="bi bi-currency-dollar text-success"></i> Benefícios para Estudantes de Baixa Renda
                </p>
                <small className="text-secondary">
                  Descubra auxílios governamentais, bolsas e programas de crédito estudantil
                </small>
              </div>

              <i className="bi bi-chevron-right text-secondary fs-5"></i>
            </ListGroupItem>
          </section>

          <section className="mt-4 text-start">
            <h5 className="mb-3">Débitos Recorrentes</h5>

            {recurringDebts.length > 0 ? (
              <ListGroup flush>
                {recurringDebts.map((debt) => (
                  <ListGroupItem
                    key={debt.id}
                    className="d-flex justify-content-between align-items-center bg-dark text-white border-0 rounded mb-2 p-3"
                  >
                    <div>
                      <p className="mb-1 fw-bold">{debt.name}</p>
                      <small className="text-secondary">
                        Todo dia {debt.billingDate} — {freqMap[debt.frequency] || debt.frequency}
                      </small>
                    </div>

                    <span className="fw-bold text-danger">
                      -R$ {Number(debt.value).toFixed(2).replace(".", ",")}
                    </span>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p className="text-secondary">Nenhum débito recorrente cadastrado.</p>
            )}
          </section>
        </motion.main>
      </Container>
    </div>
  );
}
