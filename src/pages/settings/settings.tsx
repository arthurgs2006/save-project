import { Container } from "reactstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import TitleHeader from "../../components/generic_components/titleHeader";
import AccountHeader from "../../components/generic_components/accountHeader";
import "./Settings.scss";

type SettingsItem = {
    title: string;
    description: string;
    icon: string;
    path: string;
    badge?: string;
};

const serviceSettings: SettingsItem[] = [
    {
        title: "Conta",
        description: "Gerencie email, senha, telefone e dados principais.",
        icon: "bi-person-circle",
        path: "/profile",
    },
    {
        title: "Segurança (2FA)",
        description: "Ative ou desative a autenticação em duas etapas via e-mail.",
        icon: "bi-shield-lock-fill",
        path: "/security", 
        badge: "Recomendado"
    },
    {
        title: "Perfil de investimentos",
        description: "Ajuste seu perfil conservador, moderado ou agressivo.",
        icon: "bi-graph-up-arrow",
        path: "/profile",
        badge: "Financeiro",
    },
    {
        title: "Notificações",
        description: "Controle lembretes de metas, recorrentes e movimentações.",
        icon: "bi-bell-fill",
        path: "/profile",
    },
];

const appSettings: SettingsItem[] = [
    {
        title: "Editar dados do perfil",
        description: "Atualize informações pessoais e financeiras.",
        icon: "bi-pencil-square",
        path: "/profile",
    },
    {
        title: "Aparência",
        description: "Configure tema, moeda principal e preferências visuais.",
        icon: "bi-palette-fill",
        path: "/profile",
    },
    {
        title: "Ajuda",
        description: "Veja orientações sobre o uso do SaveApp.",
        icon: "bi-question-circle-fill",
        path: "/help",
    },
];

export default function Settings() {
    const storedUser = localStorage.getItem("loggedUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.nome || user?.name || "Usuário";
    const userEmail = user?.email || "Email não informado";
    const firstName = userName.split(" ")[0];

    function renderSettingsCard(item: SettingsItem, index: number) {
        return (
            <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
            >
                <Link to={item.path} className="settings-card">
                    <div className="settings-card-left">
                        <div className="settings-card-icon">
                            <i className={`bi ${item.icon}`}></i>
                        </div>

                        <div>
                            <div className="settings-card-title-row">
                                <h3>{item.title}</h3>

                                {item.badge && (
                                    <span className="settings-card-badge">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <p>{item.description}</p>
                        </div>
                    </div>

                    <i className="bi bi-chevron-right settings-card-arrow"></i>
                </Link>
            </motion.div>
        );
    }

    return (
        <main className="settings-page">
            <Container className="settings-container">
                <AccountHeader name={userName} showSettingsButton={false} showUserGreeting={false} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Configurações" showCreateButton={false} />

                    <section className="settings-hero">
                        <div>
                            <span className="settings-badge">Central do usuário</span>
                            <h1>Olá, {firstName}</h1>
                            <p>
                                Personalize sua conta, segurança, preferências financeiras
                                e aparência do SaveApp em um só lugar.
                            </p>
                        </div>

                        <div className="settings-user-card">
                            <div className="settings-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <span>Conta conectada</span>
                                <strong>{userName}</strong>
                                <small>{userEmail}</small>
                            </div>
                        </div>
                    </section>

                    <section className="settings-layout">
                        <div className="settings-section">
                            <div className="settings-section-header">
                                <span className="settings-badge secondary">Serviços</span>
                                <h2>Conta e finanças</h2>
                                <p>
                                    Ajustes ligados ao seu cadastro, segurança, renda,
                                    metas e perfil financeiro.
                                </p>
                            </div>

                            <div className="settings-list">
                                {serviceSettings.map(renderSettingsCard)}
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="settings-section-header">
                                <span className="settings-badge muted">Aplicativo</span>
                                <h2>Preferências do app</h2>
                                <p>
                                    Configure como você quer visualizar e usar o SaveApp
                                    no dia a dia.
                                </p>
                            </div>

                            <div className="settings-list">
                                {appSettings.map(renderSettingsCard)}
                            </div>
                        </div>
                    </section>
                </motion.div>
            </Container>
        </main>
    );
}