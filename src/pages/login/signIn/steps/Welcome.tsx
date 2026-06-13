import "./signInSteps.scss";

type WelcomeProps = {
    onNext: () => void;
};

export default function Welcome({ onNext }: WelcomeProps) {
    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Boas-vindas</h3>
                <p className="home-item-subtitle mb-0">
                    Crie sua conta para começar a usar a aplicação.
                </p>
            </div>

            <button
                type="button"
                className="signin-step-cta"
                onClick={onNext}
            >
                Criar uma conta
            </button>
        </div>
    );
}