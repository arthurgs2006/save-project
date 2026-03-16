import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <main className="home-apple-screen text-white min-vh-100 d-flex align-items-center">

            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <div className="container home-shell py-4 py-md-5">

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="d-flex justify-content-center"
                >
                    <div style={{ width: "100%", maxWidth: "520px" }}>

                        <div className="home-graph-card text-center">

                            <img
                                src="/error404.webp"
                                alt="Erro 404"
                                style={{
                                    width: "220px",
                                    marginBottom: "1.6rem"
                                }}
                            />

                            <p className="home-balance-label mb-2">
                                Algo deu errado
                            </p>

                            <h1
                                className="home-balance-value mb-3"
                                style={{
                                    fontSize: "clamp(2.2rem,5vw,3rem)",
                                    letterSpacing: "-1px"
                                }}
                            >
                                Página não encontrada
                            </h1>

                            <p className="home-item-subtitle mb-4">
                                Erro 404 — O conteúdo que você procura não existe.
                            </p>

                            <Link
                                to="/"
                                className="btn btn-primary fw-semibold px-4 py-3"
                                style={{
                                    borderRadius: "999px",
                                    fontSize: "0.95rem"
                                }}
                            >
                                Voltar para o início
                            </Link>

                        </div>

                    </div>
                </motion.div>

            </div>
        </main>
    );
}