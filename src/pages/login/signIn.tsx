import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Credentials from "./signIn/credentials";
import CreditProfile from "./signIn/creditprofile";
import BalanceInput from "./signIn/signbalance";

import { hashPassword } from "../../utils/hashPassword";
import { BASE_URL } from "../../config";

export default function SignIn() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);

    async function handleRegister(balanceValue: number) {
        try {
            const passwordHashed = await hashPassword(credentials.password);

            const newUser = {
                id: uuidv4(),
                nome: credentials.name || "Usuário Teste",
                email: credentials.email,
                password: passwordHashed,
                saldo_final: balanceValue,
                preferencias: profileData?.preferencias || [],
                extratos: [],
            };

            const res = await fetch(`${BASE_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                alert("Erro ao cadastrar usuário.");
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify(newUser));
            alert("Usuário cadastrado com sucesso!");
            window.location.href = "/homescreen";
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            alert("Falha ao conectar ao servidor.");
        }
    }

    return (
        <main className="home-apple-screen text-white min-vh-100 d-flex align-items-center">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <div className="container home-shell py-4 py-md-5">
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="home-main"
                >
                    <div className="mx-auto" style={{ maxWidth: "720px" }}>
                        <div className="text-center mb-4">
                            <p className="home-balance-label mb-2">Criar conta</p>

                            <h1
                                className="home-balance-value mb-2"
                                style={{
                                    fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                                    lineHeight: 1,
                                }}
                            >
                                Comece sua experiência
                            </h1>

                            <p className="home-item-subtitle mb-0">
                                Complete as etapas para entrar no app
                            </p>
                        </div>

                        <div className="home-graph-card">
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                    <span className="home-item-subtitle">
                                        Etapa {step} de 3
                                    </span>

                                    <span className="home-item-subtitle">
                                        {step === 1 && "Credenciais"}
                                        {step === 2 && "Perfil"}
                                        {step === 3 && "Saldo inicial"}
                                    </span>
                                </div>

                                <div className="d-flex gap-2">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            style={{
                                                height: "8px",
                                                flex: 1,
                                                borderRadius: "999px",
                                                background:
                                                    step >= item
                                                        ? "linear-gradient(90deg, rgba(117, 225, 255, 0.98), rgba(58, 124, 255, 0.98))"
                                                        : "rgba(255,255,255,0.10)",
                                                boxShadow:
                                                    step >= item
                                                        ? "0 0 14px rgba(80, 167, 255, 0.16)"
                                                        : "none",
                                                transition: "0.25s ease",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                {step === 1 && (
                                    <Credentials
                                        onNext={(data: any) => {
                                            setCredentials(data);
                                            setStep(2);
                                        }}
                                    />
                                )}

                                {step === 2 && (
                                    <CreditProfile
                                        credentials={credentials}
                                        onFinish={(data: any) => {
                                            setProfileData(data);
                                            setStep(3);
                                        }}
                                    />
                                )}

                                {step === 3 && (
                                    <BalanceInput
                                        onNext={(value: number) => {
                                            handleRegister(value);
                                        }}
                                    />
                                )}
                            </motion.div>

                            <div className="text-center mt-4">
                                <span className="home-item-subtitle">
                                    Já tem uma conta?
                                </span>

                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#bfe7ff",
                                        marginLeft: "6px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                >
                                    Entrar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}