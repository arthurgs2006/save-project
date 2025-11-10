import { useState } from "react";
import CardButton from "./cardButton"; // ✅ agora usando o novo componente
import { Container, Row, Col } from "reactstrap";

export default function CreditProfile() {
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const categorias = [
    { id: 1, nome: "Alimentação", icon: "bi-basket-fill" },
    { id: 2, nome: "Transporte", icon: "bi-car-front-fill" },
    { id: 3, nome: "Saúde", icon: "bi-heart-pulse-fill" },
    { id: 4, nome: "Educação", icon: "bi-mortarboard-fill" },
    { id: 5, nome: "Lazer", icon: "bi-controller" },
    { id: 6, nome: "Moradia", icon: "bi-house-door-fill" },
    { id: 7, nome: "Compras", icon: "bi-bag-fill" },
    { id: 8, nome: "Contas", icon: "bi-credit-card-2-front-fill" },
    { id: 9, nome: "Outros", icon: "bi-three-dots" },
  ];

  function toggle(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <Container className="d-flex flex-column gap-5 justify-content-center">

      <main>
        <Row className="g-3 mt-3">
          {categorias.map((cat) => {
            const ativo = selecionados.includes(cat.id);

            return (
              <Col xs="4" key={cat.id}>
                <CardButton
                  active={ativo}
                  onClick={() => toggle(cat.id)}
                >
                  <i
                    className={`${cat.icon} fs-3`}
                    style={{
                      color: ativo ? "#3A5BFF" : "white",
                      transition: "0.2s",
                    }}
                  />
                </CardButton>
              </Col>
            );
          })}
        </Row>
      </main>

    </Container>
  );
}
