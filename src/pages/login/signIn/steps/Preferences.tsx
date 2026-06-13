import { useState } from "react";
import SelectGrid from "../../../../components/graphic_components/selectGrid";
import "./signInSteps.scss";

type PreferencesProps = {
    onNext: (data: { categories: string[] }) => void;
};

export default function Preferences({ onNext }: PreferencesProps) {
    const [categories, setCategories] = useState<string[]>([]);

    function handleContinue() {
        onNext({ categories });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Preferências de gastos</h3>
                <p className="home-item-subtitle mb-0">
                    Selecione as categorias com as quais você mais gasta.
                </p>
            </div>

            <div className="mb-4">
                <SelectGrid onChange={setCategories} />
            </div>

            <button
                type="button"
                className="signin-step-cta"
                onClick={handleContinue}
            >
                Continuar
            </button>
        </div>
    );
}