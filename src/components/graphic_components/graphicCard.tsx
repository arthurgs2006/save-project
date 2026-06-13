import { useEffect, useMemo, useState } from "react";
import { BENEFITS_API_URL } from "../../config";

interface Extrato {
    data: string;
    valor: number | string;
    tipo: "credito" | "debito";
}

interface RecurringItem {
    id: number | string;
    userId?: string;
    name: string;
    value: number;
    type?: "credit" | "debit";
    tipo?: "credito" | "debito";
    billingDate?: string | number;
    billingDay?: string | number;
    frequency: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    monthlyEquivalent?: number;
}

interface User {
    id: number | string;
    saldo_final?: number | string;
    extratos: Extrato[];
    recurringDebts?: RecurringItem[];
    recurringCredits?: RecurringItem[];
}

interface MesHistorico {
    key: string;
    mes: string;
    valor: number;
    atual: boolean;
    futuro: boolean;
}

function getApiRoot() {
    return BENEFITS_API_URL;
}

function normalizeRecurringItem(item: any): RecurringItem {
    return {
        id: item.id ?? item.Id ?? Date.now(),
        userId: String(item.userId ?? item.UserId ?? ""),
        name: item.name ?? item.Name ?? "",
        value: Number(item.value ?? item.Value ?? 0),
        type: String(item.type ?? item.Type ?? "").toLowerCase() === "credit" ? "credit" : "debit",
        billingDate: item.billingDate ?? item.BillingDate ?? item.billingDay ?? item.BillingDay ?? 1,
        billingDay: item.billingDay ?? item.BillingDay ?? item.billingDate ?? item.BillingDate ?? 1,
        frequency: item.frequency ?? item.Frequency ?? "monthly",
        startDate: item.startDate ?? item.StartDate ?? null,
        endDate: item.endDate ?? item.EndDate ?? null,
        isActive: item.isActive ?? item.IsActive ?? true,
        monthlyEquivalent: Number(item.monthlyEquivalent ?? item.MonthlyEquivalent ?? 0),
    };
}

function monthlyRecurringValue(item: RecurringItem) {
    if (item.monthlyEquivalent && item.monthlyEquivalent > 0) {
        return item.monthlyEquivalent;
    }

    switch (item.frequency) {
        case "daily":
            return item.value * 30;

        case "weekly":
            return item.value * 4;

        case "yearly":
            return item.value / 12;

        default:
            return item.value;
    }
}

function getDateFromValue(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

function isRecurringValidForMonth(item: RecurringItem, monthKey: string) {
    if (item.isActive === false) return false;

    const [year, month] = monthKey.split("-");
    const monthStart = new Date(Number(year), Number(month) - 1, 1);
    const monthEnd = new Date(Number(year), Number(month), 0);

    const startDate = getDateFromValue(item.startDate);
    const endDate = getDateFromValue(item.endDate);

    if (startDate && startDate > monthEnd) return false;
    if (endDate && endDate < monthStart) return false;

    return true;
}

function hasRecurringOccurredThisMonth(item: RecurringItem, monthKey: string, today: Date) {
    if (!isRecurringValidForMonth(item, monthKey)) return false;

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    if (monthKey < todayKey) return true;
    if (monthKey > todayKey) return false;

    const startDate = getDateFromValue(item.startDate);
    if (startDate) {
        const startKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
        if (startKey === monthKey && startDate > today) return false;
    }

    const billingDay = Number(item.billingDay ?? item.billingDate ?? 1);
    return billingDay <= today.getDate();
}

function getRecurringSign(item: RecurringItem) {
    const type = item.type || (item.tipo === "credito" ? "credit" : "debit");

    return type === "credit" ? 1 : -1;
}

export default function GraphicCard({
    user,
    selectedMonth,
    onSelectMonth,
}: {
    user: User;
    selectedMonth?: string | null;
    onSelectMonth?: (monthKey: string) => void;
}) {
    const [apiRecurrings, setApiRecurrings] = useState<RecurringItem[]>([]);

    useEffect(() => {
        async function loadRecurrings() {
            if (!user?.id) return;

            try {
                const url = `${getApiRoot()}/recurring-transactions/user/${user.id}`;

                console.log("URL RECORRENTES GRAPHIC:", url);

                const response = await fetch(url);
                const raw = await response.text();

                if (!response.ok) {
                    console.error("Erro ao carregar recorrentes no gráfico:", {
                        status: response.status,
                        body: raw,
                    });

                    return;
                }

                const data = JSON.parse(raw);

                const normalized = Array.isArray(data)
                    ? data.map(normalizeRecurringItem)
                    : [];

                setApiRecurrings(normalized);
            } catch (error) {
                console.warn("Não foi possível carregar recorrentes no gráfico.", error);
            }
        }

        loadRecurrings();
    }, [user?.id]);

    const history = useMemo(() => {
        if (!user) return [];

        const map: Record<string, number> = {};

        const extratos = Array.isArray(user.extratos) ? user.extratos : [];

        extratos.forEach((item) => {
            const partes = item.data.split("/");

            let d: Date;

            if (partes.length === 3) {
                const [dia, mes, ano] = partes;

                d = new Date(
                    Number(ano),
                    Number(mes) - 1,
                    Number(dia)
                );
            } else {
                d = new Date(item.data);
            }

            if (Number.isNaN(d.getTime())) return;

            const key = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            const valor = Number(item.valor);

            const real =
                item.tipo === "credito"
                    ? valor
                    : -valor;

            map[key] = (map[key] || 0) + real;
        });

        const hoje = new Date();

        const periodKeys: string[] = [];

        for (let i = -3; i <= 2; i++) {
            const d = new Date(
                hoje.getFullYear(),
                hoje.getMonth() + i,
                1
            );

            const key = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            periodKeys.push(key);
        }

        const localRecurrings = [
            ...(user.recurringDebts || []).map((item) => ({
                ...item,
                tipo: "debito" as const,
            })),

            ...(user.recurringCredits || []).map((item) => ({
                ...item,
                tipo: "credito" as const,
            })),
        ];

        const recurringItems = apiRecurrings.length > 0 ? apiRecurrings : localRecurrings;

        const recurringMap: Record<string, number> = {};

        recurringItems.forEach((item) => {
            const monthlyValue = monthlyRecurringValue(item);
            const sign = getRecurringSign(item);

            periodKeys.forEach((key) => {
                const [year, month] = key.split("-");

                const monthDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    1
                );

                if (isRecurringValidForMonth(item, key)) {
                    recurringMap[key] =
                        (recurringMap[key] || 0) +
                        (
                            item.tipo === "credito"
                                ? monthlyValue
                                : -monthlyValue
                        );
                }
            });
        });

        const meses: MesHistorico[] = [];

        let saldoAtual = 0;

        for (let i = -3; i <= 2; i++) {
            const d = new Date(
                hoje.getFullYear(),
                hoje.getMonth() + i,
                1
            );

            const key = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            const nome = d
                .toLocaleString("pt-BR", {
                    month: "short",
                })
                .replace(".", "");

            const recorrencia =
                recurringMap[key] || 0;

            let valorMes = 0;

            // PASSADO
            if (i < 0) {
                valorMes = map[key] || 0;
            }

            // MÊS ATUAL
            else if (i === 0) {
                const ocorridos = recurringItems.reduce((acc, item) => {
                    if (!hasRecurringOccurredThisMonth(item, key, hoje)) return acc;

                    const valor = monthlyRecurringValue(item);

                    return acc + (item.tipo === "credito" ? valor : -valor);
                }, 0);

                saldoAtual = Number(user.saldo_final || 0) + ocorridos;

                valorMes = saldoAtual;
            }

            // FUTURO
            else {
                saldoAtual = saldoAtual + recorrencia;

                valorMes = saldoAtual;
            }

            meses.push({
                key,
                mes:
                    nome.charAt(0).toUpperCase() +
                    nome.slice(1),

                valor: Number(valorMes.toFixed(2)),

                atual: i === 0,

                futuro: i > 0,
            });
        }

        return meses;
    }, [user, apiRecurrings]);

    if (history.length === 0) return null;

    // NORMALIZAÇÃO DO TRAÇADO
    const values = history.map((item) => item.valor);

    const max = Math.max(...values, 0);

    const min = Math.min(...values, 0);

    const range = Math.max(max - min, 1);

    const width = 1200;
    const height = 160;
    const paddingX = 28;
    const paddingTop = 26;
    const paddingBottom = 34;
    const plotHeight = height - paddingTop - paddingBottom;

    const step = (width - paddingX * 2) / (history.length - 1);

    function getX(index: number) {
        return paddingX + index * step;
    }

    function getY(valor: number) {
        const normalized = (valor - min) / range;
        return paddingTop + (1 - normalized) * plotHeight;
    }

    const zeroY = getY(0);

    const points = history.map((item, index) => ({ x: getX(index), y: getY(item.valor) }));

    function buildSmoothPath(pts: { x: number; y: number }[]) {
        if (pts.length < 2) return `M${pts[0]?.x ?? 0},${pts[0]?.y ?? 0}`;

        let path = `M${pts[0].x},${pts[0].y}`;

        for (let i = 0; i < pts.length - 1; i++) {
            const current = pts[i];
            const next = pts[i + 1];
            const midX = (current.x + next.x) / 2;

            path += ` C${midX},${current.y} ${midX},${next.y} ${next.x},${next.y}`;
        }

        return path;
    }

    const linePath = buildSmoothPath(points);
    const areaPath = `${linePath} L${getX(history.length - 1)},${zeroY} L${getX(0)},${zeroY} Z`;

    return (
        <div className="wallet-line-chart">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="wallet-line-chart-svg">
                <defs>
                    <linearGradient id="walletLineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5f90ff" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#5f90ff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <line x1={paddingX} y1={zeroY} x2={width - paddingX} y2={zeroY} className="wallet-line-zero" />

                <path d={areaPath} className="wallet-line-area" fill="url(#walletLineFill)" />
                <path d={linePath} className="wallet-line-stroke" fill="none" />

                {history.map((item, index) => (
                    <circle
                        key={item.key}
                        cx={getX(index)}
                        cy={getY(item.valor)}
                        r={item.key === selectedMonth ? 6 : item.atual ? 5 : 4}
                        className={`wallet-line-dot ${item.atual ? "active" : ""} ${item.key === selectedMonth ? "selected" : ""}`}
                        style={{ cursor: onSelectMonth ? "pointer" : "default" }}
                        onClick={() => onSelectMonth?.(item.key)}
                    />
                ))}
            </svg>

            <div className="wallet-line-labels">
                {history.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`wallet-line-label ${item.atual ? "active" : ""} ${item.key === selectedMonth ? "selected" : ""}`}
                        onClick={() => onSelectMonth?.(item.key)}
                    >
                        <span className="wallet-line-value">
                            {item.valor.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                maximumFractionDigits: 0,
                            })}
                        </span>
                        <span className="wallet-line-month">{item.mes}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}