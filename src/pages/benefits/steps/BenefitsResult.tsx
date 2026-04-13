type BenefitsResultProps = {
    onBack: () => void;
    data: {
        isStudent?: "sim" | "nao";
        institution?: string;
        course?: string;
        period?: string;
        workStatus?: "nao_trabalho" | "informal" | "registrado";
        householdSize?: string;
        housing?: "pais" | "sozinho" | "republica" | "aluguel" | "propria";
        farFromInstitution?: "sim" | "nao";
    };
};

export default function BenefitsResult({
    onBack,
    data
}: BenefitsResultProps) {
    return (
        <div className="w-100">
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Resultado</h3>
                <p className="home-item-subtitle mb-0">
                    Com base nas suas respostas, os benefícios disponíveis serão
                    exibidos aqui futuramente.
                </p>
            </div>

            <div className="home-empty-state mt-3 mb-4">
                <p className="mb-2 text-white fw-semibold">
                    Respostas enviadas:
                </p>

                <div className="text-start home-item-subtitle" style={{ lineHeight: 1.8 }}>
                    <div>
                        <strong>Situação acadêmica:</strong> {data.isStudent || "-"}
                    </div>
                    <div>
                        <strong>Instituição:</strong> {data.institution || "-"}
                    </div>
                    <div>
                        <strong>Curso:</strong> {data.course || "-"}
                    </div>
                    <div>
                        <strong>Período:</strong> {data.period || "-"}
                    </div>
                    <div>
                        <strong>Situação profissional:</strong> {data.workStatus || "-"}
                    </div>
                    <div>
                        <strong>Pessoas no domicílio:</strong> {data.householdSize || "-"}
                    </div>
                    <div>
                        <strong>Moradia:</strong> {data.housing || "-"}
                    </div>
                    <div>
                        <strong>Mora longe da instituição:</strong> {data.farFromInstitution || "-"}
                    </div>
                </div>
            </div>

            <div className="home-empty-state mb-4">
                A lógica de recomendação dos benefícios pode ser conectada no
                backend depois. Por enquanto, esta tela já coleta e organiza
                todas as respostas do usuário.
            </div>

            <button
                type="button"
                className="btn btn-outline-light w-100 py-3"
                style={{ borderRadius: "999px" }}
                onClick={onBack}
            >
                Voltar
            </button>
        </div>
    );
}