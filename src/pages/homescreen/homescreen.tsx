import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import { exportStatementPdf } from "../../utils/pdf";
import { BASE_URL } from "../../config";

import AccountHeader from "../../components/generic_components/accountHeader";
import GraphicCard from "../../components/graphic_components/graphicCard";

interface Extrato {
    id: number | string;
    transactionId?: string;
    data: string;
    hora?: string;
    dataHora?: string;
    createdAt?: string;
    descricao?: string;
    valor: number;
    tipo: "credito" | "debito";
    status?: string;
    metodo?: string;
    origem?: string;
    goalId?: number | null;
    goalName?: string | null;
}

interface RecurringDebt {
    id: number | string;
    name: string;
    value: number;
    billingDate: string;
    frequency: string;
    createdAt?: string;
}

interface User {
    id: number | string;
    nome: string;
    saldo_final: number;
    extratos: Extrato[];
    recurringDebts?: RecurringDebt[];
    recurringCredits?: RecurringDebt[];
}

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

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
                const response = await fetch(
                    `${BASE_URL}/users/${parsedUser.id}`
                );

                if (!response.ok) return;

                const data: User = await response.json();
                setUser(data);
                localStorage.setItem("loggedUser", JSON.stringify(data));
            } catch {
                console.warn("Servidor indisponível.");
            }
        }

        loadUser();
    }, [navigate]);

    const freqMap: Record<string, string> = {
        daily: "Diária",
        weekly: "Semanal",
        monthly: "Mensal",
        yearly: "Anual",
    };

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [showStatement, setShowStatement] = useState(false);

    function getMonthKey(dateStr: string) {
        const partes = dateStr.split("/");
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            return `${ano}-${String(Number(mes)).padStart(2, "0")}`;
        }

        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) return "";
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    }

    const getCurrentMonthKey = () => {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    };

    const currentMonthKey = getCurrentMonthKey();

    const selectedMonthLabel = useMemo(() => {
        if (!selectedMonth) return null;
        const [year, month] = selectedMonth.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    }, [selectedMonth]);

    const selectedMonthIsFuture = selectedMonth ? selectedMonth > currentMonthKey : false;
    const statementMonthKey = selectedMonth || currentMonthKey;
    const statementMonthLabel = selectedMonthLabel || new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const statementMode = selectedMonth
        ? selectedMonth < currentMonthKey
            ? "past"
            : selectedMonth === currentMonthKey
                ? "current"
                : "future"
        : "current";

    const filterValidRecurring = (createdAt?: string) => {
        if (!createdAt) return selectedMonthIsFuture; // recorrentes antigos só aparecem no mês atual e futuros
        return getMonthKey(createdAt) <= selectedMonth;
    };

    const displayExtratos = useMemo(() => {
        const items = [...(user?.extratos || [])];

        if (!selectedMonth) {
            return items.reverse().slice(0, 4);
        }

        const actualExtratos = items.filter((item) => getMonthKey(item.data) === selectedMonth).reverse();

        const showRecurringInMonth = selectedMonth >= currentMonthKey;

        const recurringBase = showRecurringInMonth ? [
            ...(user?.recurringDebts || [])
                .filter((debt) => filterValidRecurring(debt.createdAt))
                .map((debt) => ({
                    id: `recurring-debit-${debt.id}-${selectedMonth}`,
                    data: `${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`,
                    descricao: `Débito recorrente: ${debt.name}`,
                    valor: calculateTotalForMonth(debt, selectedMonth),
                    tipo: "debito" as const,
                    status: selectedMonthIsFuture ? "Previsto" : "Recorrente",
                    isRecurringPreview: true,
                })),
            ...(user?.recurringCredits || [])
                .filter((credit) => filterValidRecurring(credit.createdAt))
                .map((credit) => ({
                    id: `recurring-credit-${credit.id}-${selectedMonth}`,
                    data: `${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`,
                    descricao: `Crédito recorrente: ${credit.name}`,
                    valor: calculateTotalForMonth(credit, selectedMonth),
                    tipo: "credito" as const,
                    status: selectedMonthIsFuture ? "Previsto" : "Recorrente",
                    isRecurringPreview: true,
                })),
        ] : [];

        return [...recurringBase, ...actualExtratos];
    }, [user, selectedMonth, selectedMonthIsFuture]);

    const statementItems = useMemo(() => {
        if (!user) return [];

        const allItems = [...user.extratos];
        const actualItems = allItems.filter(
            (item) => getMonthKey(item.data) === statementMonthKey
        );

        const showRecurringInMonth = statementMonthKey >= currentMonthKey;
        const recurringPreview = showRecurringInMonth
            ? [
                ...(user.recurringDebts || [])
                    .filter((debt) => filterValidRecurring(debt.createdAt))
                    .map((debt) => ({
                        id: `recurring-debit-${debt.id}-${statementMonthKey}`,
                        data: `${statementMonthKey.split("-")[1]}/${statementMonthKey.split("-")[0]}`,
                        descricao: `Débito recorrente: ${debt.name}`,
                        valor: calculateTotalForMonth(debt, statementMonthKey),
                        tipo: "debito" as const,
                        status: statementMode === "future" ? "Previsto" : "Recorrente",
                        isRecurringPreview: true,
                    })),
                ...(user.recurringCredits || [])
                    .filter((credit) => filterValidRecurring(credit.createdAt))
                    .map((credit) => ({
                        id: `recurring-credit-${credit.id}-${statementMonthKey}`,
                        data: `${statementMonthKey.split("-")[1]}/${statementMonthKey.split("-")[0]}`,
                        descricao: `Crédito recorrente: ${credit.name}`,
                        valor: calculateTotalForMonth(credit, statementMonthKey),
                        tipo: "credito" as const,
                        status: statementMode === "future" ? "Previsto" : "Recorrente",
                        isRecurringPreview: true,
                    }))
            ]
            : [];

        return [...actualItems, ...recurringPreview];
    }, [user, statementMonthKey, currentMonthKey, statementMode]);

    const selectedMonthOverview = useMemo(() => {
        if (!selectedMonth) return null;

        const items = displayExtratos;

        const totalCredit = items
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);

        const totalDebit = items
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);

        return {
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
            count: items.length,
        };
    }, [displayExtratos, selectedMonth]);

    const recurringDebts = user?.recurringDebts || [];
    const recurringCredits = user?.recurringCredits || [];

    const projectedBalance = useMemo(() => {
        if (!user || !selectedMonth) return user?.saldo_final || 0;

        const current = getCurrentMonthKey();
        if (selectedMonth < current) return user.saldo_final;

        let sum = 0;
        let m = current;
        while (m <= selectedMonth) {
            for (const debt of user.recurringDebts || []) {
                if (filterValidRecurring(debt.createdAt)) {
                    sum -= calculateTotalForMonth(debt, m);
                }
            }
            for (const credit of user.recurringCredits || []) {
                if (filterValidRecurring(credit.createdAt)) {
                    sum += calculateTotalForMonth(credit, m);
                }
            }
            // next month
            const [y, mm] = m.split('-');
            const next = new Date(Number(y), Number(mm), 1);
            next.setMonth(next.getMonth() + 1);
            m = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
        }
        return user.saldo_final + sum;
    }, [user, selectedMonth, currentMonthKey]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function getTransactionTitle(item: Extrato) {
        if (item.descricao) return item.descricao;
        return item.tipo === "credito" ? "Depósito" : "Débito";
    }

    function getTransactionSubtitle(item: Extrato) {
        if (item.dataHora) return item.dataHora;
        if (item.hora) return `${item.data} às ${item.hora}`;
        return item.data;
    }

    function buildStatementLines(items: Extrato[], monthLabel: string) {
        const header = [
            "SAVE PROJECT",
            "Extrato de Usuário",
            `Mês: ${monthLabel}`,
            "",
            "Data       Hora     Descrição                            Tipo   Valor",
            "------------------------------------------------------------",
        ];

        const detailLines = items.map((item) => {
            const time = item.hora ? `${item.hora}` : "";
            const description = item.descricao || (item.tipo === "credito" ? "Crédito" : "Débito");
            const type = item.tipo === "credito" ? "+" : "-";
            return `${item.data} ${time} | ${description} | ${type} | R$ ${formatCurrency(Number(item.valor))}`;
        });

        const totalCredit = items
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const totalDebit = items
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const balance = totalCredit - totalDebit;

        const footer = [
            "",
            `Total crédito: R$ ${formatCurrency(totalCredit)}`,
            `Total débito: R$ ${formatCurrency(totalDebit)}`,
            `Saldo do período: R$ ${formatCurrency(balance)}`,
            `Panorama: ${balance < 0 ? "Insuficiente" : "Adequado"}`,
        ];

        return [...header, ...detailLines, ...footer];
    }

    function handleExportPdf() {
        if (!user) return;
        const exportMonthLabel = selectedMonthLabel || new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

        const rows = statementItems.map((item) => {
            const hora = "hora" in item && item.hora ? item.hora : "";
            return {
                data: item.data,
                hora,
                descricao: item.descricao || (item.tipo === "credito" ? "Crédito" : "Débito"),
                tipo: item.tipo === "credito" ? "Crédito" : "Débito",
                valor: `R$ ${formatCurrency(Number(item.valor))}`,
            };
        });

        const totalCredit = statementItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const totalDebit = statementItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const balance = totalCredit - totalDebit;

        const footers = [
            { label: "Total crédito", value: `R$ ${formatCurrency(totalCredit)}` },
            { label: "Total débito", value: `R$ ${formatCurrency(totalDebit)}` },
            { label: "Saldo do período", value: `R$ ${formatCurrency(balance)}` },
            { label: "Panorama", value: balance < 0 ? "Insuficiente" : "Adequado" },
        ];

        const fileName = selectedMonth
            ? `extrato_${selectedMonth}.pdf`
            : `extrato_atual_${currentMonthKey}.pdf`;

        exportStatementPdf({
            title: `Extrato de ${exportMonthLabel}`,
            subtitle: `Usuário: ${user.nome}`,
            logoText: "SAVE PROJECT",
            rows,
            footers,
            fileName,
        });
    }

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function calculateTotalForMonth(recurring: RecurringDebt, selectedMonth: string) {
        const [year, monthStr] = selectedMonth.split("-");
        const yearNum = Number(year);
        const monthNum = Number(monthStr) - 1; // 0-based
        const daysInMonth = getDaysInMonth(yearNum, monthNum);

        switch (recurring.frequency) {
            case "daily":
                return recurring.value * daysInMonth;
            case "weekly":
                const weeks = Math.ceil(daysInMonth / 7);
                return recurring.value * weeks;
            case "monthly":
                return recurring.value;
            case "yearly":
                return recurring.value / 12; // approximate monthly
            default:
                return recurring.value;
        }
    }

    const statementOverview = useMemo(() => {
        if (!user) return null;

        const items = statementItems;
        if (!items.length) return null;

        const totalCredit = items
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const totalDebit = items
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const balance = totalCredit - totalDebit;
        const biggestMovement = items.reduce((current, item) =>
            Math.abs(Number(item.valor)) > Math.abs(Number(current.valor)) ? item : current,
            items[0]
        );

        return {
            totalCredit,
            totalDebit,
            balance,
            count: items.length,
            biggestMovement,
            statusText: balance < 0 ? "Insuficiente" : "Adequado",
            note:
                statementMode === "future"
                    ? "Projeção considerando despesas e receitas recorrentes para o mês selecionado."
                    : statementMode === "past"
                        ? "Extrato histórico do mês selecionado."
                        : "Movimentações do mês atual e recorrências.",
        };
    }, [statementItems, statementMode, user]);

    function getSafeExtraInfo(item: Extrato) {
        const parts: string[] = [];

        if (item.status) {
            parts.push(item.status);
        }

        if (item.transactionId) {
            parts.push(`ID: ${item.transactionId}`);
        }

        return parts.join(" • ");
    }

    function renderExtratoItem(item: Extrato) {
        const isRecurringPreview = (item as any).isRecurringPreview;
        const statusClass = item.status ? `home-list-item-recurring home-list-item-recurring-${item.tipo}` : "";

        return (
            <ListGroupItem
                key={item.id}
                className={`home-list-item home-list-item-${item.tipo} ${statusClass}`}
                onClick={isRecurringPreview ? undefined : () => navigate(`/transaction/${item.id}`)}
                style={{ cursor: isRecurringPreview ? "default" : "pointer" }}
            >
                <div className="home-list-left">
                    <div className="home-list-icon">
                        <i
                            className={`bi ${item.tipo === "credito"
                                    ? "bi-arrow-down-left"
                                    : "bi-arrow-up-right"
                                }`}
                        ></i>
                    </div>

                    <div className="home-item-copy">
                        <p className="home-item-title mb-1">
                            {getTransactionTitle(item)}
                        </p>

                        <small className="home-item-subtitle d-block">
                            {getTransactionSubtitle(item)}
                        </small>

                        {getSafeExtraInfo(item) && (
                            <small className={`home-item-meta ${item.status ? "home-item-meta-status" : ""}`}>
                                {getSafeExtraInfo(item)}
                            </small>
                        )}
                    </div>
                </div>

                <span
                    className={`home-item-value ${item.tipo === "credito"
                            ? "home-item-value-credit"
                            : "home-item-value-debit"
                        }`}
                >
                    {Number(item.valor) !== 0 ? (item.tipo === "credito" ? "+" : "-") : ""}
                    R${" "}
                    {formatCurrency(Number(item.valor))}
                </span>
            </ListGroupItem>
        );
    }

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-loading">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="home-apple-screen text-white min-vh-100">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell py-4 py-md-5">
                <AccountHeader name={user.nome} />

                <motion.main
                    className="home-main"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    <section className="home-balance-wrap">
                        <p className="home-balance-label">Saldo bancário</p>

                        <motion.h1
                            className="home-balance-value"
                            key={projectedBalance}
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            R$ {formatCurrency(Number(projectedBalance))}
                        </motion.h1>
                    </section>

                    <section className="home-graph-panel">
                        <GraphicCard
                            user={user}
                            selectedMonth={selectedMonth}
                            onSelectMonth={(monthKey) => {
                                if (monthKey === currentMonthKey) {
                                    setSelectedMonth(null);
                                    return;
                                }

                                setSelectedMonth((current) =>
                                    current === monthKey ? null : monthKey
                                );
                            }}
                        />
                    </section>

                    <section className="home-actions-section">
                        <nav className="home-actions-grid">
                            <Button
                                color="link"
                                className="home-action-btn home-action-btn-primary"
                                onClick={() => navigate("/deposit")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-down-left"></i>
                                </div>
                                <span className="home-action-label">Depositar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn home-action-btn-primary"
                                onClick={() => navigate("/debts")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-arrow-up-right"></i>
                                </div>
                                <span className="home-action-label">Sacar</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/goals")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-bullseye"></i>
                                </div>
                                <span className="home-action-label">Metas</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/registerDebt")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-repeat"></i>
                                </div>
                                <span className="home-action-label">Recorrentes</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/currency")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-currency-exchange"></i>
                                </div>
                                <span className="home-action-label">Moedas</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/investments")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <span className="home-action-label">Investimentos</span>
                            </Button>

                            <Button
                                color="link"
                                className="home-action-btn"
                                onClick={() => navigate("/cards-banks")}
                            >
                                <div className="home-action-icon">
                                    <i className="bi bi-credit-card-2-front"></i>
                                </div>
                                <span className="home-action-label">Cartões e Bancos</span>
                            </Button>
                        </nav>
                    </section>

                    <section className="home-section">
                        <div className="home-section-header d-flex align-items-center justify-content-between gap-3">
                            <div>
                                <h5 className="home-section-title">
                                    {selectedMonthLabel
                                        ? `Movimentações de ${selectedMonthLabel}`
                                        : "Últimas Movimentações"}
                                </h5>
                                {selectedMonth && selectedMonth < currentMonthKey && (
                                    <small className="text-muted-light">
                                        Extrato anterior: exporta todas as movimentações feitas no mês selecionado.
                                    </small>
                                )}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    color="primary"
                                    size="sm"
                                    className="fw-semibold d-flex align-items-center gap-2"
                                    onClick={handleExportPdf}
                                >
                                    <i className="bi bi-file-earmark-text"></i>
                                    Emitir extrato em PDF
                                </Button>

                                {!selectedMonth && (
                                    <Button
                                        color="primary"
                                        size="sm"
                                        className="fw-semibold"
                                        onClick={() => navigate("/transaction-history")}
                                    >
                                        Ver tudo
                                    </Button>
                                )}
                            </div>
                        </div>

                        {showStatement && (
                            <div className="home-section-summary mb-3 py-3 px-3">
                                <p className="mb-1 text-uppercase text-muted-light">
                                    Extrato de {statementMonthLabel}
                                </p>
                                {statementOverview ? (
                                    <> 
                                        <p className="mb-1">
                                            {statementOverview.note}
                                        </p>
                                        <p className="mb-1 text-success">
                                            Saldo atual: R$ {formatCurrency(Number(user.saldo_final))}
                                        </p>
                                        <p className="mb-1 text-info">
                                            Saldo {statementMode === "future" ? "futuro" : "do mês"}: R$ {formatCurrency(statementOverview.balance)}
                                        </p>
                                        <p className="mb-1">
                                            Maior movimentação: {statementOverview.biggestMovement.descricao || (statementOverview.biggestMovement.tipo === "credito" ? "Crédito" : "Débito")} de R$ {formatCurrency(Number(statementOverview.biggestMovement.valor))}
                                        </p>
                                        <p className={`mb-1 ${statementOverview.balance < 0 ? "text-danger" : "text-success"}`}>
                                            Panorama: {statementOverview.statusText} {statementOverview.balance < 0 ? "- há saldo negativo no período." : "- despesas e receitas equilibradas."}
                                        </p>
                                        {selectedMonth && selectedMonth < currentMonthKey && (
                                            <div className="mt-2">
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    className="fw-semibold"
                                                    onClick={() => navigate("/transaction-history")}
                                                >
                                                    Ir para histórico completo
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="home-empty-state text-center py-3">
                                        Nenhuma movimentação encontrada para {statementMonthLabel}.
                                    </div>
                                )}
                                <p className="mb-1 text-success">
                                    Saldo atual: R$ {formatCurrency(Number(user.saldo_final))}
                                </p>
                                <p className="mb-1 text-info">
                                    Saldo {statementMode === "future" ? "futuro" : "do mês"}: R$ {formatCurrency(statementOverview.balance)}
                                </p>
                                <p className="mb-1">
                                    Maior movimentação: {statementOverview.biggestMovement.descricao || (statementOverview.biggestMovement.tipo === "credito" ? "Crédito" : "Débito")} de R$ {formatCurrency(Number(statementOverview.biggestMovement.valor))}
                                </p>
                                <p className={`mb-1 ${statementOverview.balance < 0 ? "text-danger" : "text-success"}`}>
                                    Panorama: {statementOverview.statusText} {statementOverview.balance < 0 ? "- há saldo negativo no período." : "- despesas e receitas equilibradas."}
                                </p>
                                {selectedMonth && selectedMonth < currentMonthKey && (
                                    <div className="mt-2">
                                        <Button
                                            color="primary"
                                            size="sm"
                                            className="fw-semibold"
                                            onClick={() => navigate("/transaction-history")}
                                        >
                                            Ir para histórico completo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedMonthOverview && (
                            <div className="home-section-summary mb-3">
                                <p className="mb-1">
                                    {selectedMonthOverview.count} movimen{selectedMonthOverview.count === 1 ? "tação" : "tações"} nesse mês.
                                </p>
                                <p className="mb-1 text-success">
                                    Créditos: R$ {formatCurrency(selectedMonthOverview.totalCredit)}
                                </p>
                                <p className="mb-1 text-danger">
                                    Débitos: R$ {formatCurrency(selectedMonthOverview.totalDebit)}
                                </p>
                                <p className={`mb-0 ${selectedMonthOverview.balance >= 0 ? "text-success" : "text-danger"}`}>
                                    Saldo do mês: R$ {formatCurrency(selectedMonthOverview.balance)}
                                </p>
                                {selectedMonthIsFuture && (
                                    <small className="text-muted">
                                        Inclui valores previstos de créditos e débitos recorrentes.
                                    </small>
                                )}
                            </div>
                        )}

                        {displayExtratos.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {displayExtratos.map(renderExtratoItem)}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhuma movimentação recente.
                            </div>
                        )}
                    </section>

                    {!selectedMonth && (
                        <section id="benefits" className="home-section">
                            <div className="home-section-header">
                                <h5 className="home-section-title">Benefícios</h5>
                            </div>

                            <div
                                className="home-benefit-card"
                                onClick={() => navigate("/benefits")}
                            >
                            <div className="home-benefit-content">
                                <div className="home-benefit-icon">
                                    <i className="bi bi-stars"></i>
                                </div>

                                <div className="home-item-copy">
                                    <p className="home-item-title mb-1">
                                        Benefícios para Estudantes de Baixa Renda
                                    </p>
                                    <small className="home-item-subtitle">
                                        Descubra auxílios governamentais, bolsas e programas de
                                        crédito estudantil
                                    </small>
                                </div>
                            </div>

                            <i className="bi bi-chevron-right home-benefit-arrow"></i>
                        </div>
                    </section>
                    )}

                    <section className="home-section">
                        <div className="home-section-header">
                            <h5 className="home-section-title">Débitos Recorrentes</h5>
                        </div>

                        {recurringDebts.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringDebts.map((debt) => (
                                    <ListGroupItem key={debt.id} className="home-list-item home-list-item-debito home-list-item-recurring">
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i className="bi bi-repeat"></i>
                                            </div>

                                            <div className="home-item-copy">
                                                <p className="home-item-title mb-1">{debt.name}</p>
                                                <small className="home-item-subtitle">
                                                    Todo dia {debt.billingDate} —{" "}
                                                    {freqMap[debt.frequency] || debt.frequency}
                                                </small>
                                            </div>
                                        </div>

                                        <span className="home-item-value home-item-value-debit">
                                            -R$ {formatCurrency(Number(debt.value))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhum débito recorrente cadastrado.
                            </div>
                        )}
                    </section>

                    <section className="home-section">
                        <div className="home-section-header">
                            <h5 className="home-section-title">Créditos Recorrentes</h5>
                        </div>

                        {recurringCredits.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {recurringCredits.map((credit) => (
                                    <ListGroupItem key={credit.id} className="home-list-item home-list-item-credito home-list-item-recurring">
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i className="bi bi-repeat"></i>
                                            </div>

                                            <div className="home-item-copy">
                                                <p className="home-item-title mb-1">{credit.name}</p>
                                                <small className="home-item-subtitle">
                                                    Todo dia {credit.billingDate} —{" "}
                                                    {freqMap[credit.frequency] || credit.frequency}
                                                </small>
                                            </div>
                                        </div>

                                        <span className="home-item-value home-item-value-credit">
                                            +R$ {formatCurrency(Number(credit.value))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state">
                                Nenhum crédito recorrente cadastrado.
                            </div>
                        )}
                    </section>
                </motion.main>
            </Container>
        </div>
    );
}
