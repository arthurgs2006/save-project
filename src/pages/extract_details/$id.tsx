import { Container, Row, Col, Card, Button } from "reactstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function ReceitasPage() {
  return (
    <div className="min-vh-100 text-white" style={{ backgroundColor: "#0d1117" }}>
      <Container className="py-3">
        {/* Cabeçalhos */}
        <AccountHeader />
        <TitleHeader title="Item 1" />

        {/* Card principal */}
        <Card
          className="text-center mt-4 mx-auto p-4 border-0"
          style={{
            backgroundColor: "#111827",
            borderRadius: "20px",
            maxWidth: "350px",
          }}
        >
          <h6 className="text-secondary mb-1">Nome do Emprego LTDA</h6>
          <small className="text-muted">0x5747X63...45533</small>
          <h3 className="fw-bold mt-3 text-white">Renda</h3>

          {/* Ações */}
          <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
            <Button
              color="link"
              className="text-white rounded-circle"
              style={{
                backgroundColor: "#1a1f2b",
                border: "1px solid #2a2f3a",
              }}
            >
              <i className="bi bi-arrow-down-circle fs-4"></i>
            </Button>
            <div className="d-flex flex-column align-items-center">
              <Button
                color="link"
                className="text-white rounded-circle"
                style={{
                  backgroundColor: "#1a1f2b",
                  border: "1px solid #2a2f3a",
                }}
              >
                <i className="bi bi-clipboard fs-4"></i>
              </Button>
             
            </div>
          </div>
        </Card>
        <Row className="mt-5 g-3 text-start mx-3" >
          <Col xs="6">
            <h6 className="text-secondary">Status</h6>
            <span className="text-success fw-semibold">Concluído</span>
          </Col>
          <Col xs="6">
            <h6 className="text-secondary">Data</h6>
            <span>Out 6, 2025</span>
          </Col>
          <Col xs="6">
            <h6 className="text-secondary">Valor</h6>
            <span>R$ 1.500,00</span>
          </Col>
          <Col xs="6">
            <h6 className="text-secondary">Descrição</h6>
            <span>Exemplo</span>
          </Col>
          <Col xs="6">
            <h6 className="text-secondary">Endereço</h6>
            <span>0x5747X63</span>
          </Col>
          <Col xs="6">
            <h6 className="text-secondary">Nome Endereço</h6>
            <span>Emprego LTDA</span>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
