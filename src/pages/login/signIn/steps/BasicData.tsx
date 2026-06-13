import { useState } from "react";
import AlertModal from "../../../../components/generic_components/AlertModal";
import "./signInSteps.scss";

type BasicDataProps = {
    onNext: (data: {
        name: string;
        email: string;
        phone: string;
    }) => void;
};

export default function BasicData({ onNext }: BasicDataProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

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
        if (!name.trim()) {
            setModalInfo({
                isOpen: true,
                message: "Informe seu nome completo.",
                type: "warning",
            });
            return;
        }

        if (!email.trim()) {
            setModalInfo({
                isOpen: true,
                message: "Informe seu email.",
                type: "warning",
            });
            return;
        }

        onNext({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim()
        });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Dados básicos</h3>
                <p className="home-item-subtitle mb-0">
                    Informe seus dados principais para continuar.
                </p>
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Nome completo
                </label>
                <input
                    type="text"
                    className="form-control custom-input-balance"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Email
                </label>
                <input
                    type="email"
                    className="form-control custom-input-balance"
                    placeholder="@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-4 text-start">
                <label className="fw-semibold text-white mb-2 d-block">
                    Telefone
                </label>
                <input
                    type="text"
                    className="form-control custom-input-balance"
                    placeholder="Opcional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
