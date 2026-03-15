import { useEffect, useState } from "react";
import { Container, Card, CardBody } from "reactstrap";
import { motion } from "framer-motion";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

interface User {
    id: number | string;
    nome: string;
}

export default function StudentBenefitsPage() {
    const [user, setUser] = useState<User | null>(null);

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
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando dados...</div>
            </div>
        );
    }

    const cardAnimation = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={user.nome} />

                <motion.main
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader title="Benefícios para Estudantes de Baixa Renda" />

                    <motion.div
                        className="home-empty-state mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.75)",
                            lineHeight: 1.7,
                        }}
                    >
                        Diversos programas públicos e privados podem auxiliar estudantes de
                        baixa renda a permanecerem na escola, se manterem financeiramente e
                        conquistarem oportunidades acadêmicas. Confira alguns exemplos:
                    </motion.div>

                    <section className="home-section mt-4">
                        <div className="home-section-header">
                            <h5 className="home-section-title">
                                <i className="bi bi-bank me-2"></i>
                                Benefícios Governamentais
                            </h5>
                        </div>

                        <motion.div
                            className="home-list"
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.12 }}
                        >
                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div className="home-benefit-icon">
                                                <i className="bi bi-mortarboard-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    ProUni — Bolsas de Estudo
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Oferece bolsas parciais ou integrais em instituições
                                                    privadas de ensino superior para estudantes de baixa
                                                    renda com bom desempenho no ENEM.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(255, 193, 7, 0.14)",
                                                    color: "#ffc107",
                                                }}
                                            >
                                                <i className="bi bi-cash-stack"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    FIES — Financiamento Estudantil
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Financiamento federal com juros reduzidos para
                                                    estudantes de baixa renda, com pagamento facilitado
                                                    após a conclusão do curso.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(13, 202, 240, 0.14)",
                                                    color: "#0dcaf0",
                                                }}
                                            >
                                                <i className="bi bi-bus-front-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Passe Livre Estudantil
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Disponível em diversas cidades, garante gratuidade ou
                                                    desconto no transporte público para estudantes
                                                    cadastrados.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(220, 53, 69, 0.14)",
                                                    color: "#dc3545",
                                                }}
                                            >
                                                <i className="bi bi-heart-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Auxílio Permanência
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Universidades e Institutos Federais podem conceder
                                                    auxílio financeiro mensal para estudantes em
                                                    vulnerabilidade social.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(13, 110, 253, 0.14)",
                                                    color: "#0d6efd",
                                                }}
                                            >
                                                <i className="bi bi-house-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Benefícios do CadÚnico
                                                </p>
                                                <small className="home-item-subtitle">
                                                    O cadastro pode garantir acesso a programas sociais,
                                                    tarifas reduzidas, prioridade habitacional,
                                                    alimentação e direitos assistenciais.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </section>

                    <section className="home-section mt-5">
                        <div className="home-section-header">
                            <h5 className="home-section-title">
                                <i className="bi bi-credit-card-2-front me-2"></i>
                                Programas de Crédito e Bancos
                            </h5>
                        </div>

                        <motion.div
                            className="home-list"
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.12 }}
                        >
                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div className="home-benefit-icon">
                                                <i className="bi bi-piggy-bank-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Santander Universitário
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Oferece crédito estudantil, bolsas e programas de
                                                    apoio acadêmico para estudantes de baixa renda.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(255, 193, 7, 0.14)",
                                                    color: "#ffc107",
                                                }}
                                            >
                                                <i className="bi bi-currency-dollar"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Itaú Crédito Educacional
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Linha de financiamento estudantil com pagamento
                                                    facilitado durante ou após o curso, dependendo da
                                                    instituição conveniada.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>

                            <motion.div variants={cardAnimation}>
                                <Card className="home-list-item border-0">
                                    <CardBody className="p-0">
                                        <div className="home-list-left">
                                            <div
                                                className="home-benefit-icon"
                                                style={{
                                                    background: "rgba(13, 202, 240, 0.14)",
                                                    color: "#0dcaf0",
                                                }}
                                            >
                                                <i className="bi bi-safe2-fill"></i>
                                            </div>

                                            <div>
                                                <p className="home-item-title mb-1">
                                                    Caixa — Apoio ao Estudante
                                                </p>
                                                <small className="home-item-subtitle">
                                                    Oferece opções de crédito, apoio social e integração
                                                    com programas governamentais como o FIES.
                                                </small>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </section>

                    <motion.div
                        className="home-empty-state mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.72)",
                            lineHeight: 1.7,
                        }}
                    >
                        Dica: procure o setor de assistência estudantil da sua escola, IF ou
                        universidade — eles podem orientar, inscrever e acompanhar você
                        nesses programas.
                    </motion.div>
                </motion.main>
            </Container>
        </div>
    );
}