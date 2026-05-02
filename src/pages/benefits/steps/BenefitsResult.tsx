import { useEffect, useRef, useState } from "react";
import { BENEFITS_API_URL } from "../../../config";
import "../../../styles/benefitsResult.scss";

type BenefitsResultProps = {
    onBack: () => void;
    data: {
        isStudent?: "sim" | "nao";
        institution?: string;
        course?: string;
        period?: string;
        workStatus?: "nao_trabalho" | "informal" | "registrado";
        householdSize?: string;
        housing?: "pais" | "sozinho" | "republica" | "aluguel" | "propria";
        farFromInstitution?: "sim" | "nao";
    };
};

type BenefitsApiResponse = {
    userId: number;
    benefits: string[];
    message: string;
};

const benefitDetails: Record<string, {
    icon: string;
    tag: string;
    description: string;
    className: string;
    url: string;
}> = {
    "Auxílio Estudantil": {
        icon: "🎓",
        tag: "Educação",
        description: "Apoio financeiro para estudantes em situação de vulnerabilidade.",
        className: "student",
        url: "https://www.gov.br/mec/pt-br/pnaes"
    },
    "Auxílio Transporte": {
        icon: "🚌",
        tag: "Deslocamento",
        description: "Ajuda para custos de transporte até a instituição.",
        className: "transport",
        url: "https://www.gov.br/mec/pt-br/pnaes"
    },
    "Auxílio Moradia": {
        icon: "🏠",
        tag: "Moradia",
        description: "Suporte para estudantes com gastos de aluguel ou residência.",
        className: "housing",
        url: "https://www.gov.br/mec/pt-br/pnaes"
    },
    "Auxílio Permanência": {
        icon: "📌",
        tag: "Permanência",
        description: "Benefício para ajudar o aluno a continuar no curso.",
        className: "permanence",
        url: "https://www.gov.br/pt-br/servicos/obter-bolsa-do-programa-de-bolsa-permanencia"
    },
    "Bolsa de Apoio Acadêmico": {
        icon: "📚",
        tag: "Acadêmico",
        description: "Bolsa voltada para apoio em atividades acadêmicas.",
        className: "academic",
        url: "https://www.gov.br/mec/pt-br/pnaes"
    }
};

export default function BenefitsResult({ onBack, data }: BenefitsResultProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [result, setResult] = useState<BenefitsApiResponse | null>(null);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const analyzeBenefits = async () => {
            try {
                setLoading(true);
                setError("");
                setResult(null);

                const payload = {
                    userId: 1,
                    isStudent: data.isStudent === "sim",
                    institutionName: data.institution || "",
                    course: data.course || "",
                    period: data.period || "",
                    workStatus: data.workStatus || "",
                    peopleAtHome: Number(data.householdSize || 0),
                    housingSituation: data.housing === "propria" ? "casa_propria" : (data.housing || ""),
                    livesFarFromInstitution: data.farFromInstitution === "sim"
                };

                const response = await fetch(`${BENEFITS_API_URL}/benefits/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const raw = await response.text();

                if (!response.ok) {
                    throw new Error(raw || "Não foi possível analisar os benefícios.");
                }

                setResult(JSON.parse(raw));
            } catch {
                setError("Não foi possível carregar os benefícios agora.");
            } finally {
                setLoading(false);
            }
        };

        analyzeBenefits();
    }, [data]);

    return (
        <div className="benefits-result">
            <div className="benefits-result__header">
                <span className="benefits-result__eyebrow">Resultado da análise</span>

                <h3>Benefícios encontrados para você</h3>

                <p>
                    Com base nas suas respostas, identificamos benefícios que podem combinar com o seu perfil.
                </p>
            </div>

            <div className="benefits-result__summary">
                <div>
                    <strong>Instituição</strong>
                    <span>{data.institution || "-"}</span>
                </div>

                <div>
                    <strong>Curso</strong>
                    <span>{data.course || "-"}</span>
                </div>

                <div>
                    <strong>Período</strong>
                    <span>{data.period || "-"}</span>
                </div>

                <div>
                    <strong>Pessoas em casa</strong>
                    <span>{data.householdSize || "-"}</span>
                </div>
            </div>

            {loading && (
                <div className="benefits-result__state">
                    Analisando benefícios...
                </div>
            )}

            {!loading && error && (
                <div className="benefits-result__state benefits-result__state--error">
                    {error}
                </div>
            )}

            {!loading && !error && result && (
                <>
                    {result.benefits.length > 0 ? (
                        <div className="benefits-result__grid">
                            {result.benefits.map((benefit, index) => {
                                const detail = benefitDetails[benefit] || {
                                    icon: "✨",
                                    tag: "Benefício",
                                    description: "Benefício identificado com base nas respostas informadas.",
                                    className: "default",
                                    url: "https://www.gov.br/mec/pt-br/pnaes"
                                };

                                return (
                                    <a
                                        key={`${benefit}-${index}`}
                                        className={`benefit-card benefit-card--${detail.className}`}
                                        href={detail.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className="benefit-card__top">
                                            <div className="benefit-card__icon">
                                                {detail.icon}
                                            </div>

                                            <span>{detail.tag}</span>
                                        </div>

                                        <h4>{benefit}</h4>

                                        <p>{detail.description}</p>

                                        <div className="benefit-card__footer">
                                            <small>Ver informações oficiais →</small>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="benefits-result__state">
                            Nenhum benefício foi identificado para o perfil informado.
                        </div>
                    )}

                    <p className="benefits-result__message">
                        {result.message}
                    </p>
                </>
            )}

            <button
                type="button"
                className="benefits-result__back"
                onClick={onBack}
            >
                Voltar
            </button>
        </div>
    );
}