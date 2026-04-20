import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Button, ListGroup, ListGroupItem } from "reactstrap";
import { motion } from "framer-motion";

import { exportStatementPdf } from "../../utils/pdf";
import { BASE_URL } from "../../config";
import AccountHeader from "../../components/generic_components/accountHeader";
import TitleHeader from "../../components/generic_components/titleHeader";

interface Extrato {
    id: number | string;
    transactionId?: string;
    data: string;
    hora?: string;
    dataHora?: string;
    descricao?: string;
    valor: number;
    tipo: "credito" | "debito";
    status?: string;
}

interface User {
    id: number | string;
    nome: string;
    extratos: Extrato[];
}

export default function TransactionHistory() {
    const [user, setUser] = useState<User | null>(null);
    const [exportMode, setExportMode] = useState<"all" | "period">("all");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
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

    const exportItems = useMemo(() => {
        if (!user) return [];
        const items = [...user.extratos].reverse();

        if (exportMode !== "period" || !periodStart || !periodEnd) {
            return items;
        }

        const startDate = new Date(`${periodStart}-01`);
        const endDate = new Date(`${periodEnd}-01`);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setSeconds(endDate.getSeconds() - 1);

        return items.filter((item) => {
            const [day, month, year] = item.data.split("/");
            const itemDate = new Date(Number(year), Number(month) - 1, Number(day));
            return itemDate >= startDate && itemDate <= endDate;
        });
    }, [user, exportMode, periodStart, periodEnd]);

    async function handleExport() {
        const now = new Date();
        const fileName = exportMode === "period"
            ? `extrato_${periodStart}_a_${periodEnd}.pdf`
            : `extrato_completo_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.pdf`;

        const headerLines = [
            "SAVE PROJECT",
            `Extrato de ${user?.nome || "Usuário"}`,
            exportMode === "period"
                ? `Mês: ${periodStart}`
                : "Extrato completo desde o início",
            "",
            "Data       Hora     Descrição                            Tipo   Valor",
            "------------------------------------------------------------",
        ];

        const detailLines = exportItems.map((item) => {
            const date = item.data;
            const time = item.hora || "";
            const description = item.descricao || (item.tipo === "credito" ? "Crédito" : "Débito");
            const type = item.tipo === "credito" ? "+" : "-";
            return `${date} ${time} | ${description} | ${type} | R$ ${formatCurrency(Number(item.valor))}`;
        });

        const totalCredit = exportItems
            .filter((item) => item.tipo === "credito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const totalDebit = exportItems
            .filter((item) => item.tipo === "debito")
            .reduce((sum, item) => sum + Number(item.valor), 0);
        const balance = totalCredit - totalDebit;

        const rows = exportItems.map((item) => ({
            data: item.data,
            hora: item.hora || "",
            descricao: item.descricao || (item.tipo === "credito" ? "Crédito" : "Débito"),
            tipo: item.tipo === "credito" ? "Crédito" : "Débito",
            valor: `R$ ${formatCurrency(Number(item.valor))}`,
        }));

        const footers = [
            { label: "Total crédito", value: `R$ ${formatCurrency(totalCredit)}` },
            { label: "Total débito", value: `R$ ${formatCurrency(totalDebit)}` },
            { label: "Saldo do período", value: `R$ ${formatCurrency(balance)}` },
            { label: "Panorama", value: balance < 0 ? "Insuficiente" : "Adequado" },
        ];

        await exportStatementPdf({
            title: exportMode === "period"
                ? `Extrato de ${periodStart}`
                : "Extrato completo",
            subtitle: exportMode === "period"
                ? `Período: ${periodStart}`
                : "Extrato completo desde o início",
            logoText: "SAVE PROJECT",
            rows,
            footers,
            fileName,
        });
    }

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
                console.warn("Servidor indisponível.");
            }
        }

        loadUser();
    }, [navigate]);

    const extratos = useMemo(() => {
        return [...(user?.extratos || [])].reverse();
    }, [user]);

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

    if (!user) {
        return (
            <div className="home-apple-screen d-flex justify-content-center align-items-center text-white min-vh-100">
                <div className="home-loading">Carregando histórico...</div>
            </div>
        );
    }

    return (
        <div className="home-apple-screen text-white min-vh-100 py-4 py-md-5">
            <div className="home-bg-orb home-bg-orb-1"></div>
            <div className="home-bg-orb home-bg-orb-2"></div>
            <div className="home-bg-orb home-bg-orb-3"></div>

            <Container className="home-shell">
                <AccountHeader name={user.nome} />

                <motion.div
                    className="home-main"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TitleHeader
                        title="Histórico de Movimentações"
                        backLink="/homescreen"
                    />

                    <section className="home-section">
                        <div className="home-section-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                            <div>
                                <h5 className="home-section-title">Movimentações desde o início</h5>
                                <small className="home-section-description text-muted-light">
                                    Veja todas as entradas e saídas registradas na conta.
                                </small>
                            </div>

                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                                <Button
                                    color="primary"
                                    size="sm"
                                    className="home-action-btn home-action-btn-primary"
                                    onClick={() => {
                                        setExportMode("all");
                                        handleExport();
                                    }}
                                >
                                    <div className="home-action-icon">
                                        <i className="bi bi-download"></i>
                                    </div>
                                    <span className="home-action-label">
                                        Exportar extrato completo
                                    </span>
                                </Button>

                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        color={exportMode === "period" ? "primary" : "secondary"}
                                        size="sm"
                                        className="fw-semibold"
                                        onClick={() => setExportMode("period")}
                                    >
                                        Período específico
                                    </Button>
                                    {exportMode === "period" && (
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                            <input
                                                type="month"
                                                className="form-control form-control-sm"
                                                value={periodStart}
                                                onChange={(e) => setPeriodStart(e.target.value)}
                                                placeholder="Início"
                                            />
                                            <input
                                                type="month"
                                                className="form-control form-control-sm"
                                                value={periodEnd}
                                                onChange={(e) => setPeriodEnd(e.target.value)}
                                                placeholder="Fim"
                                            />
                                            <Button
                                                color="primary"
                                                size="sm"
                                                className="fw-semibold"
                                                onClick={handleExport}
                                                disabled={!periodStart || !periodEnd}
                                            >
                                                Exportar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="home-section">
                        {extratos.length > 0 ? (
                            <ListGroup flush className="home-list">
                                {extratos.map((item) => (
                                    <ListGroupItem
                                        key={item.id}
                                        className="home-list-item"
                                        onClick={() => navigate(`/transaction/${item.id}`)}
                                    >
                                        <div className="home-list-left">
                                            <div className="home-list-icon">
                                                <i
                                                    className={`bi ${
                                                        item.tipo === "credito"
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

                                                {item.status && (
                                                    <small className="home-item-meta d-block">
                                                        {item.status}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`home-item-value ${
                                                item.tipo === "credito"
                                                    ? "home-item-value-credit"
                                                    : "home-item-value-debit"
                                            }`}
                                        >
                                            {item.tipo === "credito" ? "+" : "-"}R${" "}
                                            {formatCurrency(Number(item.valor))}
                                        </span>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="home-empty-state text-center">
                                Nenhuma movimentação encontrada.
                            </div>
                        )}
                    </section>
                </motion.div>
            </Container>
        </div>
    );
}
