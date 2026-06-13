import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Welcome from "./signIn/steps/Welcome";
import BasicData from "./signIn/steps/BasicData";
import Security from "./signIn/steps/Security";
import Document from "./signIn/steps/Document";
import Financial from "./signIn/steps/Financial";
import Preferences from "./signIn/steps/Preferences";
import Terms from "./signIn/steps/Terms";

import OpenFinanceConnect from "../../components/OpenFinanceConnect";
import { hashPassword } from "../../utils/hashPassword";
import { AUTH_URL } from "../../config";
import AlertModal from "../../components/generic_components/AlertModal";
import "./signIn.scss";

type SignUpData = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    cpf?: string;
    income?: string;
    balance?: string;
    categories?: string[];
};

// --- FUNÇÃO VALIDADORA DE CPF ADICIONADA AQUI ---
function isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");

    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }

    const calcDigit = (tamanho: number) => {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
            soma += parseInt(cleanCPF[i]) * (tamanho + 1 - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    return calcDigit(9) === parseInt(cleanCPF[9]) && calcDigit(10) === parseInt(cleanCPF[10]);
}
// ------------------------------------------------

export default function SignIn() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [data, setData] = useState<SignUpData>({});
    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    function next(values: SignUpData) {
     
        if (values.cpf && !isValidCPF(values.cpf)) {
            setAlert({
                isOpen: true,
                message: "CPF inválido. Verifique os números digitados.",
                type: "warning"
            });
            return; 
        }
   

        setData((prev) => ({ ...prev, ...values }));
        setStep((prev) => prev + 1);
    }

    async function handleRegister() {
        try {
            const passwordHashed = await hashPassword(data.password || "");

            const newUser = {
                id: uuidv4(),
                name: data.name || "",
                nome: data.name || "",
                email: data.email || "",
                telefone: data.phone || "",
                cpf: data.cpf || "",
                password: passwordHashed,
                saldo_final: Number(data.balance || 0),
                receita: data.income || "",
                preferencias: data.categories || [],
                extratos: [],
                twoFactorEnabled: false
            };

            const res = await fetch(`${AUTH_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (!res.ok) {
                setAlert({
                    isOpen: true,
                    message: "Erro ao cadastrar usuário.",
                    type: "danger"
                });
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify(newUser));
            window.location.href = "/homescreen";
        } catch (error) {
            console.error(error);
            setAlert({
                isOpen: true,
                message: "Falha ao conectar ao servidor.",
                type: "danger"
            });
        }
    }

    const stepTitles = [
        "Boas-vindas",
        "Dados básicos",
        "Segurança",
        "Documento",
        "Perfil financeiro",
        "Preferências",
        "Termos"
    ];

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
                                    lineHeight: 1
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
                                    <span className="home-item-subtitle signin-step-label">
                                        Etapa {step} de 7
                                    </span>

                                    <span className="home-item-subtitle">
                                        {stepTitles[step - 1]}
                                    </span>
                                </div>

                                <div className="signin-steps">
                                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                                        <div
                                            key={item}
                                            className={`signin-step-segment ${step >= item ? "active" : ""}`}
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
                                {step === 1 && <Welcome onNext={() => setStep(2)} />}
                                {step === 2 && <BasicData onNext={next} />}
                                {step === 3 && <Security onNext={next} />}
                                {step === 4 && <Document onNext={next} />}
                                {step === 5 && <Financial onNext={next} />}
                                {step === 6 && <Preferences onNext={next} />}
                                {step === 7 && (
                                    <Terms
                                        data={data}
                                        onFinish={handleRegister}
                                    />
                                )}
                            </motion.div>


                            <div className="signin-footer">
                                <span className="home-item-subtitle">
                                    Já tem uma conta?
                                </span>

                                <button
                                    type="button"
                                    className="signin-footer-link"
                                    onClick={() => navigate("/login")}
                                >
                                    Entrar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {alert && (
                <AlertModal
                    isOpen={alert.isOpen}
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </main>
    );
}