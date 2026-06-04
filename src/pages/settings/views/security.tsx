import React, { useState, useEffect } from "react";
import { Container, Spinner } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { BASE_URL } from "../../../config";
import AlertModal from "../../../components/generic_components/AlertModal";
export default function Security() {
    const navigate = useNavigate();
    
    // Recupera o usuário logado do localStorage
    const storedUser = localStorage.getItem("loggedUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Inicializa o estado com a configuração atual do usuário
    const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(user?.twoFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // Redireciona para o login se não houver usuário na sessão
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    async function handleToggle2FA() {
        if (!user) return;
        
        setLoading(true);
        const newValue = !is2FAEnabled;

        try {
            const res = await fetch(`${BASE_URL}/api/auth/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ twoFactorEnabled: newValue })
            });

            if (!res.ok) throw new Error("Falha ao atualizar configurações");

            // Atualiza o estado da tela
            setIs2FAEnabled(newValue);

            // Atualiza o usuário no localStorage para manter a sincronia
            const updatedUser = { ...user, twoFactorEnabled: newValue };
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

            setAlert({
                isOpen: true,
                message: newValue 
                    ? "Autenticação em duas etapas (2FA) ativada com sucesso!" 
                    : "Autenticação em duas etapas desativada.",
                type: "success"
            });

        } catch (error) {
            console.error(error);
            setAlert({
                isOpen: true,
                message: "Erro ao atualizar a configuração de segurança. Tente novamente.",
                type: "danger"
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="settings-page min-vh-100 text-white" style={{ backgroundColor: "#0a0a0a" }}>
            <Container className="settings-container py-4 py-md-5" style={{ maxWidth: "720px" }}>
                
                {/* Cabeçalho de navegação */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="d-flex align-items-center mb-5"
                >
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", marginRight: "16px" }}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: "1.8rem" }}>Segurança</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <div className="settings-section">
                        <div className="settings-section-header mb-4">
                            <span className="settings-badge mb-2 d-inline-block px-3 py-1 rounded-pill" style={{ background: "rgba(58, 124, 255, 0.15)", color: "#75e1ff", fontSize: "0.85rem", fontWeight: 600 }}>
                                Proteção de Conta
                            </span>
                            <h3 className="fw-bold mb-2">Autenticação em Duas Etapas (2FA)</h3>
                            <p style={{ color: "#a1a1aa", lineHeight: 1.6 }}>
                                Adicione uma camada extra de segurança à sua conta. Sempre que você fizer login, enviaremos um código de verificação para o seu e-mail cadastrado ({user?.email}).
                            </p>
                        </div>

                        {/* Card de Configuração do Toggle */}
                        <div 
                            className="d-flex justify-content-between align-items-center p-4 rounded-4"
                            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div 
                                    className="d-flex justify-content-center align-items-center rounded-circle" 
                                    style={{ width: "48px", height: "48px", background: is2FAEnabled ? "rgba(40, 167, 69, 0.2)" : "rgba(255, 255, 255, 0.1)", color: is2FAEnabled ? "#28a745" : "#fff" }}
                                >
                                    <i className={`bi fs-4 ${is2FAEnabled ? "bi-shield-check" : "bi-shield-slash"}`}></i>
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-semibold">{is2FAEnabled ? "2FA Ativado" : "2FA Desativado"}</h5>
                                    <small style={{ color: "#a1a1aa" }}>
                                        {is2FAEnabled ? "Sua conta está protegida." : "Recomendamos ativar esta função."}
                                    </small>
                                </div>
                            </div>

                            {/* Bootstrap Switch Toggle */}
                            <div className="form-check form-switch" style={{ margin: 0, padding: 0 }}>
                                {loading ? (
                                    <Spinner size="sm" color="light" />
                                ) : (
                                    <input 
                                        className="form-check-input mt-0" 
                                        type="checkbox" 
                                        role="switch" 
                                        id="flexSwitchCheckDefault" 
                                        checked={is2FAEnabled} 
                                        onChange={handleToggle2FA}
                                        style={{ width: "3em", height: "1.5em", cursor: "pointer" }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>

            {/* Modal de Alerta */}
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