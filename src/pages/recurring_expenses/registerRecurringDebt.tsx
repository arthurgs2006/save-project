import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BENEFITS_API_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./Recurring.scss";

type Frequency = "monthly" | "weekly" | "daily" | "yearly";

interface RecurringDebt {
    id: number;
    userId?: string;
    name: string;
    value: number;
    type?: "debit";
    category: string;
    frequency: Frequency;
    billingDay?: number;
    billingDate?: number;
    description: string;
    startDate: string;
    endDate: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    periodLabel?: string;
    statusLabel?: string;
    monthlyEquivalent?: number;
}

interface User {
    id: string | number;
    nome?: string;
    name?: string;
    saldo_final?: number;
    recurringDebts?: RecurringDebt[];
    recurringCredits?: any[];
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

function getApiRoot() {
    return BENEFITS_API_URL;
}

function toInputDate(value?: string | null) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function getTodayInputDate() {
    return new Date().toISOString().slice(0, 10);
}

function getBillingDay(item: RecurringDebt) {
    return Number(item.billingDay ?? item.billingDate ?? 1);
}

function normalizeRecurringDebtFromApi(item: any): RecurringDebt {
    return {
        id: Number(item.id ?? item.Id ?? Date.now()),
        userId: String(item.userId ?? item.UserId ?? ""),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type: "debit",
        category: item.category ?? item.Category ?? "",
        frequency: (item.frequency ?? item.Frequency ?? "monthly") as Frequency,
        billingDay: Number(
            item.billingDay ??
                item.BillingDay ??
                item.billingDate ??
                item.BillingDate ??
                1
        ),
        billingDate: Number(
            item.billingDay ??
                item.BillingDay ??
                item.billingDate ??
                item.BillingDate ??
                1
        ),
        description: item.description ?? item.Description ?? "",
        startDate: toInputDate(item.startDate ?? item.StartDate),
        endDate:
            item.endDate || item.EndDate
                ? toInputDate(item.endDate ?? item.EndDate)
                : null,
        isActive: item.isActive ?? item.IsActive ?? true,
        createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.UpdatedAt ?? undefined,
        periodLabel: item.periodLabel ?? item.PeriodLabel ?? "",
        statusLabel: item.statusLabel ?? item.StatusLabel ?? "",
        monthlyEquivalent: Number(item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0),
    };
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

    const [startDate, setStartDate] = useState(getTodayInputDate());
    const [endDate, setEndDate] = useState("");
    const [hasNoEndDate, setHasNoEndDate] = useState(true);

    const [saving, setSaving] = useState(false);

    const freqMap: Record<Frequency, string> = {
        monthly: "Mensal",
        weekly: "Semanal",
        daily: "Diária",
        yearly: "Anual",
    };

    useEffect(() => {
        async function loadUserAndRecurrings() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const url = `${getApiRoot()}/recurring-transactions/user/${parsedUser.id}`;

                console.log("URL BUSCA DÉBITOS RECORRENTES:", url);

                const response = await fetch(url);
                const raw = await response.text();

                if (!response.ok) {
                    console.error("Erro ao buscar débitos recorrentes:", {
                        url,
                        status: response.status,
                        body: raw,
                    });

                    return;
                }

                const data = JSON.parse(raw);

                const debts = Array.isArray(data)
                    ? data
                          .filter((item: any) => {
                              const type = String(item.type ?? item.Type ?? "").toLowerCase();
                              return type === "debit";
                          })
                          .map(normalizeRecurringDebtFromApi)
                    : [];

                const updatedUser: User = {
                    ...parsedUser,
                    recurringDebts: debts,
                };

                setUser(updatedUser);
                localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
            } catch (error) {
                console.warn("Não foi possível carregar débitos recorrentes do back-end.", error);
            }
        }

        loadUserAndRecurrings();
    }, [navigate]);

    useEffect(() => {
        if (!user || !isEditing) return;

        const debt = user.recurringDebts?.find((item) => item.id === editId);

        if (!debt) return;

        setName(debt.name);
        setValue(String(debt.value));
        setCategory(debt.category);
        setFrequency(debt.frequency);
        setBillingDate(String(getBillingDay(debt)));
        setDescription(debt.description || "");

        setStartDate(toInputDate(debt.startDate || debt.createdAt || getTodayInputDate()));

        if (debt.endDate) {
            setEndDate(toInputDate(debt.endDate));
            setHasNoEndDate(false);
        } else {
            setEndDate("");
            setHasNoEndDate(true);
        }
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
        }

        if (numericValue > 0 && projectedBalance >= 0 && hasNoEndDate) {
            insight = `Esse débito representa aproximadamente ${formatCurrency(monthlyImpact)} por mês, sem data final definida.`;
        }

        if (numericValue > 0 && !hasNoEndDate && endDate) {
            insight = `Esse débito representa aproximadamente ${formatCurrency(monthlyImpact)} por mês até ${formatDateLabel(endDate)}.`;
        }

        return {
            numericValue,
            currentBalance,
            monthlyImpact,
            projectedBalance,
            insight,
        };
    }, [value, frequency, user, isEditing, hasNoEndDate, endDate]);

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

    function formatDateLabel(value: string) {
        if (!value) return "";

        const [year, month, day] = value.split("-");

        return `${day}/${month}/${year}`;
    }

    function resetForm() {
        setName("");
        setValue("");
        setCategory("");
        setFrequency("monthly");
        setBillingDate("");
        setDescription("");
        setStartDate(getTodayInputDate());
        setEndDate("");
        setHasNoEndDate(true);
    }

    function validateForm() {
        if (!user) {
            setAlert({
                isOpen: true,
                message: "Usuário não encontrado. Faça login novamente.",
                type: "danger",
            });
            return false;
        }

        if (!name.trim() || !value || !category || !billingDate || !startDate) {
            setAlert({
                isOpen: true,
                message: "Preencha todos os campos obrigatórios.",
                type: "warning",
            });
            return false;
        }

        const numericValue = Number(value);
        const numericBillingDate = Number(billingDate);

        if (Number.isNaN(numericValue) || numericValue <= 0) {
            setAlert({
                isOpen: true,
                message: "Digite um valor válido.",
                type: "warning",
            });
            return false;
        }

        if (
            Number.isNaN(numericBillingDate) ||
            numericBillingDate < 1 ||
            numericBillingDate > 31
        ) {
            setAlert({
                isOpen: true,
                message: "Informe um dia de cobrança válido entre 1 e 31.",
                type: "warning",
            });
            return false;
        }

        if (!hasNoEndDate && !endDate) {
            setAlert({
                isOpen: true,
                message: "Informe a data final ou marque que não existe data para terminar.",
                type: "warning",
            });
            return false;
        }

        if (!hasNoEndDate && endDate < startDate) {
            setAlert({
                isOpen: true,
                message: "A data final não pode ser menor que a data inicial.",
                type: "warning",
            });
            return false;
        }

        return true;
    }

    async function saveRecurringInBackend() {
        if (!user) throw new Error("Usuário não encontrado.");

        const payload = {
            userId: String(user.id),
            name: name.trim(),
            value: Number(value),
            type: "debit",
            frequency,
            billingDay: Number(billingDate),
            category,
            description: description.trim(),
            startDate,
            endDate: hasNoEndDate ? null : endDate,
            isActive: true,
        };

        const url = isEditing
            ? `${getApiRoot()}/recurring-transactions/${editId}`
            : `${getApiRoot()}/recurring-transactions`;

        console.log("URL SALVAR DÉBITO RECORRENTE:", url);
        console.log("PAYLOAD DÉBITO RECORRENTE:", payload);

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const raw = await response.text();

        if (!response.ok) {
            console.error("Erro da API ao salvar débito recorrente:", {
                url,
                status: response.status,
                body: raw,
                payload,
            });

            throw new Error(raw || "Erro ao salvar no back-end.");
        }

        return normalizeRecurringDebtFromApi(JSON.parse(raw));
    }

    function updateLocalUser(savedDebt: RecurringDebt) {
        if (!user) return;

        const now = new Date();

        const normalizedDebt: RecurringDebt = {
            ...savedDebt,
            userId: String(user.id),
            type: "debit",
            billingDate: getBillingDay(savedDebt),
            billingDay: getBillingDay(savedDebt),
            startDate: toInputDate(savedDebt.startDate || startDate),
            endDate: savedDebt.endDate ? toInputDate(savedDebt.endDate) : null,
            createdAt: savedDebt.createdAt || originalDebt?.createdAt || now.toISOString(),
            updatedAt: now.toISOString(),
        };

        const updatedDebts = isEditing
            ? (user.recurringDebts || []).map((item) =>
                  item.id === editId ? normalizedDebt : item
              )
            : [...(user.recurringDebts || []), normalizedDebt];

        const newStatement = {
            id: Date.now(),
            data: now.toLocaleDateString("pt-BR"),
            hora: now.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            dataHora: `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            )}`,
            descricao: isEditing
                ? `Débito recorrente editado: ${normalizedDebt.name}`
                : `Débito recorrente cadastrado: ${normalizedDebt.name}`,
            valor: Number(normalizedDebt.value),
            tipo: "debito" as const,
            status: "Recorrente",
        };

        const updatedUser: User = {
            ...user,
            recurringDebts: updatedDebts,
            extratos: [...(user.extratos || []), newStatement],
        };

        setUser(updatedUser);
        localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const savedDebt = await saveRecurringInBackend();

            updateLocalUser(savedDebt);

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
        } catch (error) {
            console.error(error);

            setAlert({
                isOpen: true,
                message:
                    "Erro ao salvar no back-end. Confira se a API está rodando e se a rota /api/recurring-transactions foi registrada.",
                type: "danger",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="recurring-page">
            <Container className="recurring-container">
                <AccountHeader name={user?.nome || user?.name} />

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
                            <span className="recurring-badge danger-badge">
                                {isEditing ? "Editando saída" : "Nova saída recorrente"}
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
                                <span>Frequência</span>
                                <strong>{freqMap[frequency]}</strong>
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
                                        placeholder="Ex: Netflix, aluguel, internet..."
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
                                        <option value="Assinatura">Assinatura</option>
                                        <option value="Moradia">Moradia</option>
                                        <option value="Internet">Internet</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Saúde">Saúde</option>
                                        <option value="Lazer">Lazer</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </label>

                                <label>
                                    Frequência
                                    <select
                                        value={frequency}
                                        onChange={(event) =>
                                            setFrequency(event.target.value as Frequency)
                                        }
                                    >
                                        <option value="daily">Diária</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </label>

                                <label>
                                    Dia de cobrança
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={billingDate}
                                        onChange={(event) => setBillingDate(event.target.value)}
                                        placeholder="1 a 31"
                                    />
                                </label>

                                <label>
                                    Começa em
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(event) => setStartDate(event.target.value)}
                                    />
                                </label>

                                <label>
                                    Termina em
                                    <input
                                        type="date"
                                        value={endDate}
                                        disabled={hasNoEndDate}
                                        onChange={(event) => setEndDate(event.target.value)}
                                    />
                                </label>
                            </div>

                            <label className="recurring-period-check">
                                <input
                                    type="checkbox"
                                    checked={hasNoEndDate}
                                    onChange={(event) => {
                                        setHasNoEndDate(event.target.checked);

                                        if (event.target.checked) {
                                            setEndDate("");
                                        }
                                    }}
                                />
                                <span>Esse débito recorrente não tem data para terminar</span>
                            </label>

                            <label className="recurring-textarea-label">
                                Descrição
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Ex: assinatura mensal, parcela, conta fixa..."
                                />
                            </label>

                            <div className="recurring-form-actions">
                                <button
                                    type="button"
                                    className="recurring-secondary-btn"
                                    onClick={resetForm}
                                >
                                    Limpar
                                </button>

                                <button
                                    type="submit"
                                    className="recurring-main-btn"
                                    disabled={saving}
                                >
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