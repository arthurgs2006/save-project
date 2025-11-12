import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardBody,
  CardText,
  Button,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
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
    } else {
      window.location.href = "/login";
    }
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
        Carregando dados...
      </div>
    );
  }

  const ultimosExtratos = [...(user.extratos || [])]
    .reverse()
    .slice(0, 4);

  return (
    <div className="background-color text-white min-vh-100 d-flex flex-column">
      <Container className="py-4 flex-grow-1 d-flex flex-column">
        <AccountHeader name={user.nome} />

        <main className="pt-4 flex-grow-1">
          <div className="text-center mb-5">
            <p className="text-secondary mb-1">Saldo bancário</p>
            <h1 className="fw-bold text-info">
              R$ {Number(user.saldo_final).toFixed(2).replace(".", ",")}
            </h1>
          </div>

          <GraphicCard />

          <nav className="d-flex justify-content-center gap-5 mt-5">
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
          </nav>

          <section className="mt-5 text-start">
            <h5 className="mb-3">Últimas Movimentações</h5>

            {ultimosExtratos.length > 0 ? (
              <ListGroup flush>
                {ultimosExtratos.map((item) => (
                  <ListGroupItem
                    key={item.id}
                    className="d-flex justify-content-between align-items-center bg-dark text-white border-0 rounded mb-2 p-3"
                  >
                    <div>
                      <p className="mb-1 fw-bold">
                        {item.tipo === "credito" ? "Depósito" : "Débito"}
                      </p>
                      <small className="text-secondary">{item.data}</small>
                    </div>
                    <span
                      className={`fw-bold ${
                        item.tipo === "credito"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {item.tipo === "credito" ? "+" : "-"}R${" "}
                      {item.valor.toFixed(2).replace(".", ",")}
                    </span>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p className="text-secondary">Nenhuma movimentação recente.</p>
            )}
          </section>

          <section className="mt-5 text-start flex-grow-1">
            <h5 className="mb-3">Próximas Despesas</h5>
            <Card className="bg-dark border-0 text-white rounded">
              <CardBody className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-secondary">Saldo Atual</p>
                  <h4 className="fw-bold mb-0">
                    R$ {Number(user.saldo_final).toFixed(2).replace(".", ",")}
                  </h4>
                </div>

                <div className="text-end">
                  <p className="mb-0 text-secondary">Despesa Prevista</p>
                  <h4 className="text-danger fw-bold mb-0">R$700</h4>
                </div>
              </CardBody>
              <CardText className="px-3 pb-3 text-secondary small">
                Out 12, 10:00 AM
              </CardText>
            </Card>
          </section>
        </main>
      </Container>
    </div>
  );
}
