
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

type ExtraAction = { to: string; icon: string };
interface HeaderProps {
  title?: string;
  backLink?: string;
  extraActions?: ExtraAction[];
}

export default function ({ title = "Título da Página", backLink = "/", extraActions = [] }: HeaderProps) {
  return (
    <header className=" py-2 mb-3">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="2" className="text-start">
            <Link to={backLink} className="text-dark text-decoration-none">
              <i className="bi bi-arrow-left fs-4 text-white"></i>
            </Link>
          </Col>

          {/* Título Central */}
          <Col xs="8" className="text-center">
            <h5 className="m-0 fw-semibold">{title}</h5>
          </Col>

          {/* Ações Extras (ícones à direita) */}
          <Col xs="2" className="text-end  d-flex justify-content-end align-items-center gap-2">
            {extraActions.map((action, index) => (
              <Link key={index} to={action.to} className="text-dark text-decoration-none">
                <i className={`bi ${action.icon} fs-5 text-white`}></i>
              </Link>
            ))}
          </Col>
        </Row>
      </Container>
    </header>
  );
}
