import { useState } from "react";
import AlertModal from "../../../../components/generic_components/AlertModal";
import "./signInSteps.scss";

type TermsProps = {
    data: Record<string, unknown>;
    onFinish: () => void;
};

export default function Terms({ onFinish }: TermsProps) {
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [acceptedConsent, setAcceptedConsent] = useState(false);

    const [modalInfo, setModalInfo] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    }>({
        isOpen: false,
        message: "",
        type: "info",
    });

    function handleFinish() {
        if (!acceptedTerms || !acceptedPrivacy || !acceptedConsent) {
            setModalInfo({
                isOpen: true,
                message: "É necessário aceitar todos os termos para continuar.",
                type: "warning",
            });
            return;
        }

        onFinish();
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Termos</h3>
                <p className="home-item-subtitle mb-0">
                    Leia e aceite os termos para concluir seu cadastro.
                </p>
            </div>

            <div className="signin-terms-block text-start mb-4">
                <h5 className="fw-semibold text-white mb-2">Termos de Uso</h5>
                <p className="home-item-subtitle">
                    Ao utilizar esta aplicação, o usuário concorda em fornecer
                    informações verdadeiras e atualizadas durante o cadastro.
                    O uso da plataforma é destinado exclusivamente para fins
                    acadêmicos, no contexto deste Trabalho de Conclusão de Curso
                    (TCC). O usuário é responsável pela veracidade dos dados
                    informados e pelo uso adequado da aplicação.
                </p>

                <div className="form-check mt-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="acceptedTerms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <label className="form-check-label text-white" htmlFor="acceptedTerms">
                        Li e concordo com os termos
                    </label>
                </div>
            </div>

            <div className="signin-terms-block text-start mb-4">
                <h5 className="fw-semibold text-white mb-2">Política de Privacidade</h5>
                <p className="home-item-subtitle">
                    Esta aplicação coleta dados como nome, email, telefone, CPF
                    e informações financeiras com o objetivo de viabilizar o
                    funcionamento do sistema. Os dados fornecidos serão
                    armazenados de forma segura e utilizados exclusivamente para
                    fins acadêmicos e operacionais da aplicação. Nenhuma
                    informação será compartilhada com terceiros.
                </p>

                <div className="form-check mt-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="acceptedPrivacy"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    />
                    <label className="form-check-label text-white" htmlFor="acceptedPrivacy">
                        Li e concordo com os termos
                    </label>
                </div>
            </div>

            <div className="signin-terms-block text-start mb-4">
                <h5 className="fw-semibold text-white mb-2">
                    Consentimento de Uso de Dados
                </h5>
                <p className="home-item-subtitle">
                    Ao prosseguir com o cadastro, o usuário declara estar ciente
                    e autoriza a coleta e utilização de seus dados pessoais para
                    funcionamento da aplicação e desenvolvimento deste Trabalho
                    de Conclusão de Curso (TCC).
                </p>

                <div className="form-check mt-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="acceptedConsent"
                        checked={acceptedConsent}
                        onChange={(e) => setAcceptedConsent(e.target.checked)}
                    />
                    <label className="form-check-label text-white" htmlFor="acceptedConsent">
                        Li e concordo com os termos
                    </label>
                </div>
            </div>

            <button
                type="button"
                className="signin-step-cta"
                onClick={handleFinish}
            >
                Finalizar cadastro
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
