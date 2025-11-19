import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

type ExtraAction = { to: string; icon: string };

interface HeaderProps {
  title?: string;
  backLink?: string;
  extraActions?: ExtraAction[];
  showCreateButton?: boolean;
}

export default function Header({
  title = "Título da Página",
  backLink = "/homescreen",
  extraActions = [],
  showCreateButton = false,
}: HeaderProps) {


  const finalActions: ExtraAction[] = [
    ...extraActions,
    ...(showCreateButton ? [{ to: "/goals/create", icon: "bi-plus-lg" }] : [])
  ];

  return (
    <header className="py-2 mb-3">
      <Container fluid>
        <Row className="align-items-center">

       
          <Col xs="2" className="text-start">
            <Link to={backLink} className="text-dark text-decoration-none">
              <i className="bi bi-arrow-left fs-4 text-white"></i>
            </Link>
          </Col>

  
          <Col xs="8" className="text-center">
            <h5 className="m-0 fw-semibold">{title}</h5>
          </Col>

    
          <Col
            xs="2"
            className="text-end d-flex justify-content-end align-items-center gap-2"
          >
            {finalActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="text-dark text-decoration-none"
              >
                <i className={`bi ${action.icon} fs-5 text-white`}></i>
              </Link>
            ))}
          </Col>
        </Row>
      </Container>
    </header>
  );
}