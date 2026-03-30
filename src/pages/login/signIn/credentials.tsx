import { useState } from "react";
import { motion } from "framer-motion";
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button
} from "reactstrap";
import AlertModal from "../../../components/generic_components/AlertModal";

export default function Credentials({ onNext }: any) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
        cpf: ""
    });
    const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

    // 🔹 Formata CPF (máscara)
    function formatCPF(value: string) {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    // 🔹 Valida CPF
    function isValidCPF(cpf: string) {
        cpf = cpf.replace(/[^\d]+/g, "");

        if (cpf.length !== 11) return false;

        // elimina sequências inválidas
        if (/^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let rest;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;

        return rest === parseInt(cpf.substring(10, 11));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        if (name === "cpf") {
            setFormData({ ...formData, cpf: formatCPF(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!formData.name.trim()) {
            setAlert({ isOpen: true, message: "Digite seu nome completo.", type: "danger" });
            return;
        }

        if (!isValidCPF(formData.cpf)) {
            setAlert({ isOpen: true, message: "CPF inválido.", type: "danger" });
            return;
        }

        if (formData.password !== formData.confirm) {
            setAlert({ isOpen: true, message: "As senhas não coincidem", type: "danger" });
            return;
        }

        onNext({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            cpf: formData.cpf.replace(/\D/g, "") // envia limpo
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
                    <Label htmlFor="cpf" className="fw-semibold text-white mb-2">
                        CPF (Cadastro de Pessoa Física)
                    </Label>
                    <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        required
                        maxLength={14}
                        className="custom-input-balance"
                        onChange={handleChange}
                        value={formData.cpf}
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
            {alert && <AlertModal isOpen={alert.isOpen} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </motion.div>
    );
}