import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import AlertModal from "../../components/generic_components/AlertModal";
import "./WithdrawPage.scss";

interface WithdrawStatement {
    id: number;
    transactionId: string;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
    dataHora: string;
    createdAt: string;
    status: "concluido";
    metodo: "saldo_manual";
    origem: "saque";
    category?: string;
}

interface User {
    id: number;
    nome?: string;
    name?: string;
    saldo_final: number;
    extratos: WithdrawStatement[];
}

interface WithdrawMetadata {
    id: number;
    transactionId: string;
    createdAt: string;
    date: string;
    hour: string;
    dateTimeLabel: string;
}

type WithdrawCategory =
    | "Conta"
    | "Alimentação"
    | "Transporte"
    | "Lazer"
    | "Saúde"
    | "Educação"
    | "Compras"
    | "Outros";

export default function WithdrawPage() {
    const [user, setUser] = useState<User | null>(null);
    const [withdrawValue, setWithdrawValue] = useState("");
    const [category, setCategory] = useState<WithdrawCategory>("Conta");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const storedUser = localStorage.getItem("loggedUser");

            if (!storedUser) return;

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const response = await fetch(`${BASE_URL}/users/${parsedUser.id}`);

                if (!response.ok) {
                    throw new Error("Erro ao carregar usuário");
                }

                const data: User = await response.json();

                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Erro ao carregar usuário. Usando dados locais.");
            }
        }

        loadUser();
    }, []);

    const numericWithdraw = useMemo(() => {
        return Number(withdrawValue.replace(",", ".")) || 0;
    }, [withdrawValue]);

    const recentStatements = useMemo(() => {
        if (!user?.extratos?.length) return [];

        return [...user.extratos]
            .reverse()
            .filter((transaction) => transaction.origem === "saque" || transaction.tipo === "debito")
            .slice(0, 5);
    }, [user]);

    const preview = useMemo(() => {
        const currentBalance = Number(user?.saldo_final || 0);
        const nextBalance = currentBalance - numericWithdraw;
        const balanceUsage =
            currentBalance > 0 ? Math.min((numericWithdraw / currentBalance) * 100, 100) : 0;

        let insight = "Informe um valor para visualizar o impacto do saque.";

        if (numericWithdraw > currentBalance && numericWithdraw > 0) {
            insight = "O valor informado é maior que o saldo disponível. Ajuste o saque antes de confirmar.";
        } else if (numericWithdraw > 0 && balanceUsage >= 70) {
            insight = "Esse saque consome uma parte alta do saldo. Verifique se ele é realmente necessário.";
        } else if (numericWithdraw > 0 && balanceUsage >= 35) {
            insight = "Esse saque tem impacto moderado no saldo. É bom acompanhar os próximos gastos.";
        } else if (numericWithdraw > 0) {
            insight = "Esse saque será registrado no histórico e abatido do saldo geral.";
        }

        return {
            currentBalance,
            nextBalance,
            balanceUsage,
            insight,
        };
    }, [numericWithdraw, user]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function buildWithdrawMetadata(): WithdrawMetadata {
        const now = new Date();
        const timestamp = now.getTime();

        const date = now.toLocaleDateString("pt-BR");
        const hour = now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        return {
            id: timestamp,
            transactionId: `SAQ-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: now.toISOString(),
            date,
            hour,
            dateTimeLabel: `${date} às ${hour}`,
        };
    }

    function createWithdrawStatement(
        meta: WithdrawMetadata,
        withdraw: number
    ): WithdrawStatement {
        const customDescription = description.trim();

        return {
            id: meta.id,
            transactionId: meta.transactionId,
            tipo: "debito",
            descricao: customDescription || `Saque registrado: ${category}`,
            valor: withdraw,
            data: meta.date,
            hora: meta.hour,
            dataHora: meta.dateTimeLabel,
            createdAt: meta.createdAt,
            status: "concluido",
            metodo: "saldo_manual",
            origem: "saque",
            category,
        };
    }

    function resetForm() {
        setWithdrawValue("");
        setCategory("Conta");
        setDescription("");
    }

    async function handleWithdraw() {
        if (!user) {
            setAlert({
                isOpen: true,
                message: "Usuário não encontrado. Faça login novamente.",
                type: "danger",
            });
            return;
        }

        if (numericWithdraw <= 0) {
            setAlert({
                isOpen: true,
                message: "Digite um valor válido para o saque.",
                type: "warning",
            });
            return;
        }

        if (numericWithdraw > Number(user.saldo_final || 0)) {
            setAlert({
                isOpen: true,
                message: "Saldo insuficiente para realizar esse saque.",
                type: "warning",
            });
            return;
        }

        const meta = buildWithdrawMetadata();
        const newBalance = Number(user.saldo_final || 0) - numericWithdraw;
        const newStatement = createWithdrawStatement(meta, numericWithdraw);

        const updatedUser: User = {
            ...user,
            saldo_final: newBalance,
            extratos: [...(user.extratos || []), newStatement],
        };

        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar dados");
            }

            localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

            setUser(updatedUser);
            resetForm();

            setAlert({
                isOpen: true,
                message: "Saque realizado com sucesso.",
                type: "success",
            });
        } catch {
            setAlert({
                isOpen: true,
                message: "Erro ao realizar saque.",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="withdraw-page">
            <Container className="withdraw-container">
                <AccountHeader name={user?.nome || user?.name} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Sacar" />

                    {!user ? (
                        <div className="withdraw-empty">Carregando informações...</div>
                    ) : (
                        <>
                            <section className="withdraw-hero">
                                <div>
                                    <span className="withdraw-badge">Novo saque</span>
                                    <h1>{formatCurrency(preview.currentBalance)}</h1>
                                    <p>Saldo atual disponível na sua conta SaveApp.</p>
                                </div>

                                <div className="withdraw-hero-grid">
                                    <div>
                                        <span>Valor do saque</span>
                                        <strong className="negative">
                                            {formatCurrency(numericWithdraw)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Saldo após saque</span>
                                        <strong>{formatCurrency(preview.nextBalance)}</strong>
                                    </div>

                                    <div>
                                        <span>Categoria</span>
                                        <strong>{category}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="withdraw-layout">
                                <div className="withdraw-form-card">
                                    <div className="withdraw-form-header">
                                        <span className="withdraw-badge secondary">
                                            Registro manual
                                        </span>
                                        <h2>Informações do saque</h2>
                                        <p>
                                            Registre saídas do saldo e mantenha seu histórico financeiro
                                            organizado por categoria.
                                        </p>
                                    </div>

                                    <div className="withdraw-form-grid">
                                        <label>
                                            Valor do saque
                                            <div className="withdraw-money-input">
                                                <span>R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={withdrawValue}
                                                    onChange={(event) =>
                                                        setWithdrawValue(event.target.value)
                                                    }
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </label>

                                        <label>
                                            Categoria
                                            <select
                                                value={category}
                                                onChange={(event) =>
                                                    setCategory(event.target.value as WithdrawCategory)
                                                }
                                            >
                                                <option value="Conta">Conta</option>
                                                <option value="Alimentação">Alimentação</option>
                                                <option value="Transporte">Transporte</option>
                                                <option value="Lazer">Lazer</option>
                                                <option value="Saúde">Saúde</option>
                                                <option value="Educação">Educação</option>
                                                <option value="Compras">Compras</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="withdraw-description-label">
                                        Descrição
                                        <textarea
                                            value={description}
                                            onChange={(event) =>
                                                setDescription(event.target.value)
                                            }
                                            placeholder="Ex: pagamento de conta, compra do mês, retirada para emergência..."
                                        />
                                    </label>

                                    <div className="withdraw-insight">
                                        <strong>Insight</strong>
                                        <p>{preview.insight}</p>
                                    </div>

                                    <div className="withdraw-actions">
                                        <button
                                            type="button"
                                            className="withdraw-secondary-btn"
                                            onClick={resetForm}
                                            disabled={loading}
                                        >
                                            Limpar
                                        </button>

                                        <button
                                            type="button"
                                            className="withdraw-main-btn"
                                            onClick={handleWithdraw}
                                            disabled={loading}
                                        >
                                            {loading ? "Processando..." : "Confirmar saque"}
                                        </button>
                                    </div>
                                </div>

                                <aside className="withdraw-preview-card">
                                    <span className="withdraw-badge">Prévia</span>

                                    <div className="withdraw-preview-icon">
                                        <i className="bi bi-arrow-up-right"></i>
                                    </div>

                                    <h2>{formatCurrency(numericWithdraw)}</h2>

                                    <p>
                                        Será removido do saldo geral e registrado como saída
                                        na categoria <strong>{category}</strong>.
                                    </p>

                                    <div className="withdraw-balance-preview">
                                        <div className="withdraw-balance-header">
                                            <span>Uso do saldo</span>
                                            <strong>{preview.balanceUsage.toFixed(0)}%</strong>
                                        </div>

                                        <div className="withdraw-progress-track">
                                            <div
                                                style={{
                                                    width: `${preview.balanceUsage}%`,
                                                }}
                                            />
                                        </div>

                                        <small>
                                            Saldo final previsto: {formatCurrency(preview.nextBalance)}
                                        </small>
                                    </div>
                                </aside>
                            </section>

                            {recentStatements.length > 0 && (
                                <section className="withdraw-history">
                                    <div className="withdraw-history-header">
                                        <div>
                                            <span className="withdraw-badge">Histórico</span>
                                            <h2>Saques recentes</h2>
                                        </div>
                                    </div>

                                    <div className="withdraw-history-list">
                                        {recentStatements.map((transaction) => (
                                            <article
                                                className="withdraw-history-item"
                                                key={transaction.id}
                                            >
                                                <div className="withdraw-history-left">
                                                    <div className="withdraw-history-icon">
                                                        <i className="bi bi-arrow-up-right"></i>
                                                    </div>

                                                    <div>
                                                        <h3>{transaction.descricao}</h3>
                                                        <p>{transaction.dataHora}</p>
                                                        <small>
                                                            ID: {transaction.transactionId}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="withdraw-history-value">
                                                    <strong>
                                                        - {formatCurrency(Number(transaction.valor))}
                                                    </strong>
                                                    <span>{transaction.status}</span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
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