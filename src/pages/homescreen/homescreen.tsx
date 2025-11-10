import {
  Container,
  Card,
  CardBody,
  CardText,
  Button,
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import TitleBankBalance from '../../components/balance_components/title_bankBalance';
import AccountHeader from '../../components/generic_components/accountHeader';
import GraphicCard from '../../components/graphic_components/graphicCard';

function App() {

  // ✅ CORRIGIR: ID inválido → substituído por "1"
  const userSelected = {
    userId: "1",  
    name: "Beta User One",
    token: "token-beta-1"
  };

  return (
    <div className="vh-100 text-white background-color pb-5">
      <Container>

        <AccountHeader />

        <main className='pt-5'>
          <Container className="text-center">

            {/* Saldo principal */}
            <div>
              <p className="text-secondary mb-1">Saldo bancário</p>

              {/* ✅ NÃO envolva TitleBankBalance em <h1> */}
              <h1 className="fw-bold">
                <span>
                  <TitleBankBalance
                    baseUrl="http://localhost:3001"
                    token={userSelected.token}
                    userId={userSelected.userId}
                  />
                </span>
              </h1>
            </div>

            <GraphicCard />

            {/* Navbar */}
            <nav className="custom-navbar d-flex justify-content-center gap-4 mt-4">
              <div className="nav-item-custom text-center">
                <Button color="link" className="text-white p-0 nav-btn-custom">
                  <div className="nav-icon-wrapper">
                    <i className="bi bi-arrow-down-circle fs-3"></i>
                  </div>
                  <small className="nav-label">Depositar</small>
                </Button>
              </div>

              <div className="nav-item-custom text-center">
                <Button color="link" className="text-white p-0 nav-btn-custom">
                  <div className="nav-icon-wrapper nav-icon-active">
                    <i className="bi bi-bar-chart fs-3"></i>
                  </div>
                  <small className="nav-label">Relatórios</small>
                </Button>
              </div>

              <div className="nav-item-custom text-center">
                <Button color="link" className="text-white p-0 nav-btn-custom">
                  <div className="nav-icon-wrapper">
                    <i className="bi bi-arrow-up-circle fs-3"></i>
                  </div>
                  <small className="nav-label">Sacar</small>
                </Button>
              </div>
            </nav>

            {/* Próximas despesas */}
            <section className="mt-5 text-start">
              <h5 className="mb-3">Próximas Despesas</h5>

              <Card className="bg-dark border-0 text-white">
                <CardBody className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="mb-0 text-secondary">Saldo</p>

                    {/* ✅ NÃO envolver em h4 → aplicar estilo fora */}
                    <h4 className="fw-bold mb-0">
                      <span>
                        <TitleBankBalance
                          baseUrl="http://localhost:3001"
                          token={userSelected.token}
                          userId={userSelected.userId}
                        />
                      </span>
                    </h4>
                  </div>

                  <div className="text-end">
                    <p className="mb-0 text-secondary">Despesa</p>
                    <h4 className="text-danger fw-bold mb-0">R$700</h4>
                  </div>

                </CardBody>

                <CardText className="px-3 pb-3 text-secondary small">
                  Out 12, 10:00 AM
                </CardText>
              </Card>
            </section>

            {/* Notificações */}
            <section className="mt-5 text-start">
              <h5 className="mb-3">Notificações</h5>

              <Card className="bg-dark border-0 text-white">
                <CardBody className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">

                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25 me-3"
                      style={{ width: '45px', height: '45px' }}
                    >
                      <i className="bi bi-cash-stack fs-4 text-success"></i>
                    </div>

                    <div>
                      <h6 className="mb-0">Auxílio Estudantil</h6>
                      <small className="text-secondary">Out 9, 11:43 AM</small>
                    </div>

                  </div>

                  <div className="text-end">
                    <h6 className="text-success mb-0">+R$600</h6>
                    <small className="text-secondary">Concluído</small>
                  </div>

                </CardBody>
              </Card>
            </section>

          </Container>
        </main>

      </Container>
    </div>
  );
}

export default App;
