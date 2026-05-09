import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./Profile.scss";

type RiskProfile = "conservador" | "moderado" | "agressivo";
type ThemePreference = "dark" | "light";
type CurrencyPreference = "BRL" | "USD" | "EUR";

interface User {
    id: number | string;
    nome?: string;
    name?: string;
    email?: string;
    telefone?: string;
    phone?: string;
    senha?: string;
    password?: string;
    saldo_final?: number;
    receita?: number;
    renda?: number;
    fixedExpenses?: number;
    financialGoal?: string;
    riskProfile?: RiskProfile;
    emergencyReserveTarget?: number;
    themePreference?: ThemePreference;
    currencyPreference?: CurrencyPreference;
    notificationsEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
    extratos?: unknown[];
    goals?: unknown[];
    recurringDebts?: unknown[];
    recurringCredits?: unknown[];
}

type ActiveSection = "personal" | "financial" | "security" | "preferences";

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [activeSection, setActiveSection] = useState<ActiveSection>("personal");
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [fixedExpenses, setFixedExpenses] = useState("");
    const [financialGoal, setFinancialGoal] = useState("");
    const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderado");
    const [emergencyReserveTarget, setEmergencyReserveTarget] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [themePreference, setThemePreference] = useState<ThemePreference>("dark");
    const [currencyPreference, setCurrencyPreference] = useState<CurrencyPreference>("BRL");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) return;

            const parsedUser: User = JSON.parse(storedUser);
            hydrateForm(parsedUser);
            setUser(parsedUser);

            try {
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (!response.ok) return;

                const data: User = await response.json();

                hydrateForm(data);
                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível. Usando dados locais.");
            }
        }

        loadUser();
    }, []);

    const financialSummary = useMemo(() => {
        const income = Number(monthlyIncome || 0);
        const expenses = Number(fixedExpenses || 0);
        const available = income - expenses;
        const reserveTarget = Number(emergencyReserveTarget || 0);
        const balance = Number(user?.saldo_final || 0);

        const expenseRate = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;
        const reserveProgress =
            reserveTarget > 0 ? Math.min((balance / reserveTarget) * 100, 100) : 0;

        let insight = "Complete seus dados financeiros para receber uma leitura mais personalizada.";

        if (income > 0 && expenses > 0 && available > 0) {
            insight = "Sua renda cobre os gastos fixos. O próximo passo é manter consistência nas metas.";
        }

        if (income > 0 && expenses >= income) {
            insight = "Seus gastos fixos estão próximos ou acima da renda. Vale revisar despesas recorrentes.";
        }

        if (reserveTarget > 0 && reserveProgress >= 100) {
            insight = "Sua reserva planejada já está completa. Você pode focar em novas metas ou investimentos.";
        }

        return {
            income,
            expenses,
            available,
            expenseRate,
            reserveTarget,
            reserveProgress,
            insight,
        };
    }, [monthlyIncome, fixedExpenses, emergencyReserveTarget, user]);

    function hydrateForm(data: User) {
        setName(data.nome || data.name || "");
        setEmail(data.email || "");
        setPhone(data.telefone || data.phone || "");

        setMonthlyIncome(String(data.receita ?? data.renda ?? ""));
        setFixedExpenses(String(data.fixedExpenses ?? ""));
        setFinancialGoal(data.financialGoal || "");
        setRiskProfile(data.riskProfile || "moderado");
        setEmergencyReserveTarget(String(data.emergencyReserveTarget ?? ""));

        setThemePreference(data.themePreference || "dark");
        setCurrencyPreference(data.currencyPreference || "BRL");
        setNotificationsEnabled(data.notificationsEnabled ?? true);
    }

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getFirstName() {
        const fullName = name || user?.nome || user?.name || "Usuário";
        return fullName.split(" ")[0];
    }

    function getProfileLabel(profile: RiskProfile) {
        const map: Record<RiskProfile, string> = {
            conservador: "Conservador",
            moderado: "Moderado",
            agressivo: "Agressivo",
        };

        return map[profile];
    }

    function validatePersonalInfo() {
        if (!name.trim()) {
            showAlert("Digite seu nome.", "warning");
            return false;
        }

        if (!email.trim()) {
            showAlert("Digite seu email.", "warning");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showAlert("Digite um email válido.", "warning");
            return false;
        }

        return true;
    }

    function validateSecurity() {
        if (!currentPassword && !newPassword && !confirmPassword) return true;

        if (!newPassword || !confirmPassword) {
            showAlert("Preencha a nova senha e a confirmação.", "warning");
            return false;
        }

        if (newPassword.length < 6) {
            showAlert("A nova senha precisa ter pelo menos 6 caracteres.", "warning");
            return false;
        }

        if (newPassword !== confirmPassword) {
            showAlert("A confirmação da senha não confere.", "warning");
            return false;
        }

        const savedPassword = user?.senha || user?.password;

        if (savedPassword && currentPassword !== savedPassword) {
            showAlert("A senha atual está incorreta.", "danger");
            return false;
        }

        return true;
    }

    function buildUpdatedUser(): User {
        const passwordFields =
            newPassword.trim().length > 0
                ? {
                      senha: newPassword,
                      password: user?.password !== undefined ? newPassword : user?.password,
                  }
                : {};

        return {
            ...user,
            nome: name.trim(),
            name: user?.name !== undefined ? name.trim() : user?.name,
            email: email.trim(),
            telefone: phone.trim(),
            phone: user?.phone !== undefined ? phone.trim() : user?.phone,

            receita: Number(monthlyIncome || 0),
            renda: user?.renda !== undefined ? Number(monthlyIncome || 0) : user?.renda,
            fixedExpenses: Number(fixedExpenses || 0),
            financialGoal: financialGoal.trim(),
            riskProfile,
            emergencyReserveTarget: Number(emergencyReserveTarget || 0),

            themePreference,
            currencyPreference,
            notificationsEnabled,

            ...passwordFields,

            updatedAt: new Date().toISOString(),
        } as User;
    }

    async function saveProfile() {
        if (!user) {
            showAlert("Usuário não encontrado. Faça login novamente.", "danger");
            return;
        }

        if (!validatePersonalInfo()) return;
        if (!validateSecurity()) return;

        const updatedUser = buildUpdatedUser();

        try {
            setSaving(true);

            const response = await fetch(`${BASE_URL}/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar perfil");
            }

            const savedUser = await response.json();

            setUser(savedUser);
            hydrateForm(savedUser);
            localStorage.setItem("loggedUser", JSON.stringify(savedUser));

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            showAlert("Perfil atualizado com sucesso.", "success");
        } catch {
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            setUser(updatedUser);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            showAlert("Perfil salvo localmente. O servidor não respondeu agora.", "warning");
        } finally {
            setSaving(false);
        }
    }

    function showAlert(message: string, type: "success" | "danger" | "warning" | "info") {
        setAlert({
            isOpen: true,
            message,
            type,
        });
    }

    if (!user) {
        return (
            <main className="profile-page">
                <div className="profile-loading">Carregando perfil...</div>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <Container className="profile-container">
                <AccountHeader name={name || user.nome || user.name} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Perfil" />

                    <section className="profile-hero">
                        <div className="profile-hero-copy">
                            <span className="profile-badge">Conta SaveApp</span>
                            <h1>Olá, {getFirstName()}</h1>
                            <p>
                                Atualize seus dados, personalize suas preferências e mantenha
                                seu planejamento financeiro mais preciso.
                            </p>
                        </div>

                        <div className="profile-user-card">
                            <div className="profile-avatar">
                                {getFirstName().charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <span>Perfil financeiro</span>
                                <strong>{getProfileLabel(riskProfile)}</strong>
                                <small>{email || "Email não informado"}</small>
                            </div>
                        </div>
                    </section>

                    <section className="profile-overview-grid">
                        <div className="profile-overview-card">
                            <span>Saldo atual</span>
                            <strong>{formatCurrency(Number(user.saldo_final || 0))}</strong>
                        </div>

                        <div className="profile-overview-card">
                            <span>Renda mensal</span>
                            <strong>{formatCurrency(financialSummary.income)}</strong>
                        </div>

                        <div className="profile-overview-card">
                            <span>Gastos fixos</span>
                            <strong>{formatCurrency(financialSummary.expenses)}</strong>
                        </div>

                        <div className="profile-overview-card">
                            <span>Disponível estimado</span>
                            <strong
                                className={
                                    financialSummary.available >= 0 ? "positive" : "negative"
                                }
                            >
                                {formatCurrency(financialSummary.available)}
                            </strong>
                        </div>
                    </section>

                    <section className="profile-layout">
                        <aside className="profile-sidebar">
                            <button
                                className={activeSection === "personal" ? "active" : ""}
                                onClick={() => setActiveSection("personal")}
                            >
                                <i className="bi bi-person-fill"></i>
                                Dados pessoais
                            </button>

                            <button
                                className={activeSection === "financial" ? "active" : ""}
                                onClick={() => setActiveSection("financial")}
                            >
                                <i className="bi bi-wallet2"></i>
                                Dados financeiros
                            </button>

                            <button
                                className={activeSection === "security" ? "active" : ""}
                                onClick={() => setActiveSection("security")}
                            >
                                <i className="bi bi-shield-lock-fill"></i>
                                Segurança
                            </button>

                            <button
                                className={activeSection === "preferences" ? "active" : ""}
                                onClick={() => setActiveSection("preferences")}
                            >
                                <i className="bi bi-sliders"></i>
                                Preferências
                            </button>
                        </aside>

                        <section className="profile-content-card">
                            {activeSection === "personal" && (
                                <div>
                                    <div className="profile-section-header">
                                        <span className="profile-badge secondary">
                                            Identificação
                                        </span>
                                        <h2>Dados pessoais</h2>
                                        <p>
                                            Essas informações ajudam o SaveApp a personalizar sua
                                            experiência.
                                        </p>
                                    </div>

                                    <div className="profile-form-grid">
                                        <label>
                                            Nome completo
                                            <input
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                placeholder="Seu nome"
                                            />
                                        </label>

                                        <label>
                                            Email
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                placeholder="seuemail@email.com"
                                            />
                                        </label>

                                        <label>
                                            Telefone
                                            <input
                                                value={phone}
                                                onChange={(event) => setPhone(event.target.value)}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeSection === "financial" && (
                                <div>
                                    <div className="profile-section-header">
                                        <span className="profile-badge secondary">
                                            Planejamento
                                        </span>
                                        <h2>Dados financeiros</h2>
                                        <p>
                                            Essas informações deixam metas, investimentos e insights
                                            mais precisos.
                                        </p>
                                    </div>

                                    <div className="profile-form-grid">
                                        <label>
                                            Renda mensal
                                            <input
                                                type="number"
                                                min="0"
                                                value={monthlyIncome}
                                                onChange={(event) =>
                                                    setMonthlyIncome(event.target.value)
                                                }
                                                placeholder="Ex: 3000"
                                            />
                                        </label>

                                        <label>
                                            Gastos fixos mensais
                                            <input
                                                type="number"
                                                min="0"
                                                value={fixedExpenses}
                                                onChange={(event) =>
                                                    setFixedExpenses(event.target.value)
                                                }
                                                placeholder="Ex: 1200"
                                            />
                                        </label>

                                        <label>
                                            Objetivo financeiro principal
                                            <select
                                                value={financialGoal}
                                                onChange={(event) =>
                                                    setFinancialGoal(event.target.value)
                                                }
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="reserva">
                                                    Criar reserva de emergência
                                                </option>
                                                <option value="quitar-dividas">
                                                    Quitar dívidas
                                                </option>
                                                <option value="investir">
                                                    Começar a investir
                                                </option>
                                                <option value="comprar-bem">
                                                    Comprar um bem
                                                </option>
                                                <option value="organizar-financas">
                                                    Organizar finanças
                                                </option>
                                            </select>
                                        </label>

                                        <label>
                                            Perfil de investidor
                                            <select
                                                value={riskProfile}
                                                onChange={(event) =>
                                                    setRiskProfile(event.target.value as RiskProfile)
                                                }
                                            >
                                                <option value="conservador">Conservador</option>
                                                <option value="moderado">Moderado</option>
                                                <option value="agressivo">Agressivo</option>
                                            </select>
                                        </label>

                                        <label>
                                            Meta de reserva de emergência
                                            <input
                                                type="number"
                                                min="0"
                                                value={emergencyReserveTarget}
                                                onChange={(event) =>
                                                    setEmergencyReserveTarget(event.target.value)
                                                }
                                                placeholder="Ex: 10000"
                                            />
                                        </label>
                                    </div>

                                    <div className="profile-insight-box">
                                        <div>
                                            <strong>Insight financeiro</strong>
                                            <p>{financialSummary.insight}</p>
                                        </div>

                                        <div className="profile-progress-area">
                                            <span>Reserva</span>
                                            <strong>
                                                {financialSummary.reserveProgress.toFixed(0)}%
                                            </strong>
                                            <div className="profile-progress-track">
                                                <div
                                                    style={{
                                                        width: `${financialSummary.reserveProgress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "security" && (
                                <div>
                                    <div className="profile-section-header">
                                        <span className="profile-badge secondary">
                                            Proteção
                                        </span>
                                        <h2>Segurança da conta</h2>
                                        <p>
                                            Atualize sua senha de acesso. Use uma senha diferente de
                                            outras contas.
                                        </p>
                                    </div>

                                    <div className="profile-security-alert">
                                        <i className="bi bi-info-circle"></i>
                                        <p>
                                            Em um sistema real, senhas devem ser criptografadas no
                                            back-end. Para o TCC, essa alteração segue a estrutura
                                            atual do projeto.
                                        </p>
                                    </div>

                                    <div className="profile-form-grid">
                                        <label>
                                            Senha atual
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(event) =>
                                                    setCurrentPassword(event.target.value)
                                                }
                                                placeholder="Digite a senha atual"
                                            />
                                        </label>

                                        <label>
                                            Nova senha
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(event) =>
                                                    setNewPassword(event.target.value)
                                                }
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </label>

                                        <label>
                                            Confirmar nova senha
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) =>
                                                    setConfirmPassword(event.target.value)
                                                }
                                                placeholder="Repita a nova senha"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeSection === "preferences" && (
                                <div>
                                    <div className="profile-section-header">
                                        <span className="profile-badge secondary">
                                            Personalização
                                        </span>
                                        <h2>Preferências do app</h2>
                                        <p>
                                            Ajuste como você prefere visualizar informações dentro do
                                            SaveApp.
                                        </p>
                                    </div>

                                    <div className="profile-form-grid">
                                        <label>
                                            Tema preferido
                                            <select
                                                value={themePreference}
                                                onChange={(event) =>
                                                    setThemePreference(
                                                        event.target.value as ThemePreference
                                                    )
                                                }
                                            >
                                                <option value="dark">Escuro</option>
                                                <option value="light">Claro</option>
                                            </select>
                                        </label>

                                        <label>
                                            Moeda principal
                                            <select
                                                value={currencyPreference}
                                                onChange={(event) =>
                                                    setCurrencyPreference(
                                                        event.target.value as CurrencyPreference
                                                    )
                                                }
                                            >
                                                <option value="BRL">Real brasileiro</option>
                                                <option value="USD">Dólar</option>
                                                <option value="EUR">Euro</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="profile-toggle-row">
                                        <div>
                                            <strong>Notificações financeiras</strong>
                                            <p>
                                                Receber lembretes sobre metas, recorrentes e
                                                movimentações importantes.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className={notificationsEnabled ? "active" : ""}
                                            onClick={() =>
                                                setNotificationsEnabled((current) => !current)
                                            }
                                        >
                                            <span />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="profile-actions">
                                <button
                                    type="button"
                                    className="profile-secondary-btn"
                                    onClick={() => hydrateForm(user)}
                                    disabled={saving}
                                >
                                    Descartar alterações
                                </button>

                                <button
                                    type="button"
                                    className="profile-main-btn"
                                    onClick={saveProfile}
                                    disabled={saving}
                                >
                                    {saving ? "Salvando..." : "Salvar perfil"}
                                </button>
                            </div>
                        </section>
                    </section>
                </motion.div>
            </Container>

            {alert && (
                <AlertModal
                    isOpen={alert.isOpen}
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </main>
    );
}