import { useEffect, useState } from "react";

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

export default function GraphicCard() {
  const [history, setHistory] = useState<MesHistorico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("loggedUser");
      if (!stored) return;

      const parsed: { id: number | string } = JSON.parse(stored);

      try {
        const res = await fetch(`http://localhost:3001/users/${parsed.id}`);
        const user: User = await res.json();

        if (!user || !user.extratos) {
          setHistory([]);
          return;
        }

        const map: Record<string, number> = {};
        const gastosMensais: number[] = [];

        user.extratos.forEach((item) => {
          const d = new Date(item.data);
          if (isNaN(d.getTime())) return;

          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;

          const valor = Number(item.valor);
          const real = item.tipo === "credito" ? valor : -valor;

          map[key] = (map[key] || 0) + real;

          if (item.tipo === "debito") gastosMensais.push(valor);
        });

        const mediaGastos =
          gastosMensais.length > 0
            ? gastosMensais.reduce((a, b) => a + b, 0) / gastosMensais.length
            : 0;

        const hoje = new Date();
        const meses: MesHistorico[] = [];
        let saldoAtual = 0;

        for (let i = -3; i <= 2; i++) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;

          const nome = d
            .toLocaleString("pt-BR", { month: "short" })
            .replace(".", "");

          const valorMes =
            i <= 0 ? map[key] || 0 : Math.round(saldoAtual - mediaGastos);

          if (i <= 0) saldoAtual += valorMes;
          else saldoAtual = valorMes;

          meses.push({
            mes: nome.charAt(0).toUpperCase() + nome.slice(1),
            valor: valorMes,
            atual: i === 0,
            futuro: i > 0,
          });
        }

        setHistory(meses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p className="text-center text-secondary">Carregando gráfico...</p>;
  if (history.length === 0) return null;

  const max = Math.max(...history.map((h) => Math.abs(h.valor)), 1);

  return (
    <div className="d-flex justify-content-center align-items-end mt-4 gap-3">
      {history.map((item, i) => (
        <div key={i} className="text-center">
          <div
            className={`rounded-pill mx-auto ${
              item.atual
                ? "bg-primary"
                : item.futuro
                ? "bg-info opacity-50"
                : "bg-secondary opacity-25"
            }`}
            style={{
              width: "22px",
              height: `${Math.max((Math.abs(item.valor) / max) * 100, 12)}px`,
              transition: "0.3s",
            }}
          ></div>
          <small className="text-secondary">{item.mes}</small>
        </div>
      ))}
    </div>
  );
}
