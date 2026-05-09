import { useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import "./Help.scss";

type HelpCategory = "all" | "account" | "transactions" | "goals" | "investments" | "security";

type FaqItem = {
    id: number;
    category: Exclude<HelpCategory, "all">;
    question: string;
    answer: string;
};

const categories: { id: HelpCategory; label: string; icon: string }[] = [
    { id: "all", label: "Todas", icon: "bi-grid-fill" },
    { id: "account", label: "Conta", icon: "bi-person-circle" },
    { id: "transactions", label: "Movimentações", icon: "bi-arrow-left-right" },
    { id: "goals", label: "Metas", icon: "bi-bullseye" },
    { id: "investments", label: "Investimentos", icon: "bi-graph-up-arrow" },
    { id: "security", label: "Segurança", icon: "bi-shield-lock-fill" },
];

const faqItems: FaqItem[] = [
    {
        id: 1,
        category: "account",
        question: "Como altero meus dados pessoais?",
        answer:
            "Acesse Configurações > Conta ou Perfil. Lá você pode alterar nome, email, telefone, renda mensal, perfil financeiro e preferências do aplicativo.",
    },
    {
        id: 2,
        category: "account",
        question: "Onde altero minha renda mensal?",
        answer:
            "Entre na página de Perfil e abra a seção Dados financeiros. A renda mensal ajuda o SaveApp a gerar previsões, metas e insights mais personalizados.",
    },
    {
        id: 3,
        category: "transactions",
        question: "Qual a diferença entre depósito e saque?",
        answer:
            "Depósito adiciona dinheiro ao saldo. Saque registra uma saída e reduz o saldo. Ambos ficam salvos no histórico de movimentações.",
    },
    {
        id: 4,
        category: "transactions",
        question: "Como exportar meu extrato em PDF?",
        answer:
            "Acesse o Histórico de Movimentações, escolha os filtros desejados e clique em Exportar PDF. O arquivo será gerado com resumo, totais e registros do período.",
    },
    {
        id: 5,
        category: "transactions",
        question: "O que são recorrentes?",
        answer:
            "Recorrentes são entradas ou saídas que acontecem com frequência, como salário, assinatura, academia, internet ou mensalidade.",
    },
    {
        id: 6,
        category: "transactions",
        question: "Consigo editar um recorrente?",
        answer:
            "Sim. Acesse a página de Recorrentes, encontre o item desejado e clique em Editar. Você poderá alterar nome, valor, categoria, frequência e data.",
    },
    {
        id: 7,
        category: "goals",
        question: "Como criar uma meta?",
        answer:
            "Acesse Metas, preencha nome, valor alvo, valor atual, prazo, categoria e prioridade. O SaveApp calcula o progresso e mostra previsões.",
    },
    {
        id: 8,
        category: "goals",
        question: "Como funciona o progresso das metas?",
        answer:
            "O progresso é calculado comparando o valor atual com o valor alvo. Por exemplo, se a meta é R$ 1.000 e você guardou R$ 250, o progresso será 25%.",
    },
    {
        id: 9,
        category: "goals",
        question: "Posso adicionar dinheiro em uma meta?",
        answer:
            "Sim. Você pode fazer isso pela própria página de Metas ou pela tela de Depósito, escolhendo uma meta como destino do valor.",
    },
    {
        id: 10,
        category: "investments",
        question: "O simulador de investimentos é uma recomendação real?",
        answer:
            "Não. O simulador é educativo e mostra projeções estimadas com base nos dados informados. Ele não substitui orientação profissional.",
    },
    {
        id: 11,
        category: "investments",
        question: "O que significam os perfis conservador, moderado e agressivo?",
        answer:
            "Conservador prioriza segurança. Moderado busca equilíbrio entre risco e retorno. Agressivo aceita maior oscilação em troca de potencial maior de crescimento.",
    },
    {
        id: 12,
        category: "security",
        question: "Minha senha fica segura?",
        answer:
            "Para um sistema real, a senha deve ser protegida no back-end com criptografia/hash. No contexto do TCC, a tela demonstra o fluxo de alteração conforme a estrutura atual do projeto.",
    },
    {
        id: 13,
        category: "security",
        question: "O que acontece se eu sair da conta?",
        answer:
            "Ao sair, os dados do usuário logado são removidos da sessão local. Ao entrar novamente, o SaveApp carrega os dados salvos da conta.",
    },
];

export default function Help() {
    const [activeCategory, setActiveCategory] = useState<HelpCategory>("all");
    const [search, setSearch] = useState("");
    const [openId, setOpenId] = useState<number | null>(1);

    const storedUser = localStorage.getItem("loggedUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.nome || user?.name || "Usuário";
    const firstName = userName.split(" ")[0];

    const filteredFaqs = useMemo(() => {
        return faqItems.filter((item) => {
            const matchesCategory =
                activeCategory === "all" || item.category === activeCategory;

            const text = `${item.question} ${item.answer}`.toLowerCase();
            const matchesSearch = text.includes(search.trim().toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, search]);

    function toggleFaq(id: number) {
        setOpenId((current) => (current === id ? null : id));
    }

    return (
        <main className="help-page">
            <Container className="help-container">
                <AccountHeader name={userName} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Ajuda" />

                    <section className="help-hero">
                        <div className="help-hero-copy">
                            <span className="help-badge">Central de suporte</span>
                            <h1>Como podemos ajudar, {firstName}?</h1>
                            <p>
                                Tire dúvidas sobre conta, movimentações, metas, recorrentes,
                                investimentos e segurança dentro do SaveApp.
                            </p>
                        </div>

                        <div className="help-hero-card">
                            <div className="help-hero-icon">
                                <i className="bi bi-question-circle-fill"></i>
                            </div>

                            <div>
                                <span>Dúvidas frequentes</span>
                                <strong>{faqItems.length} respostas</strong>
                                <small>Guias rápidos para usar melhor o aplicativo.</small>
                            </div>
                        </div>
                    </section>

                    <section className="help-search-card">
                        <div className="help-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por depósito, saque, metas, senha..."
                            />
                        </div>

                        <div className="help-category-list">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={activeCategory === category.id ? "active" : ""}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    <i className={`bi ${category.icon}`}></i>
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="help-layout">
                        <div className="help-faq-section">
                            <div className="help-section-header">
                                <span className="help-badge secondary">FAQ</span>
                                <h2>Perguntas frequentes</h2>
                                <p>
                                    Encontre respostas rápidas para as principais funções do
                                    SaveApp.
                                </p>
                            </div>

                            <div className="help-faq-list">
                                {filteredFaqs.length === 0 ? (
                                    <div className="help-empty">
                                        <i className="bi bi-search"></i>
                                        <h3>Nenhuma resposta encontrada</h3>
                                        <p>
                                            Tente buscar por outro termo ou escolha uma categoria
                                            diferente.
                                        </p>
                                    </div>
                                ) : (
                                    filteredFaqs.map((item) => (
                                        <article
                                            key={item.id}
                                            className={`help-faq-item ${
                                                openId === item.id ? "open" : ""
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleFaq(item.id)}
                                            >
                                                <span>{item.question}</span>
                                                <i
                                                    className={`bi ${
                                                        openId === item.id
                                                            ? "bi-chevron-up"
                                                            : "bi-chevron-down"
                                                    }`}
                                                ></i>
                                            </button>

                                            {openId === item.id && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {item.answer}
                                                </motion.p>
                                            )}
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>

                        <aside className="help-side-card">
                            <span className="help-badge">Guia rápido</span>
                            <h2>Primeiros passos</h2>

                            <div className="help-steps">
                                <div>
                                    <strong>1</strong>
                                    <p>Atualize seus dados no Perfil.</p>
                                </div>

                                <div>
                                    <strong>2</strong>
                                    <p>Registre depósitos e saques.</p>
                                </div>

                                <div>
                                    <strong>3</strong>
                                    <p>Crie metas financeiras.</p>
                                </div>

                                <div>
                                    <strong>4</strong>
                                    <p>Cadastre recorrentes para previsões melhores.</p>
                                </div>
                            </div>

                            <div className="help-warning">
                                <i className="bi bi-info-circle"></i>
                                <p>
                                    As informações do SaveApp são educativas e auxiliam na
                                    organização financeira.
                                </p>
                            </div>
                        </aside>
                    </section>
                </motion.div>
            </Container>
        </main>
    );
}