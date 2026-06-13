import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import LoadingScreen from "../../components/routerComponents/loadingScreen";

import { BENEFITS_API_URL } from "../../config";

import BenefitsIntro from "./steps/BenefitsIntro";
import AcademicSituation from "./steps/AcademicSituation";
import ProfessionalSituation from "./steps/ProfessionalSituation";
import IncomeSituation from "./steps/IncomeSituation";
import HousingSituation from "./steps/HousingSituation";
import DistanceSituation from "./steps/DistanceSituation";
import BenefitsResult from "./steps/BenefitsResult";
import "./Benefits.scss";

interface User {
    id?: number | string;
    Id?: number | string;
    nome?: string;
    Nome?: string;
    name?: string; // Correção 1: Adicionado 'name'
}

type BenefitsFormData = {
    isStudent?: "sim" | "nao";

    institution?: string;
    institutionType?: "publica" | "privada";

    educationLevel?:
        | "medio"
        | "tecnico"
        | "graduacao"
        | "pos";

    course?: string;

    studyShift?:
        | "manha"
        | "tarde"
        | "noite"
        | "integral";

    scholarship?:
        | "nenhuma"
        | "parcial"
        | "integral";

    workStatus?:
        | "nao_trabalho"
        | "informal"
        | "registrado";

    monthlyIncome?: string;
    familyIncome?: string;

    householdSize?: string;

    receivesGovernmentAid?: "sim" | "nao";
    governmentAidName?: string;

    housing?:
        | "pais"
        | "sozinho"
        | "republica"
        | "aluguel"
        | "propria";

    housingExpenses?: "sim" | "nao";

    farFromInstitution?: "sim" | "nao";

    transportType?:
        | "onibus"
        | "metro"
        | "carro"
        | "bicicleta"
        | "outro";

    transportCost?: string;
    travelTime?: string;

    hasChildren?: "sim" | "nao";
    hasDisability?: "sim" | "nao";

    completed?: boolean;
    eligibleBenefits?: string[]; // Correção 3: Adicionado eligibleBenefits
};

const STORAGE_KEY = "benefits-progress";

export default function StudentBenefitsPage() {
    const [user, setUser] = useState<User | null>(null);

    const [step, setStep] = useState(1);

    const [formData, setFormData] =
        useState<BenefitsFormData>({});

    const [loadingSavedProfile, setLoadingSavedProfile] =
        useState(true);

    const [lastSavedAt, setLastSavedAt] =
        useState<string>("");

    const stepTitles = [
        "Introdução",
        "Situação acadêmica",
        "Trabalho e renda",
        "Moradia",
        "Transporte",
        "Situação social",
        "Resultado"
    ];

    const progress = useMemo(() => {
        return Math.min((step / 7) * 100, 100);
    }, [step]);

    useEffect(() => {
        const loadUserAndBenefits = async () => {
            try {
                const storedUser =
                    localStorage.getItem("loggedUser");

                if (!storedUser) {
                    window.location.href = "/login";
                    return;
                }

                const parsedUser = JSON.parse(storedUser);

                const userId =
                    parsedUser.id ||
                    parsedUser.Id ||
                    1;

                setUser(parsedUser);

                const localProgress =
                    localStorage.getItem(STORAGE_KEY);

                if (localProgress) {
                    const parsedProgress =
                        JSON.parse(localProgress);

                    if (parsedProgress?.formData) {
                        setFormData(parsedProgress.formData);

                        if (
                            parsedProgress.formData
                                ?.completed
                        ) {
                            setStep(7);
                        } else {
                            setStep(
                                parsedProgress.step || 1
                            );
                        }

                        setLoadingSavedProfile(false);
                        return;
                    }
                }

             

                const response = await fetch(
                    `${BENEFITS_API_URL}/benefits/user/${userId}/latest`
                );

                if (!response.ok) {
                    setLoadingSavedProfile(false);
                    return;
                }

                const savedProfile =
                    await response.json();

                const parsedData: BenefitsFormData =
                    {
                        isStudent:
                            (
                                savedProfile.isStudent ??
                                savedProfile.IsStudent
                            )
                                ? "sim"
                                : "nao",

                        institution:
                            savedProfile.institutionName ??
                            savedProfile.InstitutionName ??
                            "",

                        institutionType:
                            savedProfile.institutionType ??
                            "",

                        educationLevel:
                            savedProfile.educationLevel ??
                            "",

                        course:
                            savedProfile.course ??
                            savedProfile.Course ??
                            "",

                        studyShift:
                            savedProfile.studyShift ??
                            "",

                        scholarship:
                            savedProfile.scholarship ??
                            "",

                        workStatus:
                            savedProfile.workStatus ??
                            "",

                        monthlyIncome:
                            String(
                                savedProfile.monthlyIncome ??
                                ""
                            ),

                        familyIncome:
                            String(
                                savedProfile.familyIncome ??
                                ""
                            ),

                        householdSize:
                            String(
                                savedProfile.peopleAtHome ??
                                savedProfile.PeopleAtHome ??
                                ""
                            ),

                        receivesGovernmentAid:
                            savedProfile.receivesGovernmentAid
                                ? "sim"
                                : "nao",

                        governmentAidName:
                            savedProfile.governmentAidName ??
                            "",

                        housing:
                            savedProfile.housingSituation ===
                            "casa_propria"
                                ? "propria"
                                : savedProfile.housingSituation,

                        housingExpenses:
                            savedProfile.housingExpenses
                                ? "sim"
                                : "nao",

                        farFromInstitution:
                            savedProfile.livesFarFromInstitution
                                ? "sim"
                                : "nao",

                        transportType:
                            savedProfile.transportType ??
                            "",

                        transportCost:
                            String(
                                savedProfile.transportCost ??
                                ""
                            ),

                        travelTime:
                            String(
                                savedProfile.travelTime ??
                                ""
                            ),

                        hasChildren:
                            savedProfile.hasChildren
                                ? "sim"
                                : "nao",

                        hasDisability:
                            savedProfile.hasDisability
                                ? "sim"
                                : "nao",

                        completed:
                            savedProfile.completed ??
                            false
                    };

                setFormData(parsedData);

              

                if (parsedData.completed) {
                    setStep(7);
                } else {
                    setStep(2);
                }
            } catch (error) {
                console.error(error);
                setStep(1);
            } finally {
                setLoadingSavedProfile(false);
            }
        };

        loadUserAndBenefits();
    }, []);


    useEffect(() => {
        if (!user) return;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                step,
                formData
            })
        );

        setLastSavedAt(
            new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        );
    }, [step, formData, user]);

    function next(values: Partial<BenefitsFormData>) {
        setFormData((prev) => ({
            ...prev,
            ...values
        }));

        setStep((prev) => prev + 1);
    }

    function goToStep(nextStep: number) {
        setStep(nextStep);
    }

    function completeForm() {
        setFormData((prev) => ({
            ...prev,
            completed: true
        }));

        setStep(7);
    }

    function restartQuestionnaire() {
        localStorage.removeItem(STORAGE_KEY);

        setFormData({});
        setStep(1);
    }

    function continueFromWhereStopped() {
        const localProgress =
            localStorage.getItem(STORAGE_KEY);

        if (!localProgress) return;

        const parsedProgress =
            JSON.parse(localProgress);

        setFormData(parsedProgress.formData || {});
        setStep(parsedProgress.step || 1);
    }

    function editBenefitsInfo() {
        setStep(2);
    }

    if (!user || loadingSavedProfile) {
        return <LoadingScreen />;
    }

    const eligibleBenefits: string[] = [];

    const familyIncome =
        Number(formData.familyIncome || 0);

    if (familyIncome <= 2500) {
        eligibleBenefits.push(
            "Auxílio permanência estudantil"
        );
    }

    if (formData.farFromInstitution === "sim") {
        eligibleBenefits.push(
            "Auxílio transporte"
        );
    }

    if (formData.housing === "aluguel") {
        eligibleBenefits.push(
            "Auxílio moradia"
        );
    }

    if (formData.hasChildren === "sim") {
        eligibleBenefits.push(
            "Auxílio creche"
        );
    }
    
    function getUserFirstName() {
        const name = user?.nome || user?.name || "usuário";
        return name.split(" ")[0];
    }

    return (
        <div className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <Container className="home-shell">
                <AccountHeader name={getUserFirstName()} />

                <motion.main
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader title="Benefícios estudantis" />

                    <div className="home-graph-card mt-3 p-4">
                        <div className="d-flex flex-column gap-2 mb-4">
            <div className="benefits-header">
                                <div>
                                    <h4 className="benefits-header__title">
                                        Mapeamento de
                                        benefícios
                                    </h4>

                                    <span className="home-item-subtitle benefits-header__desc">
                                        Responda algumas
                                        perguntas para
                                        encontrarmos
                                        benefícios
                                        compatíveis com
                                        sua realidade
                                        acadêmica e
                                        financeira.
                                    </span>
                                </div>

                                <div className="benefits-header__meta">
                                    <div className="home-item-subtitle benefits-header__step">
                                        Etapa {step} de 7
                                    </div>

                                    <div className="home-item-subtitle">
                                        {
                                            stepTitles[
                                                step - 1
                                            ]
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="benefits-progress-track">
                                <div
                                    className="benefits-progress-fill"
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />
                            </div>

                            <div className="benefits-autosave">
                                <span className="home-item-subtitle">
                                    Suas respostas são
                                    salvas
                                    automaticamente.
                                </span>

                                {lastSavedAt && (
                                    <span className="home-item-subtitle">
                                        Último salvamento
                                        às {lastSavedAt}
                                    </span>
                                )}
                            </div>

                            {localStorage.getItem(
                                STORAGE_KEY
                            ) &&
                                !formData.completed && (
                                    <div className="benefits-resume-actions">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={
                                                continueFromWhereStopped
                                            }
                                        >
                                            Continuar de
                                            onde parei
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-light"
                                            onClick={
                                                restartQuestionnaire
                                            }
                                        >
                                            Refazer
                                            questionário
                                        </button>
                                    </div>
                                )}
                        </div>

                        <motion.div
                            key={step}
                            initial={{
                                opacity: 0,
                                y: 16
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.35
                            }}
                        >
                            {step === 1 && (
                                <BenefitsIntro
                                    onNext={() =>
                                        goToStep(2)
                                    }
                                />
                            )}

                            {step === 2 && (
                                <AcademicSituation
                                    onNext={next}
                                    onBack={() =>
                                        goToStep(1)
                                    }
                                    data={formData}
                                />
                            )}

                            {step === 3 && (
                                <ProfessionalSituation
                                    onNext={next}
                                    onBack={() =>
                                        goToStep(2)
                                    }
                                    data={formData as any}
                                />
                            )}

                            {step === 4 && (
                                <IncomeSituation
                                    onNext={next}
                                    onBack={() =>
                                        goToStep(3)
                                    }
                                    data={formData}
                                />
                            )}

                            {step === 5 && (
                                <HousingSituation
                                    onNext={next}
                                    onBack={() =>
                                        goToStep(4)
                                    }
                                    data={formData}
                                />
                            )}

                            {step === 6 && (
                                <DistanceSituation
                                    onNext={(values) => {
                                        next(values);

                                        setTimeout(() => {
                                            completeForm();
                                        }, 150);
                                    }}
                                    onBack={() =>
                                        goToStep(5)
                                    }
                                    data={formData}
                                />
                            )}

                            {step === 7 && (
                                <>
                                    <BenefitsResult
                                        onBack={() =>
                                            goToStep(6)
                                        }
                                        data={{
                                            ...formData,
                                            eligibleBenefits
                                        } as any} 
                                    />

                                    <div className="d-flex gap-2 mt-4 flex-wrap">
                                        <button
                                            type="button"
                                            className="benefits-result__back"
                                            onClick={
                                                editBenefitsInfo
                                            }
                                        >
                                            Editar
                                            informações
                                        </button>

                                        <button
                                            type="button"
                                            className="benefits-result__back"
                                            onClick={
                                                restartQuestionnaire
                                            }
                                        >
                                            Refazer
                                            questionário
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </motion.main>
            </Container>
        </div>
    );
}