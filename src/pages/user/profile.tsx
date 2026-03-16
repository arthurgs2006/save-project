import { Container, Row, Col, Button } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardProfile from "../../components/graphic_components/CardProfile";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProfilePage() {
    return (
        <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <AccountHeader />

                <motion.div
                    className="home-main"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader title="Meu perfil" />

                    <section className="home-section">
                        <div className="d-flex gap-2 flex-wrap">
                            <Button
                                color="link"
                                className="home-action-btn"
                                style={{
                                    minHeight: "56px",
                                    padding: "0.55rem 1rem !important",
                                    flex: "unset",
                                }}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-down-left"></i>
                                </div>
                                <span className="home-action-label">Receitas</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                style={{
                                    minHeight: "56px",
                                    padding: "0.55rem 1rem !important",
                                    flex: "unset",
                                }}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-up-right"></i>
                                </div>
                                <span className="home-action-label">Despesas</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                style={{
                                    minHeight: "56px",
                                    padding: "0.55rem 1rem !important",
                                    flex: "unset",
                                }}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <span className="home-action-label">Extrato</span>
                            </Button>
                        </div>
                    </section>

                    <section className="home-section">
                        <Row className="g-3">
                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <CardProfile
                                        revenues={4800}
                                        debts={2650}
                                        value={2150}
                                    />
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <CardProfile
                                        revenues={4800}
                                        debts={2650}
                                        value={2150}
                                    />
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <CardProfile
                                        revenues={4800}
                                        debts={2650}
                                        value={2150}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h5 className="home-section-title">Minhas Metas</h5>

                            <Link
                                to="/goals"
                                className="text-decoration-none"
                                style={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: "0.92rem",
                                    fontWeight: 500,
                                }}
                            >
                                Ver todas
                            </Link>
                        </div>

                        <div className="d-flex gap-3 overflow-auto pb-2">
                            <div
                                className="home-graph-card"
                                style={{ minWidth: "240px", padding: "1rem" }}
                            >
                                <h6 className="mb-1 text-white fw-semibold">Despesa 1</h6>
                                <small className="home-item-subtitle">1 ano</small>

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <small className="home-item-subtitle">R$ 1.002,30</small>
                                        <small className="home-item-subtitle">45%</small>
                                    </div>

                                    <ProgressBar percentage={45} />
                                </div>
                            </div>

                            <div
                                className="home-graph-card"
                                style={{ minWidth: "240px", padding: "1rem" }}
                            >
                                <h6 className="mb-1 text-white fw-semibold">Despesa 2</h6>
                                <small className="home-item-subtitle">2 anos</small>

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <small className="home-item-subtitle">R$ 3.200,00</small>
                                        <small className="home-item-subtitle">75%</small>
                                    </div>

                                    <ProgressBar percentage={75} />
                                </div>
                            </div>
                        </div>
                    </section>
                </motion.div>
            </Container>
        </main>
    );
}