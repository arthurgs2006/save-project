import { useEffect, useState } from "react";
import { Container, Card, CardBody } from "reactstrap";
import { motion } from "framer-motion";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

export default function StudentBenefitsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white background-color min-vh-100">
        Carregando dados...
      </div>
    );
  }

  const cardAnimation = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-vh-100 text-white background-color py-4">
      <Container>
        <AccountHeader name={user.nome} />
        <TitleHeader title="Benefícios para Estudantes de Baixa Renda" />

        <motion.p
          className="text-secondary mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Diversos programas públicos e privados podem auxiliar estudantes de baixa renda
          a permanecerem na escola, se manterem financeiramente e conquistarem
          oportunidades acadêmicas. Confira alguns exemplos:
        </motion.p>

        <motion.h4
          className="fw-bold mt-4 mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-bank me-2"></i>
          Benefícios Governamentais
        </motion.h4>

        <motion.div
          className="d-flex flex-column gap-3"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-mortarboard-fill me-2 text-success"></i>
                  ProUni — Bolsas de Estudo
                </h5>
                <p className="text-secondary mb-0">
                  Oferece bolsas parciais ou integrais em instituições privadas de ensino
                  superior para estudantes de baixa renda com bom desempenho no ENEM.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-cash-stack me-2 text-warning"></i>
                  FIES — Financiamento Estudantil
                </h5>
                <p className="text-secondary mb-0">
                  Financiamento federal com juros reduzidos para estudantes de baixa renda,
                  com pagamento facilitado após a conclusão do curso.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-bus-front-fill me-2 text-info"></i>
                  Passe Livre Estudantil
                </h5>
                <p className="text-secondary mb-0">
                  Disponível em diversas cidades, garante gratuidade ou desconto no transporte
                  público para estudantes cadastrados.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-heart-fill me-2 text-danger"></i>
                  Auxílio Permanência
                </h5>
                <p className="text-secondary mb-0">
                  Universidades e Institutos Federais podem conceder auxílio financeiro mensal
                  para estudantes em vulnerabilidade social.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-house-fill me-2 text-primary"></i>
                  Benefícios do CadÚnico
                </h5>
                <p className="text-secondary mb-0">
                  O cadastro pode garantir acesso a programas sociais, tarifas reduzidas, 
                  prioridade habitacional, alimentação e direitos assistenciais.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        <motion.h4
          className="fw-bold mt-5 mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-credit-card-2-front me-2"></i>
          Programas de Crédito e Bancos
        </motion.h4>

        <motion.div
          className="d-flex flex-column gap-3"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-piggy-bank-fill me-2 text-success"></i>
                  Santander Universitário
                </h5>
                <p className="text-secondary mb-0">
                  Oferece crédito estudantil, bolsas e programas de apoio acadêmico
                  para estudantes de baixa renda.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-currency-dollar me-2 text-warning"></i>
                  Itaú Crédito Educacional
                </h5>
                <p className="text-secondary mb-0">
                  Linha de financiamento estudantil com pagamento facilitado durante
                  ou após o curso, dependendo da instituição conveniada.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={cardAnimation}>
            <Card className="bg-dark border-secondary">
              <CardBody>
                <h5 className="fw-bold">
                  <i className="bi bi-safe2-fill me-2 text-info"></i>
                  Caixa — Apoio ao Estudante
                </h5>
                <p className="text-secondary mb-0">
                  Oferece opções de crédito, apoio social e integração com programas
                  governamentais como o FIES.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        <motion.p
          className="text-secondary mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Dica: procure o setor de assistência estudantil da sua escola, IF ou universidade —
          eles podem orientar, inscrever e acompanhar você nesses programas.
        </motion.p>
      </Container>
    </div>
  );
}
