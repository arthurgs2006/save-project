import { useMemo } from "react";

interface Extrato {
    data: string;
    valor: number | string;
    tipo: "credito" | "debito";
}

interface User {
    id: number | string;
    extratos: Extrato[];
}

interface MesHistorico {
    mes: string;
    valor: number;
    atual: boolean;
    futuro: boolean;
}

export default function GraphicCard({ user }: { user: User }) {
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

        const mediaGastos =
            gastosMensais.length > 0
                ? gastosMensais.reduce((a, b) => a + b, 0) / gastosMensais.length
                : 0;

        const hoje = new Date();
        const meses: MesHistorico[] = [];
        let saldoProjetado = 0;

        for (let i = -3; i <= 2; i++) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const nome = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");

            let valorMes = 0;

            if (i <= 0) {
                valorMes = map[key] || 0;
                saldoProjetado = valorMes;
            } else {
                saldoProjetado = Math.round(saldoProjetado - mediaGastos);
                valorMes = saldoProjetado;
            }

            meses.push({
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
            {history.map((item, index) => (
                <div key={index} className="wallet-pill-chart-col">
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