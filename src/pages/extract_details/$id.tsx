import { Container, Row, Col, Card, Button } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useEffect, useState } from "react";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function ReceitasPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`https://database-save-app.onrender.com/users/${parsedUser.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          localStorage.setItem("loggedUser", JSON.stringify(data));

          const t = data.extratos?.find(
            (item: any) => String(item.id) === String(id)
          );

          setTransaction(t || null);
        }
      })
      .catch(() => console.warn("Servidor indisponível."));
  }, [id]);

  if (!user) {
    return (
      <div
        className="min-vh-100 text-white d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "#0d1117" }}
      >
        Carregando...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div
        className="min-vh-100 text-white d-flex flex-column justify-content-center align-items-center"
        style={{ backgroundColor: "#0d1117" }}
      >
        <h5 className="mb-3 text-secondary">Transação não encontrada</h5>
        <Button color="secondary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  const tipoLabel = transaction.tipo === "credito" ? "Depósito" : "Saque";
  const valorFormatado = `R$ ${Number(transaction.valor)
    .toFixed(2)
    .replace(".", ",")}`;

  return (
    <div className="min-vh-100 text-white" style={{ backgroundColor: "#0d1117" }}>
      <Container className="py-3">

        <AccountHeader name={user.nome} />

        <TitleHeader title={tipoLabel} />

        <Card
          className="text-center mt-4 mx-auto p-4 border-0"
          style={{
            backgroundColor: "#111827",
            borderRadius: "20px",
            maxWidth: "350px",
          }}
        >
          <h6 className="text-secondary mb-1">
            {transaction.descricao || "Movimentação bancária"}
          </h6>

          <small className="text-muted">ID: {transaction.id}</small>

          <h2
            className={`fw-bold mt-3 ${
              transaction.tipo === "credito" ? "text-success" : "text-danger"
            }`}
          >
            {valorFormatado}
          </h2>

          <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
            <Button
              color="link"
              className="text-white rounded-circle"
              style={{
                backgroundColor: "#1a1f2b",
                border: "1px solid #2a2f3a",
              }}
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              <i className="bi bi-clipboard fs-4"></i>
            </Button>
          </div>
        </Card>

        <Row className="mt-5 g-3 text-start mx-3">
          <Col xs="6">
            <h6 className="text-secondary">Status</h6>
            <span className="text-success fw-semibold">Concluído</span>
          </Col>

          <Col xs="6">
            <h6 className="text-secondary">Data</h6>
            <span>{transaction.data}</span>
          </Col>

          <Col xs="6">
            <h6 className="text-secondary">Valor</h6>
            <span>{valorFormatado}</span>
          </Col>

          <Col xs="6">
            <h6 className="text-secondary">Descrição</h6>
            <span>{transaction.descricao || "Sem descrição"}</span>
          </Col>

          <Col xs="6">
            <h6 className="text-secondary">Origem/Destino</h6>
            <span>{transaction.endereco || "---"}</span>
          </Col>

          <Col xs="6">
            <h6 className="text-secondary">Tipo</h6>
            <span>{tipoLabel}</span>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
