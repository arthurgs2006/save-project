import React, { useState } from "react";
import {
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Button
} from "reactstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { hashPassword } from "../../utils/hashPassword";
import { BASE_URL } from "../../config";
import AlertModal from "../../components/generic_components/AlertModal";

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

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

            localStorage.setItem("loggedUser", JSON.stringify(user));
            navigate("/homescreen");
        } catch (err) {
            setAlert({ isOpen: true, message: "Erro ao conectar ao servidor", type: "danger" });
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                        <div className="text-center mb-4">
                            <p className="home-balance-label mb-2">Bem-vindo de volta</p>

                            <h1
                                className="home-balance-value mb-2"
                                style={{
                                    fontSize: "clamp(2.3rem, 5vw, 3.4rem)",
                                    lineHeight: 1,
                                }}
                            >
                                Entrar
                            </h1>

                            <p className="home-item-subtitle mb-0">
                                Continue a experiência com sua conta
                            </p>
                        </div>

                        <motion.div
                            className="home-graph-card"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Form onSubmit={handleLogin}>
                                <FormGroup className="mb-4">
                                    <Label htmlFor="email" className="fw-semibold mb-2">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="@email.com"
                                        required
                                        className="custom-input-balance"
                                    />
                                </FormGroup>

                                <FormGroup className="mb-4">
                                    <Label htmlFor="password" className="fw-semibold mb-2">
                                        Senha
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="********"
                                        required
                                        className="custom-input-balance"
                                    />
                                </FormGroup>

                                <Button
                                    color="primary"
                                    type="submit"
                                    className="w-100 fw-semibold py-3"
                                    disabled={loading}
                                    style={{
                                        borderRadius: "999px",
                                        fontSize: "0.98rem"
                                    }}
                                >
                                    {loading ? "Entrando..." : "Entrar"}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <span className="home-item-subtitle">
                                    Ainda não tem uma conta?
                                </span>

                                <button
                                    type="button"
                                    onClick={() => navigate("/signin")}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#bfe7ff",
                                        marginLeft: "6px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0
                                    }}
                                >
                                    Criar conta
                                </button>
                            </div>
                        </motion.div>
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