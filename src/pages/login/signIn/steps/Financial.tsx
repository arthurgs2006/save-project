import { useState } from "react";

type FinancialProps = {
    onNext: (data: {
        income: string;
        balance: string;
    }) => void;
};

export default function Financial({ onNext }: FinancialProps) {
    const [income, setIncome] = useState("");
    const [balance, setBalance] = useState("");

    function handleContinue() {
        if (!income.trim()) {
            alert("Informe sua receita mensal.");
            return;
        }

        onNext({
            income: income.trim(),
            balance: balance.trim()
        });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Perfil financeiro</h3>
                <p className="home-item-subtitle mb-0">
                    Informe seus dados financeiros.
                </p>
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Receita mensal
                </label>
                <input
                    type="text"
                    className="form-control custom-input-balance"
                    placeholder="Obrigatório"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                />
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Saldo disponível
                </label>
                <input
                    type="text"
                    className="form-control custom-input-balance"
                    placeholder="Opcional"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
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