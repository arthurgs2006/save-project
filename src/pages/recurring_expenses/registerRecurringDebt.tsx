import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./Recurring.scss";

type Frequency = "monthly" | "weekly" | "daily" | "yearly";

interface RecurringDebt {
    id: number;
    name: string;
    value: number;
    category: string;
    frequency: Frequency;
    billingDate: number;
    description: string;
    createdAt: string;
}

interface User {
    id: number;
    nome?: string;
    saldo_final?: number;
    recurringDebts?: RecurringDebt[];
    extratos?: Array<{
        id: number | string;
        data: string;
        hora?: string;
        dataHora?: string;
        descricao?: string;
        valor: number;
        tipo: "credito" | "debito";
        status?: string;
    }>;
}

export default function RegisterRecurringDebt() {
    const [user, setUser] = useState<User | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const editId = Number(searchParams.get("editId"));
    const isEditing = Boolean(editId);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [category, setCategory] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [billingDate, setBillingDate] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const freqMap: Record<Frequency, string> = {
        monthly: "Mensal",
        weekly: "Semanal",
        daily: "Diária",
        yearly: "Anual",
    };

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (!response.ok) return;

                const data: User = await response.json();

                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível. Usando dados locais.");
            }
        }

        loadUser();
    }, [navigate]);

    useEffect(() => {
        if (!user || !isEditing) return;

        const debt = user.recurringDebts?.find((item) => item.id === editId);

        if (!debt) return;

        setName(debt.name);
        setValue(String(debt.value));
        setCategory(debt.category);
        setFrequency(debt.frequency);
        setBillingDate(String(debt.billingDate));
        setDescription(debt.description || "");
    }, [user, isEditing, editId]);

    const originalDebt = useMemo(() => {
        return user?.recurringDebts?.find((item) => item.id === editId) || null;
    }, [user, editId]);

    const preview = useMemo(() => {
        const numericValue = Number(value || 0);
        const currentBalance = Number(user?.saldo_final || 0);
        const monthlyImpact = getMonthlyEquivalent(numericValue, frequency);
        const projectedBalance = currentBalance - monthlyImpact;

        let insight = "Cadastre um débito recorrente para controlar melhor seus custos fixos.";

        if (isEditing) {
            insight = "Você está editando um débito recorrente existente.";
        }

        if (numericValue > 0 && projectedBalance < 0) {
            insight = "Atenção: esse débito pode deixar seu saldo projetado negativo.";
        } else if (numericValue > 0) {
            insight = `Esse débito representa aproximadamente ${formatCurrency(monthlyImpact)} por mês.`;
        }

        return {
            numericValue,
            currentBalance,
            monthlyImpact,
            projectedBalance,
            insight,
        };
    }, [value, frequency, user, isEditing]);

    function getMonthlyEquivalent(amount: number, freq: Frequency) {
        if (freq === "daily") return amount * 30;
        if (freq === "weekly") return amount * 4.33;
        if (freq === "yearly") return amount / 12;
        return amount;
    }

    function formatCurrency(amount: number) {
        return amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function resetForm() {
        setName("");
        setValue("");
        setCategory("");
        setFrequency("monthly");
        setBillingDate("");
        setDescription("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            setAlert({
                isOpen: true,
                message: "Usuário não encontrado. Faça login novamente.",
                type: "danger",
            });
            return;
        }

        if (!name.trim() || !value || !category || !billingDate) {
            setAlert({
                isOpen: true,
                message: "Preencha todos os campos obrigatórios.",
                type: "warning",
            });
            return;
        }

        const numericValue = Number(value);
        const numericBillingDate = Number(billingDate);

        if (Number.isNaN(numericValue) || numericValue <= 0) {
            setAlert({
                isOpen: true,
                message: "Digite um valor válido.",
                type: "warning",
            });
            return;
        }

        if (
            Number.isNaN(numericBillingDate) ||
            numericBillingDate < 1 ||
            numericBillingDate > 31
        ) {
            setAlert({
                isOpen: true,
                message: "Informe um dia de cobrança válido.",
                type: "warning",
            });
            return;
        }

        const now = new Date();

        const newDebt: RecurringDebt = {
            id: isEditing ? editId : Date.now(),
            name: name.trim(),
            value: numericValue,
            category,
            frequency,
            billingDate: numericBillingDate,
            description: description.trim(),
            createdAt: originalDebt?.createdAt || now.toISOString(),
        };

        const oldValue = originalDebt?.value || 0;
        const balanceAdjustment = isEditing ? oldValue - numericValue : -numericValue;

        const updatedDebts = isEditing
            ? (user.recurringDebts || []).map((item) =>
                  item.id === editId ? newDebt : item
              )
            : [...(user.recurringDebts || []), newDebt];

        const newStatement = {
            id: Date.now(),
            data: now.toLocaleDateString("pt-BR"),
            hora: now.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            dataHora: `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`,
            descricao: isEditing
                ? `Débito recorrente editado: ${newDebt.name}`
                : `Débito recorrente cadastrado: ${newDebt.name}`,
            valor: numericValue,
            tipo: "debito" as const,
            status: "Recorrente",
        };

        const updatedUser: User = {
            ...user,
            saldo_final: Number(user.saldo_final ?? 0) + balanceAdjustment,
            recurringDebts: updatedDebts,
            extratos: [...(user.extratos || []), newStatement],
        };

        try {
            setSaving(true);

            const response = await fetch(`${BASE_URL}/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error();
            }

            setUser(updatedUser);
            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

            setAlert({
                isOpen: true,
                message: isEditing
                    ? "Débito recorrente atualizado com sucesso."
                    : "Débito recorrente cadastrado com sucesso.",
                type: "success",
            });

            if (!isEditing) {
                resetForm();
            } else {
                setTimeout(() => navigate("/registerDebt/"), 900);
            }
        } catch {
            setAlert({
                isOpen: true,
                message: "Erro ao salvar débito recorrente.",
                type: "danger",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="recurring-page">
            <Container className="recurring-container">
                <AccountHeader name={user?.nome} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader
                        title={isEditing ? "Editar débito recorrente" : "Registrar débito recorrente"}
                        backLink="/registerDebt/"
                    />

                    <section className="recurring-hero">
                        <div>
                            <span className="recurring-badge negative-badge">
                                {isEditing ? "Editando saída" : "Novo custo recorrente"}
                            </span>

                            <h1>
                                {preview.numericValue > 0
                                    ? formatCurrency(preview.numericValue)
                                    : "Novo débito"}
                            </h1>

                            <p>{preview.insight}</p>
                        </div>

                        <div className="recurring-hero-grid">
                            <div>
                                <span>Saldo atual</span>
                                <strong>{formatCurrency(preview.currentBalance)}</strong>
                            </div>

                            <div>
                                <span>Impacto mensal</span>
                                <strong className="negative">
                                    - {formatCurrency(preview.monthlyImpact)}
                                </strong>
                            </div>

                            <div>
                                <span>Saldo após impacto</span>
                                <strong>{formatCurrency(preview.projectedBalance)}</strong>
                            </div>
                        </div>
                    </section>

                    <section className="recurring-form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="recurring-form-grid">
                                <label>
                                    Nome do débito
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Ex: Netflix, Academia, Internet..."
                                    />
                                </label>

                                <label>
                                    Valor cobrado
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(event) => setValue(event.target.value)}
                                        placeholder="Ex: 39.90"
                                    />
                                </label>

                                <label>
                                    Categoria
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Streaming">Streaming</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Saúde">Saúde</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Moradia">Moradia</option>
                                        <option value="Internet">Internet</option>
                                        <option value="Serviços">Serviços</option>
                                        <option value="Estética">Estética</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </label>

                                <label>
                                    Frequência
                                    <select
                                        value={frequency}
                                        onChange={(event) => setFrequency(event.target.value as Frequency)}
                                    >
                                        <option value="daily">Diária</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </label>

                                <label>
                                    Dia da cobrança
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={billingDate}
                                        onChange={(event) => setBillingDate(event.target.value)}
                                        placeholder="1 a 31"
                                    />
                                </label>
                            </div>

                            <label className="recurring-textarea-label">
                                Descrição
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Ex: assinatura mensal, conta fixa, cobrança automática..."
                                />
                            </label>

                            <div className="recurring-form-actions">
                                <button type="button" className="recurring-secondary-btn" onClick={resetForm}>
                                    Limpar
                                </button>

                                <button type="submit" className="recurring-main-btn" disabled={saving}>
                                    {saving
                                        ? "Salvando..."
                                        : isEditing
                                        ? "Salvar alterações"
                                        : "Salvar débito recorrente"}
                                </button>
                            </div>
                        </form>
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