import { useState } from "react";

type HousingSituationProps = {
    onNext: (data: {
        housing: "pais" | "sozinho" | "republica" | "aluguel" | "propria";
    }) => void;
    onBack: () => void;
    data?: {
        housing?: "pais" | "sozinho" | "republica" | "aluguel" | "propria";
    };
};

export default function HousingSituation({
    onNext,
    onBack,
    data
}: HousingSituationProps) {
    const [housing, setHousing] = useState<
        "pais" | "sozinho" | "republica" | "aluguel" | "propria" | ""
    >(data?.housing || "");

    function handleContinue() {
        if (!housing) {
            alert("Selecione sua situação de moradia.");
            return;
        }

        onNext({ housing });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Moradia</h3>
                <p className="home-item-subtitle mb-0">
                    Qual sua situação de moradia?
                </p>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
                {[
                    { value: "pais", label: "Moro com meus pais" },
                    { value: "sozinho", label: "Moro sozinho" },
                    { value: "republica", label: "Moro em república" },
                    { value: "aluguel", label: "Moro de aluguel" },
                    { value: "propria", label: "Moro em casa própria" }
                ].map((option) => (
                    <label
                        key={option.value}
                        className="home-list-item border-0 p-3 d-flex align-items-center gap-2"
                    >
                        <input
                            type="radio"
                            name="housing"
                            checked={housing === option.value}
                            onChange={() =>
                                setHousing(
                                    option.value as
                                        | "pais"
                                        | "sozinho"
                                        | "republica"
                                        | "aluguel"
                                        | "propria"
                                )
                            }
                        />
                        <span className="text-white">{option.label}</span>
                    </label>
                ))}
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