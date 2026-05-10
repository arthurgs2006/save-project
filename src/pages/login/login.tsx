import React, { useState } from "react";
import {
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Button
} from "reactstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser'; 

import { hashPassword } from "../../utils/hashPassword";
import { BASE_URL } from "../../config";
import AlertModal from "../../components/generic_components/AlertModal";

// --- ADICIONADO O ESTADO login_2fa ---
type ViewState = "login" | "forgot_email" | "forgot_code" | "forgot_password" | "login_2fa";

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

    const [view, setView] = useState<ViewState>("login");
    
    const [resetEmail, setResetEmail] = useState("");
    const [resetUserId, setResetUserId] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState("");
    
    // --- NOVO ESTADO PARA SEGURAR O USUÁRIO ATÉ VALIDAR O 2FA ---
    const [pendingUser, setPendingUser] = useState<any>(null);

    // ======= FUNÇÃO DE LOGIN MODIFICADA PARA 2FA =======
    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const res = await fetch(`${BASE_URL}/users`);

            if (!res.ok) {
                setAlert({ isOpen: true, message: "Erro ao acessar servidor", type: "danger" });
                setLoading(false);
                return;
            }

            const users = await res.json();
            const hashedPassword = await hashPassword(password);

            const user = users.find(
                (u: any) => u.email === email && u.password === hashedPassword
            );

            if (!user) {
                setAlert({ isOpen: true, message: "Credenciais inválidas", type: "danger" });
                setLoading(false);
                return;
            }

            // VERIFICA SE O USUÁRIO TEM O 2FA ATIVADO
            if (user.twoFactorEnabled) {
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                
                await emailjs.send(
                    'service_9zcnplp',
                    'template_xarcgxe',
                    {
                        to_email: user.email,
                        to_name: user.nome || "Usuário",
                        verification_code: code
                    },
                    'JF1N4V11QJnbHW_0i'
                );

                setGeneratedCode(code);
                setPendingUser(user);
                setView("login_2fa");

                setAlert({ 
                    isOpen: true, 
                    message: "Código de autenticação enviado para o seu e-mail!", 
                    type: "info" 
                });
            } else {
                // Login direto se não tiver 2FA
                localStorage.setItem("loggedUser", JSON.stringify(user));
                navigate("/homescreen");
            }
        } catch (err) {
            setAlert({ isOpen: true, message: "Erro ao conectar ao servidor", type: "danger" });
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // ======= NOVA FUNÇÃO: VERIFICAR CÓDIGO 2FA =======
    function handleVerify2FA(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (inputCode.trim() !== generatedCode) {
            setAlert({ isOpen: true, message: "Código 2FA inválido ou incorreto.", type: "danger" });
            return;
        }

        // Se o código estiver correto, efetiva o login
        localStorage.setItem("loggedUser", JSON.stringify(pendingUser));
        navigate("/homescreen");
    }

    // ======= ETAPA 1: VERIFICAR EMAIL E ENVIAR CÓDIGO REAL =======
    async function handleVerifyEmail(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/users`);
            const users = await res.json();

            const user = users.find((u: any) => u.email === resetEmail);

            if (!user) {
                setAlert({ isOpen: true, message: "Este e-mail não está cadastrado.", type: "warning" });
                setLoading(false);
                return;
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            await emailjs.send(
                'service_9zcnplp',
                'template_xarcgxe',
                {
                    to_email: resetEmail,
                    to_name: user.nome || "Usuário",
                    verification_code: code
                },
                'JF1N4V11QJnbHW_0i'
            );

            setResetUserId(user.id);
            setGeneratedCode(code);
            setView("forgot_code");

            setAlert({ 
                isOpen: true, 
                message: "Código de verificação enviado com sucesso para o seu e-mail!", 
                type: "success" 
            });

        } catch (err) {
            console.error(err);
            setAlert({ isOpen: true, message: "Erro ao tentar enviar o e-mail.", type: "danger" });
        } finally {
            setLoading(false);
        }
    }

    // ======= ETAPA 2: VERIFICAR CÓDIGO DIGITADO (SENHA) =======
    function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (inputCode.trim() !== generatedCode) {
            setAlert({ isOpen: true, message: "Código inválido ou incorreto.", type: "danger" });
            return;
        }
        setView("forgot_password");
        setInputCode(""); 
    }

    // ======= ETAPA 3: SALVAR NOVA SENHA =======
    async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const form = e.currentTarget;
        const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
        const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

        if (newPassword !== confirmPassword) {
            setAlert({ isOpen: true, message: "As senhas não coincidem.", type: "warning" });
            return;
        }

        if (newPassword.length < 6) {
            setAlert({ isOpen: true, message: "A senha deve ter pelo menos 6 caracteres.", type: "warning" });
            return;
        }

        setLoading(true);
        try {
            const hashedPassword = await hashPassword(newPassword);

            const res = await fetch(`${BASE_URL}/users/${resetUserId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: hashedPassword, senha: newPassword }) 
            });

            if (!res.ok) throw new Error("Erro ao salvar nova senha");

            setAlert({ isOpen: true, message: "Senha alterada com sucesso! Faça login.", type: "success" });
            
            setView("login");
            setResetEmail("");
            setResetUserId(null);
            setGeneratedCode(null);
        } catch (err) {
            setAlert({ isOpen: true, message: "Erro ao atualizar a senha.", type: "danger" });
        } finally {
            setLoading(false);
        }
    }

    function cancelRecovery() {
        setView("login");
        setResetEmail("");
        setResetUserId(null);
        setGeneratedCode(null);
        setInputCode("");
        setPendingUser(null);
    }

    return (
        <main className="home-apple-screen text-white min-vh-100 d-flex align-items-center">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell py-4 py-md-5">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="d-flex justify-content-center"
                >
                    <div style={{ width: "100%", maxWidth: "460px" }}>
                        
                        {/* CABEÇALHOS DINÂMICOS */}
                        <div className="text-center mb-4">
                            {view === "login" && (
                                <>
                                    <p className="home-balance-label mb-2">Bem-vindo de volta</p>
                                    <h1 className="home-balance-value mb-2" style={{ fontSize: "clamp(2.3rem, 5vw, 3.4rem)", lineHeight: 1 }}>Entrar</h1>
                                    <p className="home-item-subtitle mb-0">Continue a experiência com sua conta</p>
                                </>
                            )}
                            {view === "forgot_email" && (
                                <>
                                    <p className="home-balance-label mb-2">Recuperação</p>
                                    <h1 className="home-balance-value mb-2" style={{ fontSize: "clamp(2.3rem, 5vw, 3.4rem)", lineHeight: 1 }}>Esqueceu a senha?</h1>
                                    <p className="home-item-subtitle mb-0">Informe seu e-mail para receber um código.</p>
                                </>
                            )}
                            {view === "forgot_code" && (
                                <>
                                    <p className="home-balance-label mb-2">Verificação</p>
                                    <h1 className="home-balance-value mb-2" style={{ fontSize: "clamp(2.3rem, 5vw, 3.4rem)", lineHeight: 1 }}>Código enviado</h1>
                                    <p className="home-item-subtitle mb-0">Digite o código de 6 dígitos enviado ao seu e-mail.</p>
                                </>
                            )}
                            {view === "forgot_password" && (
                                <>
                                    <p className="home-balance-label mb-2">Segurança</p>
                                    <h1 className="home-balance-value mb-2" style={{ fontSize: "clamp(2.3rem, 5vw, 3.4rem)", lineHeight: 1 }}>Nova senha</h1>
                                    <p className="home-item-subtitle mb-0">Crie uma nova senha de acesso.</p>
                                </>
                            )}
                            {/* --- HEADER DO NOVO PASSO DE 2FA --- */}
                            {view === "login_2fa" && (
                                <>
                                    <p className="home-balance-label mb-2">Segurança Adicional</p>
                                    <h1 className="home-balance-value mb-2" style={{ fontSize: "clamp(2.3rem, 5vw, 3.4rem)", lineHeight: 1 }}>Autenticação 2FA</h1>
                                    <p className="home-item-subtitle mb-0">Digite o código enviado ao seu e-mail para continuar.</p>
                                </>
                            )}
                        </div>

                        <div className="home-graph-card">
                            <AnimatePresence mode="wait">
                                {/* TELA DE LOGIN */}
                                {view === "login" && (
                                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                        <Form onSubmit={handleLogin}>
                                            <FormGroup className="mb-4">
                                                <Label htmlFor="email" className="fw-semibold mb-2">Email</Label>
                                                <Input id="email" name="email" type="email" placeholder="@email.com" required className="custom-input-balance" />
                                            </FormGroup>

                                            <FormGroup className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <Label htmlFor="password" className="fw-semibold mb-0">Senha</Label>
                                                    <button type="button" onClick={() => setView("forgot_email")} style={{ background: "transparent", border: "none", color: "#bfe7ff", fontSize: "0.85rem", padding: 0 }}>
                                                        Esqueceu a senha?
                                                    </button>
                                                </div>
                                                <Input id="password" name="password" type="password" placeholder="********" required className="custom-input-balance" />
                                            </FormGroup>

                                            <Button color="primary" type="submit" className="w-100 fw-semibold py-3" disabled={loading} style={{ borderRadius: "999px", fontSize: "0.98rem" }}>
                                                {loading ? "Entrando..." : "Entrar"}
                                            </Button>
                                        </Form>

                                        <div className="text-center mt-4">
                                            <span className="home-item-subtitle">Ainda não tem uma conta?</span>
                                            <button type="button" onClick={() => navigate("/signin")} style={{ background: "transparent", border: "none", color: "#bfe7ff", marginLeft: "6px", fontWeight: 600, padding: 0 }}>
                                                Criar conta
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* OUTRAS TELAS MANTIDAS: forgot_email, forgot_code, forgot_password... */}
                                
                                {/* TELA: DIGITAR CÓDIGO (RECUPERAÇÃO DE SENHA) */}
                                {view === "forgot_code" && (
                                    <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                        <Form onSubmit={handleVerifyCode}>
                                            <FormGroup className="mb-4">
                                                <Label htmlFor="inputCode" className="fw-semibold mb-2">Código de Verificação</Label>
                                                <Input id="inputCode" type="text" maxLength={6} value={inputCode} onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" required className="custom-input-balance text-center" style={{ letterSpacing: "10px", fontSize: "1.5rem" }} />
                                            </FormGroup>
                                            
                                            <Button color="primary" type="submit" className="w-100 fw-semibold py-3 mb-3" style={{ borderRadius: "999px", fontSize: "0.98rem" }}>
                                                Verificar código
                                            </Button>

                                            <Button type="button" onClick={cancelRecovery} className="w-100 fw-semibold py-3" color="secondary" style={{ borderRadius: "999px", fontSize: "0.98rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>
                                                Cancelar
                                            </Button>
                                        </Form>
                                    </motion.div>
                                )}

                                {/* --- NOVA TELA: DIGITAR CÓDIGO 2FA --- */}
                                {view === "login_2fa" && (
                                    <motion.div key="login_2fa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                        <Form onSubmit={handleVerify2FA}>
                                            <FormGroup className="mb-4">
                                                <Label htmlFor="inputCode2FA" className="fw-semibold mb-2">Código de Autenticação</Label>
                                                <Input id="inputCode2FA" type="text" maxLength={6} value={inputCode} onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" required className="custom-input-balance text-center" style={{ letterSpacing: "10px", fontSize: "1.5rem" }} />
                                            </FormGroup>
                                            
                                            <Button color="primary" type="submit" className="w-100 fw-semibold py-3 mb-3" style={{ borderRadius: "999px", fontSize: "0.98rem" }}>
                                                Confirmar Login
                                            </Button>

                                            <Button type="button" onClick={cancelRecovery} className="w-100 fw-semibold py-3" color="secondary" style={{ borderRadius: "999px", fontSize: "0.98rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>
                                                Voltar ao Login
                                            </Button>
                                        </Form>
                                    </motion.div>
                                )}

                                {/* MANTIDO: forgot_email e forgot_password */}
                            </AnimatePresence>
                        </div>
                    </div>
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