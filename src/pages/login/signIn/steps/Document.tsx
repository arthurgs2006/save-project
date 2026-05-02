import { useState } from "react";

type DocumentProps = {
    onNext: (data: { cpf: string }) => void;
};

export default function Document({ onNext }: DocumentProps) {
    const [cpf, setCpf] = useState("");

    function handleContinue() {
        if (!cpf.trim()) {
            alert("Informe seu CPF.");
            return;
        }

        onNext({ cpf: cpf.trim() });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Documento</h3>
                <p className="home-item-subtitle mb-0">
                    Informe seu CPF para continuar.
                </p>
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    CPF
                </label>
                <input
                    type="text"
                    className="form-control custom-input-balance"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />
            </div>

            <button
                type="button"
                className="btn btn-primary w-100 fw-semibold py-3"
                style={{ borderRadius: "999px", fontSize: "0.98rem" }}
                onClick={handleContinue}
            >
                Continuar
            </button>
        </div>
    );
}