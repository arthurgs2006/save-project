import { Container } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardProfile from "../../components/graphic_components/CardProfile";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  return (
    <>
      <div className=" text-white background-color pb-5">

        <Container>
          <AccountHeader />
          <TitleHeader title="Meu perfil" />

          <nav className="d-flex gap-3 mt-3 mb-4">
            <button className="btn btn-outline-light rounded-pill px-4 py-1">
              Receitas
            </button>
            <button className="btn btn-outline-light rounded-pill px-4 py-1">
              Despesas
            </button>
            <button className="btn btn-outline-light rounded-pill px-4 py-1">
              Extrato
            </button>
          </nav>

            <CardProfile
            revenues={4800}
            debts={2650}
            value={2150}
          />

            <CardProfile
            revenues={4800}
            debts={2650}
            value={2150}
          />

          <CardProfile
            revenues={4800}
            debts={2650}
            value={2150}
          />

          <section className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Minhas Metas</h5>
              <Link to="/goals" className="text-decoration-none text-white-50">
                Ver todas
              </Link>
            </div>

            <div className="d-flex gap-3 overflow-auto pb-2">

              <div className="bg-dark rounded-4 p-3" style={{ width: "220px" }}>
                <h6 className="mb-1">Despesa 1</h6>
                <small className="text-white-50">1 ano</small>

                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    <small>R$1.002,30</small>
                  </div>
                  <ProgressBar percentage={45} />
                </div>
              </div>

              <div className="bg-dark rounded-4 p-3" style={{ width: "220px" }}>
                <h6 className="mb-1">Despesa 2</h6>
                <small className="text-white-50">2 anos</small>

                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    <small>R$3.200,00</small>
                  </div>
                  <ProgressBar percentage={75} />
                </div>
              </div>

            </div>
          </section>
        </Container>
      </div>
    </>
  );
}