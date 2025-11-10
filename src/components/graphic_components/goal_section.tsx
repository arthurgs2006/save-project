import { Card, CardBody, Col, Row } from "reactstrap";

export default function () {  
    return (
        <>
            <Card className="goal-card border-0">
                <CardBody>
                <Row>
                    <Col xs="2" className="d-flex align-items-center justify-content-center">
                    <div className="goal-indicator"></div>
                    </Col>
                    <Col>
                    <p className="goal-type mb-0">Apartamento</p>
                    <h6 className="goal-title mb-1">Quitar apartamento</h6>
                    <p className="goal-date mb-0">Nov 2026</p>
                    </Col>
                </Row>
                <h6 className="goal-value mt-3 mb-0">R$6.000,00</h6>
                </CardBody>
            </Card>
        </>
    )
  }