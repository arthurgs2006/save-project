import { Container, Row, Col, Card, CardBody, Progress } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import GoalSection from "../../components/graphic_components/goal_section";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardDeposit from '../../components/graphic_components/card.tsx';

export default function () {
  return (
    <div className="edit-goal-page min-vh-100 text-white">
      <Container>
        <AccountHeader />
        <TitleHeader title="Editar Meta" />
        <main className="mt-4">
          <GoalSection />
          <ProgressBar percentage={45} />
          <section className="mt-4">
            <h6 className="mb-3">Depósitos</h6>
            <CardDeposit time="13:54" type="Depósito Recebido" value="R$7090,00"/>
            <CardDeposit time="17:34" type="Depósito Recebido" value="R$7090,00"/>
            <CardDeposit time="11:24" type="Depósito Recebido" value="R$5984,00" />
          </section>
        </main>
      </Container>
    </div>
  );
}
