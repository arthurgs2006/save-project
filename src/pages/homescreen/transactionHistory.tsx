import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { motion } from "framer-motion";

import { exportStatementPdf } from "../../utils/pdf";
import { BASE_URL } from "../../config";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";
import "./TransactionHistory.scss";

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
    category?: string;
    goalName?: string | null;
}

interface User {
    id: number | string;
    nome: string;
    saldo_final?: number;
    extratos: Extrato[];
}

type FilterType = "all" | "credito" | "debito";

export default function TransactionHistory() {
    const [user, setUser] = useState<User | null>(null);
    const [exportMode, setExportMode] = useState<"all" | "period">("all");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [search, setSearch] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const queryMonth = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("month") || "";
    }, [location.search]);

    useEffect(() => {
        if (!queryMonth) return;

        setExportMode("period");
        setPeriodStart(queryMonth);
        setPeriodEnd(queryMonth);
    }, [queryMonth]);

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
                const response = await fetch(`${BASE_URL}/api/auth/users/${parsedUser.id}`);

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

    const allItems = useMemo(() => {
        return [...(user?.extratos || [])].reverse();
    }, [user]);

    const filteredItems = useMemo(() => {
        let items = [...allItems];

        if (exportMode === "period" && periodStart && periodEnd) {
            const startDate = new Date(`${periodStart}-01T00:00:00`);
            const endDate = new Date(`${periodEnd}-01T00:00:00`);

            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setMilliseconds(endDate.getMilliseconds() - 1);

            items = items.filter((item) => {
                const itemDate = parseTransactionDate(item);

                if (!itemDate) return false;

                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        if (filterType !== "all") {
            items = items.filter((item) => item.tipo === filterType);
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase();

            items = items.filter((item) => {
                const text = [
                    item.descricao,
                    item.status,
                    item.metodo,
                    item.origem,
                    item.transactionId,
                    item.category,
                    item.goalName,
                    item.tipo,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(term);
            });
        }

        return items;
    }, [allItems, exportMode, periodStart, periodEnd, filterType, search]);

    const summary = useMemo(() => {
        const totalCredit = filteredItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const totalDebit = filteredItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor || 0), 0);

        const balance = totalCredit - totalDebit;

        const biggestMovement = filteredItems.reduce<Extrato | null>((current, item) => {
            if (!current) return item;

            return Math.abs(Number(item.valor || 0)) > Math.abs(Number(current.valor || 0))
                ? item
                : current;
        }, null);

        const average =
            filteredItems.length > 0
                ? filteredItems.reduce((sum, item) => sum + Number(item.valor || 0), 0) /
                  filteredItems.length
                : 0;

        return {
            totalCredit,
            totalDebit,
            balance,
            count: filteredItems.length,
            biggestMovement,
            average,
            statusText: balance >= 0 ? "positivo" : "negativo",
        };
    }, [filteredItems]);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function parseTransactionDate(item: Extrato) {
        if (item.createdAt) {
            const date = new Date(item.createdAt);

            if (!Number.isNaN(date.getTime())) return date;
        }

        if (item.dataHora) {
            const date = parseBrazilianDateTime(item.dataHora);

            if (date) return date;
        }

        if (item.data) {
            const [day, month, year] = item.data.split("/").map(Number);

            if (day && month && year) {
                return new Date(year, month - 1, day);
            }
        }

        return null;
    }

    function parseBrazilianDateTime(value: string) {
        const [datePart, timePart] = value.split(" ");

        if (!datePart) return null;

        const [day, month, year] = datePart.split("/").map(Number);
        const [hour = 0, minute = 0, second = 0] = (timePart || "")
            .split(":")
            .map(Number);

        if (!day || !month || !year) return null;

        return new Date(year, month - 1, day, hour, minute, second);
    }

    function getPeriodLabel() {
        if (exportMode !== "period" || !periodStart || !periodEnd) {
            return "Extrato completo";
        }

        if (periodStart === periodEnd) {
            return formatMonth(periodStart);
        }

        return `${formatMonth(periodStart)} até ${formatMonth(periodEnd)}`;
    }

    function formatMonth(monthKey: string) {
        const [year, month] = monthKey.split("-");

        return new Date(Number(year), Number(month) - 1, 1).toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
        });
    }

    function getTransactionTitle(item: Extrato) {
        if (item.descricao) return item.descricao;

        if (item.tipo === "credito") return "Entrada registrada";

        return "Saída registrada";
    }

    function getTransactionSubtitle(item: Extrato) {
        if (item.dataHora) return item.dataHora;
        if (item.hora) return `${item.data} às ${item.hora}`;

        return item.data;
    }

    function getTransactionMeta(item: Extrato) {
        const parts = [];

        if (item.status) parts.push(item.status);
        if (item.origem) parts.push(item.origem);
        if (item.transactionId) parts.push(`ID: ${item.transactionId}`);

        return parts.join(" • ");
    }

    async function handleExport() {
    if (!user) return;

    const rows = filteredItems.map((item) => ({
        data: item.data,
        hora: item.hora || "",
        descricao: getTransactionTitle(item),
        tipo: item.tipo === "credito" ? "Crédito" : "Débito",
        valor: formatCurrency(Number(item.valor || 0)),
    }));

    const now = new Date();

    const fileName =
        exportMode === "period" && periodStart && periodEnd
            ? `extrato_${periodStart}_a_${periodEnd}.pdf`
            : `extrato_completo_${now.getFullYear()}-${String(
                  now.getMonth() + 1
              ).padStart(2, "0")}.pdf`;

    exportStatementPdf({
        title: "Extrato financeiro",
        subtitle: `${getPeriodLabel()} • ${user.nome}`,
        logoText: "SAVEAPP",
        rows,
        footers: [
            {
                label: "Total de créditos",
                value: formatCurrency(summary.totalCredit),
            },
            {
                label: "Total de débitos",
                value: formatCurrency(summary.totalDebit),
            },
            {
                label: "Saldo do período",
                value: formatCurrency(summary.balance),
            },
            {
                label: "Quantidade de registros",
                value: String(summary.count),
            },
            {
                label: "Gerado em",
                value: now.toLocaleString("pt-BR"),
            },
        ],
        fileName,
    });
}

    function clearFilters() {
        setExportMode("all");
        setPeriodStart("");
        setPeriodEnd("");
        setFilterType("all");
        setSearch("");
    }

    if (!user) {
        return (
            <main className="statement-page">
                <div className="statement-loading">Carregando histórico...</div>
            </main>
        );
    }

    return (
        <main className="statement-page">
            <Container className="statement-container">
                <AccountHeader name={user.nome} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <TitleHeader title="Histórico de Movimentações" backLink="/homescreen" />

                    <section className="statement-hero">
                        <div>
                            <span className="statement-badge">Extrato financeiro</span>
                            <h1>{getPeriodLabel()}</h1>
                            <p>
                                Consulte suas entradas, saídas, filtros e exporte um PDF
                                profissional com resumo financeiro do período.
                            </p>
                        </div>

                        <div className="statement-balance-card">
                            <span>Saldo atual</span>
                            <strong>{formatCurrency(Number(user.saldo_final || 0))}</strong>
                            <small>
                                Resultado filtrado:{" "}
                                <b className={summary.balance >= 0 ? "positive" : "negative"}>
                                    {formatCurrency(summary.balance)}
                                </b>
                            </small>
                        </div>
                    </section>

                    <section className="statement-summary-grid">
                        <div className="statement-summary-card">
                            <span>Créditos</span>
                            <strong className="positive">
                                {formatCurrency(summary.totalCredit)}
                            </strong>
                        </div>

                        <div className="statement-summary-card">
                            <span>Débitos</span>
                            <strong className="negative">
                                {formatCurrency(summary.totalDebit)}
                            </strong>
                        </div>

                        <div className="statement-summary-card">
                            <span>Saldo do período</span>
                            <strong className={summary.balance >= 0 ? "positive" : "negative"}>
                                {formatCurrency(summary.balance)}
                            </strong>
                        </div>

                        <div className="statement-summary-card">
                            <span>Registros</span>
                            <strong>{summary.count}</strong>
                        </div>
                    </section>

                    <section className="statement-filters">
                        <div className="statement-filter-header">
                            <div>
                                <span className="statement-badge secondary">Filtros</span>
                                <h2>Personalizar extrato</h2>
                            </div>

                            <div className="statement-filter-actions">
                                <button type="button" className="statement-secondary-btn" onClick={clearFilters}>
                                    Limpar
                                </button>

                                <button type="button" className="statement-main-btn" onClick={handleExport}>
                                    <i className="bi bi-file-earmark-pdf"></i>
                                    Exportar PDF
                                </button>
                            </div>
                        </div>

                        <div className="statement-filter-grid">
                            <label>
                                Modo
                                <select
                                    value={exportMode}
                                    onChange={(event) =>
                                        setExportMode(event.target.value as "all" | "period")
                                    }
                                >
                                    <option value="all">Extrato completo</option>
                                    <option value="period">Período específico</option>
                                </select>
                            </label>

                            <label>
                                Início
                                <input
                                    type="month"
                                    value={periodStart}
                                    disabled={exportMode === "all"}
                                    onChange={(event) => setPeriodStart(event.target.value)}
                                />
                            </label>

                            <label>
                                Fim
                                <input
                                    type="month"
                                    value={periodEnd}
                                    disabled={exportMode === "all"}
                                    onChange={(event) => setPeriodEnd(event.target.value)}
                                />
                            </label>

                            <label>
                                Tipo
                                <select
                                    value={filterType}
                                    onChange={(event) =>
                                        setFilterType(event.target.value as FilterType)
                                    }
                                >
                                    <option value="all">Todos</option>
                                    <option value="credito">Somente créditos</option>
                                    <option value="debito">Somente débitos</option>
                                </select>
                            </label>
                        </div>

                        <div className="statement-search-row">
                            <i className="bi bi-search"></i>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por descrição, status, origem ou ID..."
                            />
                        </div>
                    </section>

                    <section className="statement-list-section">
                        <div className="statement-list-header">
                            <div>
                                <span className="statement-badge">Movimentações</span>
                                <h2>{summary.count} registros encontrados</h2>
                            </div>
                        </div>

                        <div className="statement-list">
                            {filteredItems.length === 0 ? (
                                <div className="statement-empty">
                                    <i className="bi bi-receipt"></i>
                                    <h3>Nenhuma movimentação encontrada</h3>
                                    <p>Altere os filtros ou registre novas entradas e saídas.</p>
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <article
                                        className={`statement-item statement-item-${item.tipo}`}
                                        key={item.id}
                                        onClick={() => navigate(`/transaction/${item.id}`)}
                                    >
                                        <div className="statement-item-left">
                                            <div className="statement-item-icon">
                                                <i
                                                    className={`bi ${
                                                        item.tipo === "credito"
                                                            ? "bi-arrow-down-left"
                                                            : "bi-arrow-up-right"
                                                    }`}
                                                ></i>
                                            </div>

                                            <div>
                                                <h3>{getTransactionTitle(item)}</h3>
                                                <p>{getTransactionSubtitle(item)}</p>

                                                {getTransactionMeta(item) && (
                                                    <small>{getTransactionMeta(item)}</small>
                                                )}
                                            </div>
                                        </div>

                                        <strong
                                            className={
                                                item.tipo === "credito" ? "positive" : "negative"
                                            }
                                        >
                                            {item.tipo === "credito" ? "+" : "-"}{" "}
                                            {formatCurrency(Number(item.valor || 0))}
                                        </strong>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </motion.div>
            </Container>
        </main>
    );
}