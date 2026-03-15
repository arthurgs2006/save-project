import { Container, Row, Col, Button } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardProfile from "../../components/graphic_components/CardProfile";
import { Link } from "react-router-dom";

export default function ProfilePage() {
    return (
        <div className="background-color text-white min-vh-100 py-4">
            <Container className="home-shell">

                <AccountHeader />

                <div className="home-main">

                    <TitleHeader title="Meu perfil" />

                    {/* Navegação */}

                    <section className="home-section">
                        <div className="d-flex gap-3 flex-wrap">
                            <Button outline color="light" className="rounded-pill px-4">
                                Receitas
                            </Button>

                            <Button outline color="light" className="rounded-pill px-4">
                                Despesas
                            </Button>

                            <Button outline color="light" className="rounded-pill px-4">
                                Extrato
                            </Button>
                        </div>
                    </section>

                    {/* Cards de resumo */}

                    <section className="home-section">
                        <Row className="g-3">

                            <Col md={4}>
                                <CardProfile
                                    revenues={4800}
                                    debts={2650}
                                    value={2150}
                                />
                            </Col>

                            <Col md={4}>
                                <CardProfile
                                    revenues={4800}
                                    debts={2650}
                                    value={2150}
                                />
                            </Col>

                            <Col md={4}>
                                <CardProfile
                                    revenues={4800}
                                    debts={2650}
                                    value={2150}
                                />
                            </Col>

                        </Row>
                    </section>

                    {/* Metas */}

                    <section className="home-section">

                        <div className="home-section-header">
                            <h5 className="home-section-title">Minhas Metas</h5>

                            <Link to="/goals" className="text-white-50 text-decoration-none">
                                Ver todas
                            </Link>
                        </div>

                        <div className="d-flex gap-3 overflow-auto pb-2">

                            <div className="home-graph-card p-3" style={{ minWidth: "220px" }}>
                                <h6 className="mb-1">Despesa 1</h6>
                                <small className="home-item-subtitle">1 ano</small>

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between">
                                        <small>R$1.002,30</small>
                                    </div>

                                    <ProgressBar percentage={45} />
                                </div>
                            </div>

                            <div className="home-graph-card p-3" style={{ minWidth: "220px" }}>
                                <h6 className="mb-1">Despesa 2</h6>
                                <small className="home-item-subtitle">2 anos</small>

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between">
                                        <small>R$3.200,00</small>
                                    </div>

                                    <ProgressBar percentage={75} />
                                </div>
                            </div>

                        </div>

                    </section>

                </div>
            </Container>
        </div>
    );
}