import { useState } from "react";
import { motion } from "framer-motion";
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button
} from "reactstrap";

export default function Credentials({ onNext }: any) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm: ""
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Digite seu nome completo.");
            return;
        }

        if (formData.password !== formData.confirm) {
            alert("As senhas não coincidem");
            return;
        }

        onNext({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });
    }

    return (
        <motion.div
            className="w-100"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="text-start mb-4">
                <h3 className="fw-bold mb-2 text-white">Seus dados</h3>
                <p className="home-item-subtitle mb-0">
                    Informe nome, email e senha para continuar
                </p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormGroup className="text-start mb-4">
                    <Label htmlFor="name" className="fw-semibold text-white mb-2">
                        Nome completo
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        required
                        className="custom-input-balance"
                        onChange={handleChange}
                        value={formData.name}
                    />
                </FormGroup>

                <FormGroup className="text-start mb-4">
                    <Label htmlFor="email" className="fw-semibold text-white mb-2">
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="@email.com"
                        required
                        className="custom-input-balance"
                        onChange={handleChange}
                        value={formData.email}
                    />
                </FormGroup>

                <FormGroup className="text-start mb-4">
                    <Label htmlFor="password" className="fw-semibold text-white mb-2">
                        Senha
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="********"
                        required
                        className="custom-input-balance"
                        onChange={handleChange}
                        value={formData.password}
                    />
                </FormGroup>

                <FormGroup className="text-start mb-2">
                    <Label htmlFor="confirm" className="fw-semibold text-white mb-2">
                        Confirmar senha
                    </Label>
                    <Input
                        id="confirm"
                        name="confirm"
                        type="password"
                        placeholder="********"
                        required
                        className="custom-input-balance"
                        onChange={handleChange}
                        value={formData.confirm}
                    />
                </FormGroup>

                <Button
                    color="primary"
                    type="submit"
                    className="w-100 mt-4 fw-semibold py-3"
                    style={{
                        borderRadius: "999px",
                        fontSize: "0.98rem"
                    }}
                >
                    Continuar
                </Button>
            </Form>
        </motion.div>
    );
}