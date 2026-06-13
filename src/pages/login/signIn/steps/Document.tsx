import { useState } from "react";
import AlertModal from "../../../../components/generic_components/AlertModal";
import "./signInSteps.scss";

type DocumentProps = {
    onNext: (data: { cpf: string }) => void;
};

export default function Document({ onNext }: DocumentProps) {
    const [cpf, setCpf] = useState("");

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
        if (!cpf.trim()) {
            setModalInfo({
                isOpen: true,
                message: "Informe seu CPF.",
                type: "warning",
            });
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
                className="signin-step-cta"
                onClick={handleContinue}
            >
                Continuar
            </button>

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
