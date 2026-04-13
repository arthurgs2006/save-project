type BenefitsIntroProps = {
    onNext: () => void;
};

export default function BenefitsIntro({ onNext }: BenefitsIntroProps) {
    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">
                    Descubra benefícios disponíveis para você
                </h3>
                <p className="home-item-subtitle mb-0">
                    Responda algumas perguntas e veja quais benefícios podem se
                    encaixar no seu perfil.
                </p>
            </div>

            <button
                type="button"
                className="btn btn-primary w-100 fw-semibold py-3"
                style={{ borderRadius: "999px", fontSize: "0.98rem" }}
                onClick={onNext}
            >
                Começar
            </button>
        </div>
    );
}