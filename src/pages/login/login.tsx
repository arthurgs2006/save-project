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

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const res = await fetch("https://database-save-app.onrender.com/users");

            if (!res.ok) {
                alert("Erro ao acessar servidor");
                setLoading(false);
                return;
            }

            const users = await res.json();
            const hashedPassword = await hashPassword(password);

            const user = users.find(
                (u: any) => u.email === email && u.password === hashedPassword
            );

            if (!user) {
                alert("Credenciais inválidas");
                setLoading(false);
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify(user));
            navigate("/homescreen");
        } catch (err) {
            alert("Erro ao conectar ao servidor");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="background-color text-white min-vh-100 d-flex align-items-center">
            <Container className="home-shell">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="d-flex justify-content-center"
                >
                    <div style={{ width: "100%", maxWidth: "460px" }}>
                        <div className="text-start mb-4">
                            <p className="home-balance-label mb-2">Bem-vindo de volta</p>
                            <h1
                                className="mb-2"
                                style={{
                                    fontSize: "2.2rem",
                                    fontWeight: 700,
                                    letterSpacing: "-0.8px",
                                    lineHeight: 1.1
                                }}
                            >
                                Continue a experiência
                            </h1>
                            <p className="home-item-subtitle mb-0">com sua conta</p>
                        </div>

                        <motion.div
                            className="home-graph-card"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Form onSubmit={handleLogin}>
                                <FormGroup className="mb-4">
                                    <Label htmlFor="email" className="fw-bold mb-2">
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
                                    <Label htmlFor="password" className="fw-bold mb-2">
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
                                    className="w-100 fw-bold py-3"
                                    disabled={loading}
                                    style={{
                                        borderRadius: "18px",
                                        fontSize: "1rem"
                                    }}
                                >
                                    {loading ? "Entrando..." : "Entrar"}
                                </Button>
                            </Form>
                        </motion.div>
                    </div>
                </motion.div>
            </Container>
        </main>
    );
}