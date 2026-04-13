import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

import BenefitsIntro from "./steps/BenefitsIntro";
import AcademicSituation from "./steps/AcademicSituation";
import ProfessionalSituation from "./steps/ProfessionalSituation";
import IncomeSituation from "./steps/IncomeSituation";
import HousingSituation from "./steps/HousingSituation";
import DistanceSituation from "./steps/DistanceSituation";
import BenefitsResult from "./steps/BenefitsResult";

interface User {
    id: number | string;
    nome: string;
}

type BenefitsFormData = {
    isStudent?: "sim" | "nao";
    institution?: string;
    course?: string;
    period?: string;
    workStatus?: "nao_trabalho" | "informal" | "registrado";
    householdSize?: string;
    housing?: "pais" | "sozinho" | "republica" | "aluguel" | "propria";
    farFromInstitution?: "sim" | "nao";
};

export default function StudentBenefitsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<BenefitsFormData>({});

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");

        if (!storedUser) {
            window.location.href = "/login";
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    }, []);

    function next(values: Partial<BenefitsFormData>) {
        setFormData((prev) => ({ ...prev, ...values }));
        setStep((prev) => prev + 1);
    }

    function goToStep(nextStep: number) {
        setStep(nextStep);
    }

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-empty-state">Carregando dados...</div>
            </div>
        );
    }

    const stepTitles = [
        "Introdução",
        "Situação acadêmica",
        "Situação profissional",
        "Renda",
        "Moradia",
        "Deslocamento",
        "Resultado"
    ];

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
                    <TitleHeader title="Benefícios" />

                    <div className="home-graph-card mt-3">
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                <span className="home-item-subtitle">
                                    Etapa {step} de 7
                                </span>

                                <span className="home-item-subtitle">
                                    {stepTitles[step - 1]}
                                </span>
                            </div>

                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
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
                                            transition: "0.25s ease"
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
                                <BenefitsIntro onNext={() => goToStep(2)} />
                            )}

                            {step === 2 && (
                                <AcademicSituation
                                    onNext={next}
                                    onBack={() => goToStep(1)}
                                    data={formData}
                                />
                            )}

                            {step === 3 && (
                                <ProfessionalSituation
                                    onNext={next}
                                    onBack={() => goToStep(2)}
                                    data={formData}
                                />
                            )}

                            {step === 4 && (
                                <IncomeSituation
                                    onNext={next}
                                    onBack={() => goToStep(3)}
                                    data={formData}
                                />
                            )}

                            {step === 5 && (
                                <HousingSituation
                                    onNext={next}
                                    onBack={() => goToStep(4)}
                                    data={formData}
                                />
                            )}

                            {step === 6 && (
                                <DistanceSituation
                                    onNext={next}
                                    onBack={() => goToStep(5)}
                                    data={formData}
                                />
                            )}

                            {step === 7 && (
                                <BenefitsResult
                                    onBack={() => goToStep(6)}
                                    data={formData}
                                />
                            )}
                        </motion.div>
                    </div>
                </motion.main>
            </Container>
        </div>
    );
}