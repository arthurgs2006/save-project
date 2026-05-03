import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Brush,
} from "recharts";
import "./currency.scss";
import TitleHeader from "../../components/generic_components/titleHeader";
import { BENEFITS_API_URL } from "../../config";

// ─── Types ───────────────────────────────────────────────────

type CurrencyQuote = {
  code: string;
  codeIn: string;
  name: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  varBid: number;
  pctChange: number;
  createdAt: string;
};

type HistoryPoint = {
  date: string;
  bid: number;
  high: number;
  low: number;
  pctChange: number;
};

type ConvertResult = {
  amount: number;
  from: string;
  to: string;
  rate: number;
  result: number;
  message: string;
};

type InsightData = {
  profile: string;
  insights: string[];
  recommendedCurrencies: string[];
};

// ─── Constants ───────────────────────────────────────────────

const QUOTE_SYMBOLS = "USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL,CAD-BRL,ARS-BRL,ETH-BRL,SOL-BRL";

const CURRENCY_OPTIONS = ["BRL", "USD", "EUR", "GBP", "CAD", "ARS", "BTC", "ETH"];

const HISTORY_OPTIONS = [
  { label: "Dólar (USD)", value: "USD-BRL" },
  { label: "Euro (EUR)", value: "EUR-BRL" },
  { label: "Libra (GBP)", value: "GBP-BRL" },
  { label: "Bitcoin (BTC)", value: "BTC-BRL" },
  { label: "Ethereum (ETH)", value: "ETH-BRL" },
  { label: "Dólar Canadense (CAD)", value: "CAD-BRL" },
  { label: "Peso Argentino (ARS)", value: "ARS-BRL" },
];

const HISTORY_DAYS = [7, 15, 30];

// ─── Helpers ─────────────────────────────────────────────────

function formatCurrencyValue(value: number, code = "BRL"): string {
  const abs = Math.abs(value);
  const isCrypto = ["BTC", "ETH", "SOL"].includes(code.toUpperCase());

  if (isCrypto) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (abs < 0.01) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  }

  if (abs < 1) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatConverted(value: number, currency: string): string {
  const abs = Math.abs(value);
  const isCrypto = ["BTC", "ETH", "SOL"].includes(currency.toUpperCase());

  if (isCrypto) {
    return `${currency} ${value.toLocaleString("pt-BR", { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
  }

  if (abs < 1) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: currency === "BRL" ? "BRL" : "BRL",
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  }

  try {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `${currency} ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function getSpread(quote: CurrencyQuote): string {
  const spread = Math.abs(quote.ask - quote.bid);
  if (spread < 0.000001) return "—";
  return formatCurrencyValue(spread, quote.code);
}

function getVolatility(quote: CurrencyQuote): number {
  if (!quote.high || !quote.low || quote.bid === 0) return 0;
  return ((quote.high - quote.low) / quote.bid) * 100;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(3)}%`;
}

function generateAutoInsights(quotes: CurrencyQuote[]): string[] {
  if (!quotes.length) return [];

  const insights: string[] = [];

  const sorted = [...quotes].sort((a, b) => b.pctChange - a.pctChange);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (best && best.pctChange > 0) {
    insights.push(
      `${best.name.split("/")[0].trim()} teve a maior alta hoje entre os ativos monitorados (${formatPct(best.pctChange)}).`
    );
  }

  if (worst && worst.pctChange < 0) {
    insights.push(
      `${worst.name.split("/")[0].trim()} registrou a maior queda do dia (${formatPct(worst.pctChange)}).`
    );
  }

  const volatilities = quotes.map((q) => ({ quote: q, vol: getVolatility(q) }));
  const mostVolatile = volatilities.sort((a, b) => b.vol - a.vol)[0];
  if (mostVolatile && mostVolatile.vol > 0) {
    insights.push(
      `${mostVolatile.quote.name.split("/")[0].trim()} apresenta maior volatilidade no período (oscilação de ${mostVolatile.vol.toFixed(2)}% entre máxima e mínima).`
    );
  }

  const stable = quotes.filter((q) => Math.abs(q.pctChange) < 0.2);
  if (stable.length) {
    const names = stable.map((q) => q.code).join(", ");
    insights.push(`${names} ${stable.length === 1 ? "apresenta" : "apresentam"} menor oscilação no momento — moeda${stable.length === 1 ? "" : "s"} mais estável${stable.length === 1 ? "" : "is"} do dia.`);
  }

  const arsQuote = quotes.find((q) => q.code === "ARS");
  if (arsQuote && arsQuote.bid < 0.1) {
    insights.push(
      "ARS tem preço muito baixo em BRL, por isso a cotação usa mais casas decimais para maior precisão."
    );
  }

  return insights;
}

// ─── Subcomponents ───────────────────────────────────────────

function MarketBadge({ type }: { type: "best" | "worst" | "volatile" }) {
  const map = {
    best: { label: "Melhor do dia", cls: "badge--best" },
    worst: { label: "Maior queda", cls: "badge--worst" },
    volatile: { label: "Mais volátil", cls: "badge--volatile" },
  };
  const { label, cls } = map[type];
  return <span className={`market-badge ${cls}`}>{label}</span>;
}

function QuoteCard({
  quote,
  isBest,
  isWorst,
  isVolatile,
}: {
  quote: CurrencyQuote;
  isBest: boolean;
  isWorst: boolean;
  isVolatile: boolean;
}) {
  const pct = Number(quote.pctChange);
  const isUp = pct >= 0;
  const spread = getSpread(quote);
  const vol = getVolatility(quote);

  return (
    <div className={`market-item ${isBest ? "market-item--best" : ""} ${isWorst ? "market-item--worst" : ""}`}>
      <div className="market-item__top">
        <div>
          <span className="market-symbol">{quote.code} / {quote.codeIn || "BRL"}</span>
          <h3>{quote.name}</h3>
        </div>
        <div className="market-item__badges">
          {isBest && <MarketBadge type="best" />}
          {isWorst && <MarketBadge type="worst" />}
          {isVolatile && <MarketBadge type="volatile" />}
          <span className={`market-change ${isUp ? "up" : "down"}`}>
            {formatPct(pct)}
          </span>
        </div>
      </div>

      <strong className="market-price">{formatCurrencyValue(Number(quote.bid), quote.code)}</strong>

      <div className="market-meta">
        <div className="market-meta__row">
          <span>Máx</span>
          <strong>{formatCurrencyValue(Number(quote.high), quote.code)}</strong>
        </div>
        <div className="market-meta__row">
          <span>Mín</span>
          <strong>{formatCurrencyValue(Number(quote.low), quote.code)}</strong>
        </div>
        <div className="market-meta__row">
          <span>Spread</span>
          <strong>{spread}</strong>
        </div>
        <div className="market-meta__row">
          <span>Volatilidade</span>
          <strong>{vol > 0 ? `${vol.toFixed(2)}%` : "—"}</strong>
        </div>
      </div>

      <small className="market-hint">{quote.createdAt || "—"}</small>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function Currency() {
  const [quotes, setQuotes] = useState<CurrencyQuote[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historySymbol, setHistorySymbol] = useState("USD-BRL");
  const [historyDays, setHistoryDays] = useState(15);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);

  const [userInsights, setUserInsights] = useState<InsightData | null>(null);
  const [autoInsights, setAutoInsights] = useState<string[]>([]);

  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState("BRL");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [converting, setConverting] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Derived highlights ───────────────────────────────────

  const { bestQuote, worstQuote, mostVolatileQuote } = useMemo(() => {
    if (!quotes.length) return { bestQuote: null, worstQuote: null, mostVolatileQuote: null };
    const sorted = [...quotes].sort((a, b) => b.pctChange - a.pctChange);
    const byVol = [...quotes].sort((a, b) => getVolatility(b) - getVolatility(a));
    return {
      bestQuote: sorted[0],
      worstQuote: sorted[sorted.length - 1],
      mostVolatileQuote: byVol[0],
    };
  }, [quotes]);

  const comparisonData = useMemo(
    () =>
      quotes.map((q) => ({
        code: q.code,
        variacao: Number(q.pctChange || 0),
        volatilidade: Number(getVolatility(q).toFixed(3)),
      })),
    [quotes]
  );

  // ── Effects ──────────────────────────────────────────────

  useEffect(() => {
    loadQuotes();
    loadUserInsights();
  }, []);

  useEffect(() => {
    loadHistory(historySymbol, historyDays);
  }, [historySymbol, historyDays]);

  // ── Loaders ──────────────────────────────────────────────

  async function loadQuotes() {
    setLoading(true);
    try {
      const response = await fetch(`${BENEFITS_API_URL}/currency/quotes?symbols=${QUOTE_SYMBOLS}`);
      const data = await response.json();
      const loaded: CurrencyQuote[] = (data.quotes || []).map((q: any) => ({
        ...q,
        bid: Number(q.bid ?? 0),
        ask: Number(q.ask ?? 0),
        high: Number(q.high ?? 0),
        low: Number(q.low ?? 0),
        varBid: Number(q.varBid ?? 0),
        pctChange: Number(q.pctChange ?? 0),
      }));
      setQuotes(loaded);
      setAutoInsights(generateAutoInsights(loaded));
    } catch {
      setError("Não foi possível carregar as cotações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(symbol: string, days: number) {
    setHistoryUnavailable(false);
    try {
      const response = await fetch(`${BENEFITS_API_URL}/currency/history?symbol=${symbol}&days=${days}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error();
      setHistory(
        data.map((item: any) => ({
          date: item.date || item.Date || "",
          bid: Number(item.bid ?? item.Bid ?? 0),
          high: Number(item.high ?? item.High ?? 0),
          low: Number(item.low ?? item.Low ?? 0),
          pctChange: Number(item.pctChange ?? item.PctChange ?? 0),
        }))
      );
    } catch {
      setHistory([]);
      setHistoryUnavailable(true);
    }
  }

  async function loadUserInsights() {
    try {
      const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");
      const response = await fetch(`${BENEFITS_API_URL}/currency/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || 1,
          balance: Number(user.saldo_final || 0),
          income: Number(user.receita || 0),
          preferences: Array.isArray(user.preferencias) ? user.preferencias : [],
        }),
      });

      if (!response.ok) {
        setUserInsights(null);
        return;
      }

      const data = await response.json();

      // Guard: só aceita se vier com a estrutura esperada
      if (data && Array.isArray(data.insights)) {
        setUserInsights(data);
      } else {
        setUserInsights(null);
      }
    } catch {
      setUserInsights(null);
    }
  }

  async function handleConvert() {
    setConverting(true);
    setError("");
    try {
      const response = await fetch(`${BENEFITS_API_URL}/currency/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, from, to }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult(data);
    } catch {
      setError("Erro ao converter moeda. Verifique os valores e tente novamente.");
    } finally {
      setConverting(false);
    }
  }

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="currency-page">
      <TitleHeader title="Moedas" />

      {error && (
        <div className="currency-error">
          <i className="bi bi-exclamation-triangle-fill" /> {error}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="currency-hero">
        <div className="currency-hero__text">
          <span className="currency-badge">Mercado ao vivo</span>
          <h1>Moedas em tempo real</h1>
          <p>
            Acompanhe cotações, converta valores e visualize gráficos históricos.
            Dados atualizados via AwesomeAPI.
          </p>
        </div>

        <div className="currency-hero__stats">
          <div className="hero-stat">
            <strong>{loading ? "—" : quotes.length}</strong>
            <span>Moedas</span>
          </div>
          <div className="hero-stat hero-stat--up">
            <strong>
              {bestQuote ? `${bestQuote.code} ${formatPct(bestQuote.pctChange)}` : "—"}
            </strong>
            <span>Melhor alta</span>
          </div>
          <div className="hero-stat hero-stat--down">
            <strong>
              {worstQuote ? `${worstQuote.code} ${formatPct(worstQuote.pctChange)}` : "—"}
            </strong>
            <span>Maior queda</span>
          </div>
          <div className="hero-stat">
            <strong>{userInsights?.profile ?? "—"}</strong>
            <span>Perfil</span>
          </div>
        </div>
      </section>

      {/* ── Cotações de mercado ── */}
      <section className="currency-section">
        <div className="currency-section__header">
          <span className="card-kicker">Cotações</span>
          <h2>Mercado</h2>
          <button className="refresh-btn" onClick={loadQuotes} title="Atualizar">
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>

        {loading ? (
          <div className="currency-loading">
            <div className="currency-spinner" />
            <span>Carregando cotações...</span>
          </div>
        ) : (
          <div className="market-grid">
            {quotes.map((quote, i) => (
              <QuoteCard
                key={`${quote.code}-${i}`}
                quote={quote}
                isBest={quote.code === bestQuote?.code}
                isWorst={quote.code === worstQuote?.code}
                isVolatile={quote.code === mostVolatileQuote?.code && quote.code !== bestQuote?.code && quote.code !== worstQuote?.code}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Conversor + Insights automáticos ── */}
      <section className="currency-grid">
        <div className="currency-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">Conversor</span>
              <h2>Converter moeda</h2>
            </div>
          </div>

          <div className="converter-form">
            <label>
              Valor
              <input
                type="number"
                value={amount}
                min="0"
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>

            <div className="converter-row">
              <label>
                De
                <select value={from} onChange={(e) => { setFrom(e.target.value); setResult(null); }}>
                  {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <button className="swap-button" type="button" onClick={swapCurrencies}>⇄</button>

              <label>
                Para
                <select value={to} onChange={(e) => { setTo(e.target.value); setResult(null); }}>
                  {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <button
              className="convert-button"
              type="button"
              onClick={handleConvert}
              disabled={converting}
            >
              {converting ? "Convertendo..." : "Converter"}
            </button>

            {result && (
              <div className="converter-result">
                <span>Resultado</span>
                <strong>{formatConverted(Number(result.result), result.to)}</strong>
                <small>
                  Taxa: {Number(result.rate || 0).toFixed(6)} &bull; {result.message}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Insights automáticos */}
        <div className="currency-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">Análise automática</span>
              <h2>Insights do mercado</h2>
            </div>
          </div>

          <div className="insights-list">
            {autoInsights.length > 0 ? (
              autoInsights.map((insight, i) => (
                <div className="insight-row" key={i}>
                  <div className="insight-icon">
                    <i className="bi bi-lightbulb-fill" />
                  </div>
                  <p>{insight}</p>
                </div>
              ))
            ) : (
              <div className="insight-row insight-row--empty">
                <p>Carregando insights do mercado...</p>
              </div>
            )}
          </div>

          {userInsights && userInsights.insights.length > 0 && (
            <>
              <div className="insights-divider">
                <span>Baseado no seu perfil</span>
              </div>
              <div className="insights-list">
                {userInsights.insights.map((insight, i) => (
                  <div className="insight-row insight-row--profile" key={i}>
                    <div className="insight-icon">
                      <i className="bi bi-person-fill" />
                    </div>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="currency-note">
            ⚠️ Estas informações são educativas e não constituem recomendação financeira.
          </p>
        </div>
      </section>

      {/* ── Gráficos ── */}
      <section className="currency-charts">
        {/* Histórico */}
        <div className="currency-card">
          <div className="card-header card-header--wrap">
            <div>
              <span className="card-kicker">Histórico</span>
              <h2>Evolução da cotação</h2>
            </div>
            <div className="chart-controls">
              <select
                className="chart-select"
                value={historySymbol}
                onChange={(e) => setHistorySymbol(e.target.value)}
              >
                {HISTORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <div className="days-toggle">
                {HISTORY_DAYS.map((d) => (
                  <button
                    key={d}
                    className={`days-btn ${historyDays === d ? "days-btn--active" : ""}`}
                    onClick={() => setHistoryDays(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {historyUnavailable ? (
            <div className="chart-unavailable">
              <i className="bi bi-bar-chart-line" />
              <p>Histórico indisponível no momento.</p>
              <small>As cotações atuais continuam funcionando normalmente.</small>
            </div>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} width={72} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [formatCurrencyValue(value), "Cotação"]}
                  />
                  <Line type="monotone" dataKey="bid" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Cotação" />
                  <Line type="monotone" dataKey="high" stroke="rgba(74,222,128,0.5)" strokeWidth={1} dot={false} strokeDasharray="4 3" name="Máxima" />
                  <Line type="monotone" dataKey="low" stroke="rgba(248,113,113,0.5)" strokeWidth={1} dot={false} strokeDasharray="4 3" name="Mínima" />
                  <Brush dataKey="date" height={22} stroke="rgba(148,163,184,0.2)" fill="rgba(15,23,42,0.8)" travellerWidth={6} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Comparação por variação % */}
        <div className="currency-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">Comparação</span>
              <h2>Variação % do dia</h2>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(3)}%`, "Variação"]}
                />
                <Bar
                  dataKey="variacao"
                  radius={[8, 8, 0, 0]}
                  fill="#38bdf8"
                  name="Variação %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Volatilidade */}
          <div className="card-header" style={{ marginTop: "1.5rem" }}>
            <div>
              <span className="card-kicker">Volatilidade</span>
              <h2>Oscilação máx–mín</h2>
            </div>
          </div>
          <div className="chart-box" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={comparisonData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(3)}%`, "Volatilidade"]}
                />
                <Bar dataKey="volatilidade" radius={[8, 8, 0, 0]} fill="#818cf8" name="Volatilidade %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Tabela de detalhes ── */}
      <section className="currency-bottom">
        <div className="currency-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">Resumo</span>
              <h2>Todos os pares</h2>
            </div>
          </div>

          <div className="quote-table">
            <div className="quote-table__header">
              <span>Par</span>
              <span>Compra</span>
              <span>Venda</span>
              <span>Var %</span>
              <span>Spread</span>
            </div>
            {quotes.map((q, i) => (
              <div className="quote-table__row" key={i}>
                <span className="quote-table__pair">
                  <strong>{q.code}</strong>
                  <small>{q.name}</small>
                </span>
                <span>{formatCurrencyValue(Number(q.bid), q.code)}</span>
                <span>{formatCurrencyValue(Number(q.ask), q.code)}</span>
                <span className={Number(q.pctChange) >= 0 ? "up" : "down"}>
                  {formatPct(Number(q.pctChange))}
                </span>
                <span className="quote-table__spread">{getSpread(q)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}