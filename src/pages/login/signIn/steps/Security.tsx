import { useState } from "react";
import AlertModal from "../../../../components/generic_components/AlertModal";
import "./signInSteps.scss";

type SecurityProps = {
    onNext: (data: { password: string }) => void;
};

export default function Security({ onNext }: SecurityProps) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    
    const [modalInfo, setModalInfo] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    }>({
        isOpen: false,
        message: "",
        type: "info",
    });

    function handleContinue() {
        if (!password.trim() || !confirm.trim()) {
            setModalInfo({
                isOpen: true,
                message: "Preencha os campos de senha.",
                type: "warning",
            });
            return;
        }

        if (password !== confirm) {
            setModalInfo({
                isOpen: true,
                message: "As senhas não coincidem.",
                type: "warning",
            });
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
                className="signin-step-cta"
                onClick={handleContinue}
            >
                Continuar
            </button>

            {/* O Modal é renderizado baseando-se no estado local */}
            <AlertModal
                isOpen={modalInfo.isOpen}
                message={modalInfo.message}
                type={modalInfo.type}
                cancelText="OK"
                onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
            />
        </div>
    );
}