import { useState } from "react";

type SecurityProps = {
    onNext: (data: { password: string }) => void;
};

export default function Security({ onNext }: SecurityProps) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    function handleContinue() {
        if (!password.trim() || !confirm.trim()) {
            alert("Preencha os campos de senha.");
            return;
        }

        if (password !== confirm) {
            alert("As senhas não coincidem.");
            return;
        }

        onNext({ password });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Segurança</h3>
                <p className="home-item-subtitle mb-0">
                    Defina uma senha para proteger sua conta.
                </p>
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Senha
                </label>
                <input
                    type="password"
                    className="form-control custom-input-balance"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Confirmar senha
                </label>
                <input
                    type="password"
                    className="form-control custom-input-balance"
                    placeholder="********"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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