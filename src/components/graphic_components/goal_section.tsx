import { Card, CardBody, Col, Row } from "reactstrap";

interface GoalSectionProps {
  name: string;
  image: string; 
  targetValue: number;
  currentValue: number;
}

export default function GoalSection({
  name,
  image, 
  targetValue,
  currentValue
}: GoalSectionProps) {

  const formattedTarget = targetValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  const formattedCurrent = currentValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  const remaining = (targetValue - currentValue) > 0 ?
    targetValue - currentValue : 0;

  const formattedRemaining = remaining.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  return (
    <Card className="goal-card border-0 shadow-sm p-2">
      <CardBody>

        <Row>
      
          <Col xs="3" className="d-flex align-items-center justify-content-center">
            <div
              style={{ 
                width: "60px", 
                height: "60px", 
                borderRadius: "12px", 
                backgroundColor: "#3A5BFF", 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <i className={`bi ${image} fs-3 text-white`}></i> 
            </div>
          </Col>

          <Col>
            <p className="goal-type mb-0 text-secondary">Meta</p>
            <h6 className="goal-title mb-1 text-white">{name}</h6>

            <p className="goal-date mb-0 text-secondary" style={{ fontSize: "0.85rem" }}>
              Faltam R$ {formattedRemaining}
            </p>
          </Col>
        </Row>

        <h6 className="goal-value mt-3 mb-0">
          Valor total: R$ {formattedTarget}
        </h6>

        <p className="text-secondary mb-0" style={{ fontSize: "0.85rem" }}>
          Já depositado: R$ {formattedCurrent}
        </p>
      </CardBody>
    </Card>
  );
}