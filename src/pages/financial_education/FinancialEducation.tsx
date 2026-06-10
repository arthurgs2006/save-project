import { useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AccountHeader from "../../components/generic_components/accountHeader";
import MobileCarousel from "../../components/generic_components/MobileCarousel";
import PopupToast from "../../components/generic_components/PopupToast";
import TitleHeader from "../../components/generic_components/titleHeader";
import { financialEducationLessons } from "../../data/financialEducationContent";

import "./FinancialEducation.scss";

type User = {
    id?: string | number;
    nome?: string;
    name?: string;
};

const modules = financialEducationLessons;

const categoryOptions = [
    "Todos",
    "Fundamentos",
    "Controle financeiro",
    "Recorrentes",
    "Segurança financeira",
    "Metas",
    "Saques",
    "Crédito",
    "Investimentos",
];

export default function FinancialEducation() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [selectedModule, setSelectedModule] = useState(modules[0] || null);
    const [toast, setToast] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "warning" | "danger" | "info";
    } | null>(null);

    const storedUser = localStorage.getItem("loggedUser");
    const user: User | null = storedUser ? JSON.parse(storedUser) : null;

    const filteredModules = useMemo(() => {
        const term = search.trim().toLowerCase();

        return modules.filter((module) => {
            const matchesCategory =
                category === "Todos" || module.category === category;

            const searchable = [
                module.title,
                module.category,
                module.level,
                module.summary,
                module.description,
                module.practicalUse,
                ...module.tags,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch = !term || searchable.includes(term);

            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    const recommendedModules = useMemo(() => {
        return modules.filter((module) =>
            [
                "orcamento-mensal",
                "gastos-fixos-recorrentes",
                "planejamento-de-metas",
            ].includes(module.slug)
        );
    }, []);

    function getUserName() {
        return user?.nome || user?.name || "Usuário";
    }

    function handleSelectModule(module: typeof modules[0]) {
        setSelectedModule(module);
        setToast({
            isOpen: true,
            message: `Trilha selecionada: ${module.title}`,
            type: "success",
        });
    }

    return (
        <main className="education-page">
            <Container className="education-container">
                <AccountHeader name={getUserName()} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader
                        title="Educação Financeira"
                        backLink="/homescreen"
                    />

                    <section className="education-hero">
                        <div>
                            <span className="education-badge">
                                Academia SaveApp
                            </span>

                            <h1>Aprenda a entender o seu dinheiro de verdade</h1>

                            <p>
                                Conteúdos práticos para conectar o que você faz no app
                                com decisões financeiras melhores: saldo, gastos, metas,
                                recorrentes, cartão e investimentos.
                            </p>

                            <div className="education-hero-actions">
                                <button
                                    type="button"
                                    className="education-main-btn"
                                    onClick={() => {
                                        document
                                            .getElementById("education-modules")
                                            ?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    Começar agora
                                </button>

                                <button
                                    type="button"
                                    className="education-secondary-btn"
                                    onClick={() => navigate("/homescreen")}
                                >
                                    Voltar para Home
                                </button>
                            </div>
                        </div>

                        <div className="education-hero-card">
                            <span>Trilha recomendada</span>
                            <strong>Controle financeiro prático</strong>
                            <p>
                                Comece por orçamento mensal, gastos recorrentes e metas
                                financeiras.
                            </p>
                        </div>
                    </section>

                    <section className="education-recommended">
                        <div className="education-section-header">
                            <div>
                                <span className="education-badge secondary">
                                    Para começar
                                </span>
                                <h2>Trilha inicial recomendada</h2>
                            </div>
                        </div>

                        <MobileCarousel className="education-recommended-carousel">
                            {recommendedModules.map((module) => (
                                <button
                                    type="button"
                                    key={module.id}
                                    className="education-recommended-card"
                                    onClick={() => handleSelectModule(module)}
                                >
                                    <div
                                        className="education-module-icon"
                                        style={{ backgroundColor: module.color }}
                                    >
                                        <i className={`bi ${module.icon}`}></i>
                                    </div>

                                    <div>
                                        <span>{module.category}</span>
                                        <strong>{module.title}</strong>
                                        <small>{module.readingTime}</small>
                                    </div>
                                </button>
                            ))}
                        </MobileCarousel>
                    </section>

                    <section className="education-toolbar" id="education-modules">
                        <div className="education-search">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por metas, reserva, recorrentes, investimentos..."
                            />
                        </div>

                        <div className="education-category-list">
                            {categoryOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={category === option ? "active" : ""}
                                    onClick={() => setCategory(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="education-layout">
                        <div className="education-modules-list">
                            {filteredModules.length === 0 ? (
                                <div className="education-empty">
                                    <i className="bi bi-search"></i>
                                    <h3>Nenhum conteúdo encontrado</h3>
                                    <p>Tente buscar por outro termo ou categoria.</p>
                                </div>
                            ) : (
                                filteredModules.map((module) => (
                                    <article
                                        key={module.id}
                                        className={`education-module-card ${
                                            selectedModule?.id === module.id ? "active" : ""
                                        }`}
                                        onClick={() => handleSelectModule(module)}
                                    >
                                        <div className="education-module-top">
                                            <div
                                                className="education-module-icon"
                                                style={{ backgroundColor: module.color }}
                                            >
                                                <i className={`bi ${module.icon}`}></i>
                                            </div>

                                            <div>
                                                <span>{module.category}</span>
                                                <h3>{module.title}</h3>
                                            </div>
                                        </div>

                                        <p>{module.summary}</p>

                                        <div className="education-module-meta">
                                            <span>{module.level}</span>
                                            <span>{module.readingTime}</span>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        {/* Overlay — fecha o painel ao clicar fora no mobile */}
                        {selectedModule && (
                            <div
                                className="education-detail-overlay"
                                onClick={() => setSelectedModule(null)}
                            />
                        )}

                        <aside className={`education-detail-card ${selectedModule ? "active" : ""}`}>
                            {selectedModule ? (
                                <>
                                    <div
                                        className="education-detail-icon"
                                        style={{ backgroundColor: selectedModule.color }}
                                    >
                                        <i className={`bi ${selectedModule.icon}`}></i>
                                    </div>

                                    <span className="education-badge secondary">
                                        {selectedModule.category}
                                    </span>

                                    <h2>{selectedModule.title}</h2>

                                    <p className="education-detail-summary">
                                        {selectedModule.summary}
                                    </p>

                                    <div className="education-detail-meta">
                                        <div>
                                            <span>Nível</span>
                                            <strong>{selectedModule.level}</strong>
                                        </div>
                                        <div>
                                            <span>Leitura</span>
                                            <strong>{selectedModule.readingTime}</strong>
                                        </div>
                                    </div>

                                    <div className="education-concept-box">
                                        <strong>O que você vai entender</strong>
                                        <p>{selectedModule.description}</p>
                                    </div>

                                    <div className="education-concept-box practical">
                                        <strong>Como isso se aplica no SaveApp</strong>
                                        <p>{selectedModule.practicalUse}</p>
                                    </div>

                                    <div className="education-tags">
                                        {selectedModule.tags.map((tag) => (
                                            <span key={tag}>{tag}</span>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="education-main-btn full"
                                        onClick={() =>
                                            navigate(`/financial-education/${selectedModule.slug}`)
                                        }
                                    >
                                        Abrir aula completa
                                    </button>
                                </>
                            ) : (
                                <div className="education-empty">
                                    <i className="bi bi-journal-text"></i>
                                    <h3>Selecione um módulo</h3>
                                    <p>Escolha um conteúdo para ver os detalhes.</p>
                                </div>
                            )}
                        </aside>
                    </section>

                    {toast && (
                        <PopupToast
                            isOpen={toast.isOpen}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast(null)}
                        />
                    )}
                </motion.div>
            </Container>
        </main>
    );
}