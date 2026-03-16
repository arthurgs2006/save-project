import React, { useState, useEffect } from "react";
import { Container, Carousel, CarouselItem } from "reactstrap";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

export default function WelcomePage() {

    const items = [
        {
            id: 0,
            text: "Seus gastos, suas metas, seu controle.",
            image: "/imagem1.webp"
        },
        {
            id: 1,
            text: "Acompanhe suas despesas e entradas de forma rápida e prática.",
            image: "/imagem2.webp"
        },
        {
            id: 2,
            text: "Defina objetivos de economia e veja seu progresso em tempo real.",
            image: "/imagem3.webp"
        },
    ];

    const [activeIndex, setActiveIndex] = useState<number>(0);

    const next = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === items.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToIndex = (newIndex: number) => setActiveIndex(newIndex);

    useEffect(() => {
        const timer = setInterval(() => {
            next();
        }, 3000);

        return () => clearInterval(timer);
    }, [activeIndex]);

    return (
        <main className="home-apple-screen text-white min-vh-100 d-flex align-items-center">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell py-4 py-md-5">

                <motion.div
                    className="d-flex justify-content-center"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >

                    <div style={{ width: "100%", maxWidth: "560px" }}>

                        <div className="text-center mb-4">

                            <p className="home-balance-label mb-2">
                                Bem-vindo ao app
                            </p>

                            <motion.h1
                                className="home-balance-value mb-2"
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                style={{
                                    fontSize: "clamp(2.4rem, 6vw, 4rem)",
                                    textTransform: "lowercase",
                                }}
                            >
                                save
                            </motion.h1>

                            <p className="home-item-subtitle mb-0">
                                Organize sua vida financeira com clareza e controle
                            </p>

                        </div>

                        <motion.div
                            className="home-graph-card text-center"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >

                            <Carousel
                                activeIndex={activeIndex}
                                next={next}
                                previous={next}
                                slide
                                fade={false}
                                interval={false}
                            >

                                {items.map((item) => (

                                    <CarouselItem key={item.id}>

                                        <motion.div
                                            className="d-flex flex-column align-items-center justify-content-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.35 }}
                                        >

                                            <img
                                                src={item.image}
                                                alt="feature"
                                                style={{
                                                    width: "160px",
                                                    marginBottom: "1.2rem"
                                                }}
                                            />

                                            <p
                                                className="mb-0"
                                                style={{
                                                    fontSize: "1.08rem",
                                                    lineHeight: 1.55,
                                                    color: "rgba(255,255,255,0.88)",
                                                    maxWidth: "420px",
                                                    margin: "0 auto",
                                                }}
                                            >
                                                {item.text}
                                            </p>

                                        </motion.div>

                                    </CarouselItem>

                                ))}

                            </Carousel>

                            <div className="home-balance-graph-shell">
                                <div className="home-balance-graph">
                                    {items.map((item, index) => (
                                        <span
                                            key={item.id}
                                            className={`home-graph-dot ${index === activeIndex ? "active" : ""}`}
                                            onClick={() => goToIndex(index)}
                                            style={{ cursor: "pointer" }}
                                        ></span>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-3 mt-4">

                                <a
                                    href="/login"
                                    className="btn btn-primary fw-semibold py-3"
                                    style={{
                                        borderRadius: "999px",
                                        fontSize: "0.98rem",
                                    }}
                                >
                                    Entrar
                                </a>

                                <a
                                    href="/signin"
                                    className="text-decoration-none"
                                    style={{
                                        color: "#bfe7ff",
                                        fontWeight: 500,
                                        fontSize: "0.94rem",
                                    }}
                                >
                                    Ainda não tem uma conta? Criar conta
                                </a>

                            </div>

                        </motion.div>

                    </div>

                </motion.div>

            </Container>

        </main>
    );
}