import { useState } from "react";

type IncomeSituationProps = {
    onNext: (data: { householdSize: string }) => void;
    onBack: () => void;
    data?: { householdSize?: string };
};

export default function IncomeSituation({
    onNext,
    onBack,
    data
}: IncomeSituationProps) {
    const [householdSize, setHouseholdSize] = useState(data?.householdSize || "");

    function handleContinue() {
        if (!householdSize.trim()) {
            alert("Informe quantas pessoas vivem com você.");
            return;
        }

        onNext({ householdSize: householdSize.trim() });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Renda</h3>
                <p className="home-item-subtitle mb-0">
                    Quantas pessoas vivem com você?
                </p>
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Número de pessoas no domicílio
                </label>
                <input
                    type="number"
                    className="form-control custom-input-balance"
                    placeholder="Digite a quantidade"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                />
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