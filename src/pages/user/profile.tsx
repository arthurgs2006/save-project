import { Container, Row, Col, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import ProgressBar from "../../components/graphic_components/progress_bar";
import CardProfile from "../../components/graphic_components/CardProfile";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface User {
    id: number | string;
    nome: string;
    saldo_final: number;
    extratos: Array<{
        id: number | string;
        data: string;
        valor: number;
        tipo: "credito" | "debito";
    }>;
    recurringDebts?: Array<{
        id: number | string;
        name: string;
        value: number;
    }>;
    recurringCredits?: Array<{
        id: number | string;
        name: string;
        value: number;
    }>;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("loggedUser");
        navigate("/login");
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                localStorage.removeItem("loggedUser");
                setAlert({ isOpen: true, message: "Conta excluída com sucesso.", type: "success" });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setAlert({ isOpen: true, message: "Erro ao excluir conta. Tente novamente.", type: "danger" });
            }
        } catch (error) {
            setAlert({ isOpen: true, message: "Erro de conexão. Tente novamente.", type: "danger" });
        }
        setDeleteModal(false);
    };

    const totalRevenues = user?.extratos?.filter(e => e.tipo === "credito").reduce((sum, e) => sum + Number(e.valor), 0) || 0;
    const totalDebts = user?.extratos?.filter(e => e.tipo === "debito").reduce((sum, e) => sum + Number(e.valor), 0) || 0;
    const balance = (user?.saldo_final || 0);

    if (!user) {
        return (
            <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
                <div className="home-bg-orb home-bg-orb-1"></div>
                <div className="home-bg-orb home-bg-orb-2"></div>
                <div className="home-bg-orb home-bg-orb-3"></div>
                <Container className="home-shell d-flex justify-content-center align-items-center">
                    <div>Carregando perfil...</div>
                </Container>
            </main>
        );
    }
    return (
        <main className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <AccountHeader name={user.nome} />

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
                                onClick={() => navigate("/deposit")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-down-left"></i>
                                </div>
                                <span className="home-action-label">Depositar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/debts")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-up-right"></i>
                                </div>
                                <span className="home-action-label">Sacar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/transaction-history")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <span className="home-action-label">Histórico</span>
                            </Button>
                        </div>
                    </section>

                    <section className="home-section">
                        <Row className="g-3">
                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <CardProfile
                                        revenues={totalRevenues}
                                        debts={totalDebts}
                                        value={balance}
                                    />
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <h6 className="home-section-title mb-3">Resumo</h6>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex justify-content-between">
                                            <small className="home-item-subtitle">Total de Movimentações</small>
                                            <small className="home-item-subtitle text-white">{user.extratos?.length || 0}</small>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <small className="home-item-subtitle">Débitos Recorrentes</small>
                                            <small className="home-item-subtitle text-white">{user.recurringDebts?.length || 0}</small>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <small className="home-item-subtitle">Créditos Recorrentes</small>
                                            <small className="home-item-subtitle text-white">{user.recurringCredits?.length || 0}</small>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="home-graph-card h-100 p-3">
                                    <h6 className="home-section-title mb-3">Ações da Conta</h6>
                                    <div className="d-flex flex-column gap-2">
                                        <Button
                                            color="link"
                                            className="home-action-btn home-action-btn-primary w-100"
                                            onClick={handleLogout}
                                        >
                                            Sair da Conta
                                        </Button>
                                        <Button
                                            color="link"
                                            className="home-action-btn w-100"
                                            onClick={() => setDeleteModal(true)}
                                        >
                                            Excluir Conta
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </section>

                    {alert && (
                        <Alert color={alert.type} isOpen={alert.isOpen} toggle={() => setAlert(null)}>
                            {alert.message}
                        </Alert>
                    )}

                    <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
                        <ModalHeader toggle={() => setDeleteModal(false)}>Confirmar Exclusão</ModalHeader>
                        <ModalBody>
                            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={() => setDeleteModal(false)}>
                                Cancelar
                            </Button>
                            <Button color="danger" onClick={handleDeleteAccount}>
                                Excluir Conta
                            </Button>
                        </ModalFooter>
                    </Modal>
                </motion.div>
            </Container>
        </main>
    );
}