import { useMemo } from "react";

interface Extrato {
    data: string;
    valor: number | string;
    tipo: "credito" | "debito";
}

interface RecurringItem {
    id: number | string;
    name: string;
    value: number;
    billingDate: string;
    frequency: string;
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

function monthlyRecurringValue(item: RecurringItem) {
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

export default function GraphicCard({
    user,
    selectedMonth,
    onSelectMonth,
}: {
    user: User;
    selectedMonth?: string | null;
    onSelectMonth?: (monthKey: string) => void;
}) {
    const history = useMemo(() => {
        if (!user || !user.extratos) return [];

        const map: Record<string, number> = {};
        const gastosMensais: number[] = [];

        user.extratos.forEach((item) => {
            const partes = item.data.split("/");
            let d: Date;

            if (partes.length === 3) {
                const [dia, mes, ano] = partes;
                d = new Date(Number(ano), Number(mes) - 1, Number(dia));
            } else {
                d = new Date(item.data);
            }

            if (isNaN(d.getTime())) return;

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const valor = Number(item.valor);
            const real = item.tipo === "credito" ? valor : -valor;

            map[key] = (map[key] || 0) + real;

            if (item.tipo === "debito") {
                gastosMensais.push(valor);
            }
        });

        const hoje = new Date();
        const periodKeys: string[] = [];

        for (let i = -3; i <= 2; i++) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            periodKeys.push(key);
        }

        const recurringItems = [
            ...(user.recurringDebts || []).map((item) => ({ ...item, tipo: "debito" as const })),
            ...(user.recurringCredits || []).map((item) => ({ ...item, tipo: "credito" as const })),
        ];

        const recurringMap: Record<string, number> = {};

        recurringItems.forEach((item) => {
            const monthlyValue = monthlyRecurringValue(item);
            periodKeys.forEach((key) => {
                const [year, month] = key.split("-");
                const monthDate = new Date(Number(year), Number(month) - 1, 1);
                const firstOfCurrentMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

                if (monthDate >= firstOfCurrentMonth) {
                    recurringMap[key] =
                        (recurringMap[key] || 0) +
                        (item.tipo === "credito" ? monthlyValue : -monthlyValue);
                }
            });
        });

        const mediaGastos =
            gastosMensais.length > 0
                ? gastosMensais.reduce((a, b) => a + b, 0) / gastosMensais.length
                : 0;

        const meses: MesHistorico[] = [];
        let saldoProjetado = 0;

        for (let i = -3; i <= 2; i++) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const nome = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
            const recorrencia = recurringMap[key] || 0;

            let valorMes = 0;

            if (i <= 0) {
                valorMes = (map[key] || 0) + (i === 0 ? recorrencia : 0);
                saldoProjetado = valorMes;
            } else {
                saldoProjetado = Math.round(saldoProjetado + recorrencia - mediaGastos);
                valorMes = saldoProjetado;
            }

            meses.push({
                key,
                mes: nome.charAt(0).toUpperCase() + nome.slice(1),
                valor: valorMes,
                atual: i === 0,
                futuro: i > 0,
            });
        }

        return meses;
    }, [user]);

    if (history.length === 0) return null;

    const max = Math.max(...history.map((item) => Math.abs(item.valor)), 1);

    function getBarHeight(valor: number, atual: boolean) {
        const ratio = Math.abs(valor) / max;

        if (atual) {
            return Math.max(ratio * 120, 88);
        }

        return Math.max(ratio * 120, 64);
    }

    return (
        <div className="wallet-pill-chart">
            {history.map((item) => (
                <div
                    key={item.key}
                    className={`wallet-pill-chart-col ${item.key === selectedMonth ? "selected-month" : ""}`}
                    style={{
                        cursor: onSelectMonth ? "pointer" : "default",
                        outline: item.key === selectedMonth ? "2px solid rgba(255, 255, 255, 0.6)" : undefined,
                        borderRadius: item.key === selectedMonth ? "18px" : undefined,
                    }}
                    onClick={() => onSelectMonth?.(item.key)}
                >
                    <div
                        className={`wallet-pill-bar ${item.atual ? "active" : item.futuro ? "future" : "past"}`}
                        style={{ height: `${getBarHeight(item.valor, item.atual)}px` }}
                    />
                    <span className={`wallet-pill-label ${item.atual ? "active" : ""}`}>
                        {item.mes}
                    </span>
                </div>
            ))}
        </div>
    );
}