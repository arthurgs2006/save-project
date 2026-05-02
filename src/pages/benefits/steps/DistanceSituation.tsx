import { useState } from "react";

type DistanceSituationProps = {
    onNext: (data: { farFromInstitution: "sim" | "nao" }) => void;
    onBack: () => void;
    data?: { farFromInstitution?: "sim" | "nao" };
};

export default function DistanceSituation({
    onNext,
    onBack,
    data
}: DistanceSituationProps) {
    const [farFromInstitution, setFarFromInstitution] = useState<
        "sim" | "nao" | ""
    >(data?.farFromInstitution || "");

    function handleContinue() {
        if (!farFromInstitution) {
            alert("Selecione uma opção.");
            return;
        }

        onNext({ farFromInstitution });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">
                    Distância / Deslocamento
                </h3>
                <p className="home-item-subtitle mb-0">
                    Você mora longe da instituição de ensino?
                </p>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="distance"
                        checked={farFromInstitution === "sim"}
                        onChange={() => setFarFromInstitution("sim")}
                    />
                    <span className="text-white">Sim</span>
                </label>

                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="distance"
                        checked={farFromInstitution === "nao"}
                        onChange={() => setFarFromInstitution("nao")}
                    />
                    <span className="text-white">Não</span>
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
                    Ver resultado
                </button>
            </div>
        </div>
    );
}