import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";

import Credentials from "./signIn/credentials";
import CreditProfile from "./signIn/creditprofile";
import BalanceInput from "./signIn/signbalance";

import { hashPassword } from "../../utils/hashPassword";

export default function SignIn() {
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

            const res = await fetch("https://database-save-app.onrender.com/users", {
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
        <main className="background-color text-white min-vh-100 py-4 py-md-5">
            <div className="container home-shell">
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="home-main"
                >
                    <div className="mx-auto" style={{ maxWidth: "900px" }}>
                        <div className="text-start mb-4">
                            <p className="home-balance-label mb-2">Criar conta</p>
                            <h1
                                className="mb-2"
                                style={{
                                    fontSize: "2.2rem",
                                    fontWeight: 700,
                                    letterSpacing: "-0.8px",
                                    lineHeight: 1.1,
                                }}
                            >
                                Comece sua experiência
                            </h1>
                            <p className="home-item-subtitle mb-0">
                                complete as etapas para entrar no app
                            </p>
                        </div>

                        <div className="d-flex gap-2 mb-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    style={{
                                        height: "8px",
                                        flex: 1,
                                        borderRadius: "999px",
                                        background:
                                            step >= item
                                                ? "rgba(13, 202, 240, 0.95)"
                                                : "rgba(255,255,255,0.10)",
                                        transition: "0.25s ease",
                                    }}
                                />
                            ))}
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
                    </div>
                </motion.div>
            </div>
        </main>
    );
}