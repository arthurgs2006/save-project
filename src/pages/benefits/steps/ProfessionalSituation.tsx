import { useState } from "react";

type ProfessionalSituationProps = {
    onNext: (data: {
        workStatus: "nao_trabalho" | "informal" | "registrado";
    }) => void;
    onBack: () => void;
    data?: {
        workStatus?: "nao_trabalho" | "informal" | "registrado";
    };
};

export default function ProfessionalSituation({
    onNext,
    onBack,
    data
}: ProfessionalSituationProps) {
    const [workStatus, setWorkStatus] = useState<
        "nao_trabalho" | "informal" | "registrado" | ""
    >(data?.workStatus || "");

    function handleContinue() {
        if (!workStatus) {
            alert("Selecione sua situação profissional.");
            return;
        }

        onNext({ workStatus });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Situação profissional</h3>
                <p className="home-item-subtitle mb-0">
                    Você trabalha atualmente?
                </p>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="work"
                        checked={workStatus === "nao_trabalho"}
                        onChange={() => setWorkStatus("nao_trabalho")}
                    />
                    <span className="text-white">Não trabalho</span>
                </label>

                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="work"
                        checked={workStatus === "informal"}
                        onChange={() => setWorkStatus("informal")}
                    />
                    <span className="text-white">Trabalho informal</span>
                </label>

                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="work"
                        checked={workStatus === "registrado"}
                        onChange={() => setWorkStatus("registrado")}
                    />
                    <span className="text-white">Trabalho registrado</span>
                </label>
            </div>

            <div className="d-flex gap-3">
                <button
                    type="button"
                    className="btn btn-outline-light w-50 py-3"
                    style={{ borderRadius: "999px" }}
                    onClick={onBack}
                >
                    Voltar
                </button>

                <button
                    type="button"
                    className="btn btn-primary w-50 fw-semibold py-3"
                    style={{ borderRadius: "999px", fontSize: "0.98rem" }}
                    onClick={handleContinue}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}