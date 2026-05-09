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

interface RecurringCredit {
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
    recurringCredits?: RecurringCredit[];
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

export default function RegisterRecurringCredit() {
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

        const credit = user.recurringCredits?.find((item) => item.id === editId);

        if (!credit) return;

        setName(credit.name);
        setValue(String(credit.value));
        setCategory(credit.category);
        setFrequency(credit.frequency);
        setBillingDate(String(credit.billingDate));
        setDescription(credit.description || "");
    }, [user, isEditing, editId]);

    const originalCredit = useMemo(() => {
        return user?.recurringCredits?.find((item) => item.id === editId) || null;
    }, [user, editId]);

    const preview = useMemo(() => {
        const numericValue = Number(value || 0);
        const currentBalance = Number(user?.saldo_final || 0);
        const monthlyImpact = getMonthlyEquivalent(numericValue, frequency);
        const projectedBalance = currentBalance + monthlyImpact;

        let insight = "Cadastre uma entrada recorrente para melhorar suas previsões financeiras.";

        if (isEditing) {
            insight = "Você está editando uma entrada recorrente existente.";
        }

        if (numericValue > 0) {
            insight = `Essa entrada representa aproximadamente ${formatCurrency(monthlyImpact)} por mês.`;
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
                message: "Informe um dia de recebimento válido.",
                type: "warning",
            });
            return;
        }

        const now = new Date();

        const newCredit: RecurringCredit = {
            id: isEditing ? editId : Date.now(),
            name: name.trim(),
            value: numericValue,
            category,
            frequency,
            billingDate: numericBillingDate,
            description: description.trim(),
            createdAt: originalCredit?.createdAt || now.toISOString(),
        };

        const oldValue = originalCredit?.value || 0;
        const balanceAdjustment = isEditing ? numericValue - oldValue : numericValue;

        const updatedCredits = isEditing
            ? (user.recurringCredits || []).map((item) =>
                  item.id === editId ? newCredit : item
              )
            : [...(user.recurringCredits || []), newCredit];

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
                ? `Crédito recorrente editado: ${newCredit.name}`
                : `Crédito recorrente cadastrado: ${newCredit.name}`,
            valor: numericValue,
            tipo: "credito" as const,
            status: "Recorrente",
        };

        const updatedUser: User = {
            ...user,
            saldo_final: Number(user.saldo_final ?? 0) + balanceAdjustment,
            recurringCredits: updatedCredits,
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
                    ? "Crédito recorrente atualizado com sucesso."
                    : "Crédito recorrente cadastrado com sucesso.",
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
                message: "Erro ao salvar crédito recorrente.",
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
                        title={isEditing ? "Editar crédito recorrente" : "Registrar crédito recorrente"}
                        backLink="/registerDebt/"
                    />

                    <section className="recurring-hero">
                        <div>
                            <span className="recurring-badge positive-badge">
                                {isEditing ? "Editando entrada" : "Nova entrada recorrente"}
                            </span>

                            <h1>
                                {preview.numericValue > 0
                                    ? formatCurrency(preview.numericValue)
                                    : "Novo crédito"}
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
                                <strong className="positive">
                                    + {formatCurrency(preview.monthlyImpact)}
                                </strong>
                            </div>

                            <div>
                                <span>Frequência</span>
                                <strong>{freqMap[frequency]}</strong>
                            </div>
                        </div>
                    </section>

                    <section className="recurring-form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="recurring-form-grid">
                                <label>
                                    Nome do crédito
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Ex: Salário, Freelance, Comissão..."
                                    />
                                </label>

                                <label>
                                    Valor recebido
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(event) => setValue(event.target.value)}
                                        placeholder="Ex: 1500.00"
                                    />
                                </label>

                                <label>
                                    Categoria
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Salário">Salário</option>
                                        <option value="Renda Extra">Renda Extra</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Investimentos">Investimentos</option>
                                        <option value="Reembolso">Reembolso</option>
                                        <option value="Mesada">Mesada</option>
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
                                    Dia de recebimento
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
                                    placeholder="Ex: pagamento fixo de cliente, salário principal, renda extra..."
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
                                        : "Salvar crédito recorrente"}
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