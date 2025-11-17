import { useEffect, useState } from "react";

export default function GraphicCard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("loggedUser");
      if (!stored) return;

      const parsed = JSON.parse(stored);

      try {
        const res = await fetch(`http://localhost:3001/users/${parsed.id}`);
        const user = await res.json();

        if (!user || !user.extratos) {
          setHistory([]);
          return;
        }

        const extratos = user.extratos;

        // Agrupamento de valores por mês
        const map: any = {};
        const countDeposits: any = {};
        const countDebits: any = {};

        extratos.forEach((item: any) => {
          const d = new Date(item.data);
          if (isNaN(d.getTime())) return;

          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;

          const valor = Number(item.valor);
          const real = item.tipo === "credito" ? valor : -valor;

          // Soma valores
          map[key] = (map[key] || 0) + real;

          // Conta quantidade
          if (item.tipo === "credito") {
            countDeposits[key] = (countDeposits[key] || 0) + 1;
          } else {
            countDebits[key] = (countDebits[key] || 0) + 1;
          }
        });

        // Média das quantidades para projetar futuro
        const valoresDeposito = Object.values(countDeposits);
        const valoresDebito = Object.values(countDebits);

        const mediaDepositos =
          valoresDeposito.length > 0
            ? valoresDeposito.reduce((a: any, b: any) => a + b, 0) /
              valoresDeposito.length
            : 0;

        const mediaGastos =
          valoresDebito.length > 0
            ? valoresDebito.reduce((a: any, b: any) => a + b, 0) /
              valoresDebito.length
            : 0;

        // PROJEÇÃO baseada na diferença
        const projeção = mediaDepositos - mediaGastos;

        // 3 meses passados, atual, 2 futuros
        const hoje = new Date();
        const meses = [];

        for (let i = -3; i <= 2; i++) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;

          const nome = d
            .toLocaleString("pt-BR", { month: "short" })
            .replace(".", "");

          meses.push({
            mes: nome.charAt(0).toUpperCase() + nome.slice(1),
            valor:
              i < 0
                ? map[key] || 0 // passado real
                : i === 0
                ? map[key] || 0 // mês atual real
                : projeção, // futuro baseado na diferença depósitos - gastos
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
              height: `${Math.max(
                (Math.abs(item.valor) / max) * 100,
                12
              )}px`,
              transition: "0.3s",
            }}
          ></div>
          <small className="text-secondary">{item.mes}</small>
        </div>
      ))}
    </div>
  );
}
