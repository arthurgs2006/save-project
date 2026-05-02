import { useState } from "react";

type AcademicSituationProps = {
    onNext: (data: {
        isStudent: "sim" | "nao";
        institution?: string;
        course?: string;
        period?: string;
    }) => void;
    onBack: () => void;
    data?: {
        isStudent?: "sim" | "nao";
        institution?: string;
        course?: string;
        period?: string;
    };
};

export default function AcademicSituation({
    onNext,
    onBack,
    data
}: AcademicSituationProps) {
    const [isStudent, setIsStudent] = useState<"sim" | "nao" | "">(
        data?.isStudent || ""
    );
    const [institution, setInstitution] = useState(data?.institution || "");
    const [course, setCourse] = useState(data?.course || "");
    const [period, setPeriod] = useState(data?.period || "");

    function handleContinue() {
        if (!isStudent) {
            alert("Selecione sua situação acadêmica.");
            return;
        }

        if (isStudent === "sim") {
            if (!institution.trim() || !course.trim() || !period.trim()) {
                alert("Preencha instituição, curso e período.");
                return;
            }
        }

        onNext({
            isStudent,
            institution: isStudent === "sim" ? institution.trim() : "",
            course: isStudent === "sim" ? course.trim() : "",
            period: isStudent === "sim" ? period.trim() : ""
        });
    }

    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Situação acadêmica</h3>
                <p className="home-item-subtitle mb-0">
                    Você está matriculado em uma instituição de ensino?
                </p>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="student"
                        checked={isStudent === "sim"}
                        onChange={() => setIsStudent("sim")}
                    />
                    <span className="text-white">Sim</span>
                </label>

                <label className="home-list-item border-0 p-3 d-flex align-items-center gap-2">
                    <input
                        type="radio"
                        name="student"
                        checked={isStudent === "nao"}
                        onChange={() => setIsStudent("nao")}
                    />
                    <span className="text-white">Não</span>
                </label>
            </div>

            {isStudent === "sim" && (
                <>
                    <div className="mb-4 text-start">
                        <label className="fw-semibold text-white mb-2 d-block">
                            Nome da instituição
                        </label>
                        <input
                            type="text"
                            className="form-control custom-input-balance"
                            placeholder="Digite o nome da instituição"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                        />
                    </div>

                    <div className="mb-4 text-start">
                        <label className="fw-semibold text-white mb-2 d-block">
                            Curso
                        </label>
                        <input
                            type="text"
                            className="form-control custom-input-balance"
                            placeholder="Digite seu curso"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        />
                    </div>

                    <div className="mb-4 text-start">
                        <label className="fw-semibold text-white mb-2 d-block">
                            Período
                        </label>
                        <input
                            type="text"
                            className="form-control custom-input-balance"
                            placeholder="Ex: 1º, 2º, 3º"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>
                </>
            )}

            <div className="d-flex gap-3">
                <button
                    type="button"
                    className="btn btn-outline-light w-50 py-3"
                    style={{ borderRadius: "999px" }}
                    onClick={onBack}
                >
                    Voltar
                </button>

                <button
                    type="button"
                    className="btn btn-primary w-50 fw-semibold py-3"
                    style={{ borderRadius: "999px", fontSize: "0.98rem" }}
                    onClick={handleContinue}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}