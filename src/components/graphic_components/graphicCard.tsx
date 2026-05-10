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
        const gastosPorMes: Record<string, number> = {};

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

            if (item.tipo === "debito") {
                gastosPorMes[key] =
                    (gastosPorMes[key] || 0) + valor;
            }
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

                const firstOfCurrentMonth = new Date(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    1
                );
                if (monthDate >= firstOfCurrentMonth) {
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

        const valoresGastosMensais =
            Object.values(gastosPorMes);

        const mediaGastos =
            valoresGastosMensais.length > 0
                ? valoresGastosMensais.reduce(
                    (a, b) => a + b,
                    0
                ) / valoresGastosMensais.length
                : 0;

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
                saldoAtual =
                    (map[key] || 0) +
                    recorrencia;

                valorMes = saldoAtual;
            }

            // FUTURO
            else {
                saldoAtual =
                    saldoAtual +
                    recorrencia -
                    mediaGastos;

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

    // NORMALIZAÇÃO REAL DAS BARRAS
    const values = history.map((item) => item.valor);

    const max = Math.max(...values);

    const min = Math.min(...values);

    const range = Math.max(max - min, 1);

    function getBarHeight(valor: number) {
        const normalized =
            (valor - min) / range;

        return 70 + normalized * 35;
    }

    return (
        <div className="wallet-pill-chart">
            {history.map((item) => (
                <div
                    key={item.key}
                    className={`wallet-pill-chart-col ${
                        item.key === selectedMonth
                            ? "selected-month"
                            : ""
                    }`}
                    style={{
                        cursor: onSelectMonth
                            ? "pointer"
                            : "default",

                        outline:
                            item.key === selectedMonth
                                ? "2px solid rgba(255, 255, 255, 0.6)"
                                : undefined,

                        borderRadius:
                            item.key === selectedMonth
                                ? "18px"
                                : undefined,
                    }}
                    onClick={() =>
                        onSelectMonth?.(item.key)
                    }
                >
                    <div
                        className={`wallet-pill-bar ${
                            item.atual
                                ? "active"
                                : item.futuro
                                ? "future"
                                : "past"
                        }`}
                        style={{
                            height: `${getBarHeight(
                                item.valor
                            )}px`,
                        }}
                    />

                    <span
                        className={`wallet-pill-label ${
                            item.atual
                                ? "active"
                                : ""
                        }`}
                    >
                        {item.mes}
                    </span>
                </div>
            ))}
        </div>
    );
}