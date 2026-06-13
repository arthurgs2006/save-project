import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import MobileCarousel from "../../components/generic_components/MobileCarousel";

import AccountHeader from "../../components/generic_components/accountHeader";
import PopupToast from "../../components/generic_components/PopupToast";
import TitleHeader from "../../components/generic_components/titleHeader";
import {
    getLessonBySlug,
    getRecommendedLessons,
} from "../../data/financialEducationContent";

import "./FinancialLesson.scss";

type User = {
    id?: string | number;
    nome?: string;
    name?: string;
};

export default function FinancialLesson() {
    const navigate = useNavigate();
    const { slug } = useParams();

    const storedUser = localStorage.getItem("loggedUser");
    const user: User | null = storedUser ? JSON.parse(storedUser) : null;

    const lesson = getLessonBySlug(slug);
    const nextLessons = lesson ? getRecommendedLessons(lesson.nextLessons) : [];
    const [toast, setToast] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "warning" | "danger" | "info";
    } | null>(null);

    useEffect(() => {
        if (!lesson) return;

        setToast({
            isOpen: true,
            message: `Aula carregada: ${lesson.title}`,
            type: "info",
        });

        const openedLessons: string[] = JSON.parse(localStorage.getItem("openedLessons") || "[]");
        if (!openedLessons.includes(lesson.slug)) {
            openedLessons.push(lesson.slug);
            localStorage.setItem("openedLessons", JSON.stringify(openedLessons));
            localStorage.setItem("lessonsOpened", String(openedLessons.length));
        }
    }, [lesson]);

    function getUserName() {
        return user?.nome || user?.name || "Usuário";
    }

    if (!lesson) {
        return (
            <main className="lesson-page">
                <Container className="lesson-container">
                    <AccountHeader name={getUserName()} />

                    <TitleHeader
                        title="Aula não encontrada"
                        backLink="/financial-education"
                    />

                    <section className="lesson-empty">
                        <i className="bi bi-journal-x"></i>
                        <h1>Conteúdo não encontrado</h1>
                        <p>
                            Essa aula ainda não existe ou o endereço foi digitado
                            incorretamente.
                        </p>

                        <button
                            type="button"
                            className="lesson-main-btn"
                            onClick={() => navigate("/financial-education")}
                        >
                            Voltar para Educação Financeira
                        </button>
                    </section>
                </Container>
            </main>
        );
    }

    return (
        <main className="lesson-page">
            <Container className="lesson-container">
                <AccountHeader name={getUserName()} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader
                        title={lesson.title}
                        backLink="/financial-education"
                    />

                    <section className="lesson-hero">
                        <div>
                            <span className="lesson-badge">{lesson.category}</span>

                            <h1>{lesson.title}</h1>

                            <p>{lesson.summary}</p>

                            <div className="lesson-meta-row">
                                <span>{lesson.level}</span>
                                <span>{lesson.readingTime}</span>
                                <span>{lesson.tags.slice(0, 2).join(" • ")}</span>
                            </div>
                        </div>

                        <div className="lesson-hero-card">
                            <div
                                className="lesson-hero-icon"
                                style={{ backgroundColor: lesson.color }}
                            >
                                <i className={`bi ${lesson.icon}`}></i>
                            </div>

                            <strong>Como isso aparece no SaveApp</strong>

                            <p>{lesson.practicalUse}</p>
                        </div>
                    </section>

                    <section className="lesson-layout">
                        <article className="lesson-content">
                            <div className="lesson-intro-card">
                                <span className="lesson-badge secondary">
                                    Visão geral
                                </span>

                                <h2>Antes de começar</h2>

                                <p>{lesson.description}</p>
                            </div>

                            {lesson.sections.map((section, index) => (
                                <section className="lesson-section" key={section.title}>
                                    <span className="lesson-section-index">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <h2>{section.title}</h2>

                                    {section.content.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </section>
                            ))}

                            <section className="lesson-example-card">
                                <div>
                                    <span className="lesson-badge example">
                                        Exemplo prático
                                    </span>

                                    <h2>{lesson.example.title}</h2>

                                    <p>{lesson.example.description}</p>
                                </div>

                                <div className="lesson-example-list">
                                    {lesson.example.items.map((item) => (
                                        <div key={item}>
                                            <i className="bi bi-check2-circle"></i>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="lesson-two-columns">
                                <div className="lesson-list-card mistakes">
                                    <span className="lesson-badge danger">
                                        Erros comuns
                                    </span>

                                    <h2>O que evitar</h2>

                                    {lesson.commonMistakes.map((mistake) => (
                                        <div key={mistake}>
                                            <i className="bi bi-x-circle"></i>
                                            <span>{mistake}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="lesson-list-card checklist">
                                    <span className="lesson-badge success">
                                        Checklist
                                    </span>

                                    <h2>Como aplicar</h2>

                                    {lesson.checklist.map((item) => (
                                        <div key={item}>
                                            <i className="bi bi-check-circle"></i>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {nextLessons.length > 0 && (
                                <section className="lesson-next-section">
                                    <div className="lesson-section-header">
                                        <span className="lesson-badge secondary">
                                            Próximo passo
                                        </span>
                                        <h2>Continue aprendendo</h2>
                                    </div>

                                    <MobileCarousel className="lesson-next-carousel">
                                        {nextLessons.map((item) => (
                                            <button
                                                key={item.slug}
                                                type="button"
                                                className="lesson-next-card"
                                                onClick={() =>
                                                    navigate(
                                                        `/financial-education/${item.slug}`
                                                    )
                                                }
                                            >
                                                <div
                                                    className="lesson-next-icon"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    <i className={`bi ${item.icon}`}></i>
                                                </div>

                                                <div>
                                                    <span>{item.category}</span>
                                                    <strong>{item.title}</strong>
                                                    <small>{item.readingTime}</small>
                                                </div>
                                            </button>
                                        ))}
                                    </MobileCarousel>
                                </section>
                            )}
                        </article>

                        <aside className="lesson-sidebar">
                            <div className="lesson-sidebar-card">
                                <span className="lesson-badge secondary">
                                    Resumo da aula
                                </span>

                                <h3>{lesson.title}</h3>

                                <p>{lesson.summary}</p>

                                <div className="lesson-sidebar-meta">
                                    <div>
                                        <span>Nível</span>
                                        <strong>{lesson.level}</strong>
                                    </div>

                                    <div>
                                        <span>Tempo</span>
                                        <strong>{lesson.readingTime}</strong>
                                    </div>
                                </div>

                                <div className="lesson-tags">
                                    {lesson.tags.map((tag) => (
                                        <span key={tag}>{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="lesson-sidebar-card">
                                <span className="lesson-badge practical">
                                    Aplicação
                                </span>

                                <h3>No SaveApp</h3>

                                <p>{lesson.practicalUse}</p>

                                <button
                                    type="button"
                                    className="lesson-secondary-btn full"
                                    onClick={() => navigate("/homescreen")}
                                >
                                    Voltar para Home
                                </button>
                            </div>
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