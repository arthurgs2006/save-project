import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./currency.scss";

type FiatSymbol = "BRL" | "USD" | "EUR" | "GBP" | "JPY";
type CryptoSymbol = "BTC" | "ETH" | "SOL";

type SupportedSymbol = FiatSymbol | CryptoSymbol;

type FiatRateMap = Record<Exclude<FiatSymbol, "BRL">, number>;
type TrendMap = Record<Exclude<FiatSymbol, "BRL">, number[]>;
type CryptoRateMap = Record<CryptoSymbol, number>;
type CryptoChangeMap = Record<CryptoSymbol, number>;

type FrankfurterLatestResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

type FrankfurterSeriesResponse = {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
};

type CoinCapAsset = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
};

type CoinCapResponse = {
  data: CoinCapAsset[];
  timestamp: number;
};

const fiatTargets: Exclude<FiatSymbol, "BRL">[] = ["USD", "EUR", "GBP", "JPY"];
const cryptoTargets: CryptoSymbol[] = ["BTC", "ETH", "SOL"];

const cryptoIdMap: Record<CryptoSymbol, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

const formatCurrency = (value: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: value > 9999 ? 0 : 2,
  }).format(value);

const formatPercent = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const buildSparklinePoints = (values: number[]) => {
  if (!values.length) return "";
  const width = 120;
  const height = 44;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 0.0001);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

export default function Currency() {
  const [fiatRatesBRL, setFiatRatesBRL] = useState<FiatRateMap>({
    USD: 0,
    EUR: 0,
    GBP: 0,
    JPY: 0,
  });

  const [fiatVariation, setFiatVariation] = useState<Record<Exclude<FiatSymbol, "BRL">, number>>({
    USD: 0,
    EUR: 0,
    GBP: 0,
    JPY: 0,
  });

  const [fiatTrend, setFiatTrend] = useState<TrendMap>({
    USD: [],
    EUR: [],
    GBP: [],
    JPY: [],
  });

  const [cryptoRatesBRL, setCryptoRatesBRL] = useState<CryptoRateMap>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
  });

  const [cryptoVariation, setCryptoVariation] = useState<CryptoChangeMap>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
  });

  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<SupportedSymbol>("BRL");
  const [toCurrency, setToCurrency] = useState<SupportedSymbol>("USD");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string>("");

  const allPricesInBRL = useMemo<Record<SupportedSymbol, number>>(
    () => ({
      BRL: 1,
      USD: fiatRatesBRL.USD || 0,
      EUR: fiatRatesBRL.EUR || 0,
      GBP: fiatRatesBRL.GBP || 0,
      JPY: fiatRatesBRL.JPY || 0,
      BTC: cryptoRatesBRL.BTC || 0,
      ETH: cryptoRatesBRL.ETH || 0,
      SOL: cryptoRatesBRL.SOL || 0,
    }),
    [fiatRatesBRL, cryptoRatesBRL]
  );

  const convertedValue = useMemo(() => {
    const fromPrice = allPricesInBRL[fromCurrency];
    const toPrice = allPricesInBRL[toCurrency];

    if (!fromPrice || !toPrice || !amount) return 0;
    return (amount * fromPrice) / toPrice;
  }, [amount, fromCurrency, toCurrency, allPricesInBRL]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 10);
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, "0");
        const dd = String(startDate.getDate()).padStart(2, "0");
        const from = `${yyyy}-${mm}-${dd}`;

        const latestFxUrl =
          `https://api.frankfurter.dev/v1/latest?base=BRL&symbols=${fiatTargets.join(",")}`;
        const seriesFxUrl =
          `https://api.frankfurter.dev/v1/${from}..?base=BRL&symbols=${fiatTargets.join(",")}`;
        const cryptoUrl =
          "https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,solana";

        const [latestFxRes, seriesFxRes, cryptoRes] = await Promise.all([
          fetch(latestFxUrl),
          fetch(seriesFxUrl),
          fetch(cryptoUrl),
        ]);

        if (!latestFxRes.ok || !seriesFxRes.ok || !cryptoRes.ok) {
          throw new Error("Não foi possível carregar as cotações.");
        }

        const latestFx: FrankfurterLatestResponse = await latestFxRes.json();
        const seriesFx: FrankfurterSeriesResponse = await seriesFxRes.json();
        const cryptoData: CoinCapResponse = await cryptoRes.json();

        const nextFiatRates = { ...fiatRatesBRL };
        fiatTargets.forEach((symbol) => {
          const rateFromBRL = latestFx.rates[symbol];
          nextFiatRates[symbol] = rateFromBRL ? 1 / rateFromBRL : 0;
        });
        setFiatRatesBRL(nextFiatRates);

        const orderedDates = Object.keys(seriesFx.rates).sort();
        const prevDate = orderedDates.length >= 2 ? orderedDates[orderedDates.length - 2] : "";
        const latestDate = orderedDates.length ? orderedDates[orderedDates.length - 1] : "";

        const nextVariation = { ...fiatVariation };
        const nextTrend = { ...fiatTrend };

        fiatTargets.forEach((symbol) => {
          const historicValues = orderedDates
            .map((date) => {
              const rateFromBRL = seriesFx.rates[date]?.[symbol];
              return rateFromBRL ? 1 / rateFromBRL : 0;
            })
            .filter(Boolean);

          nextTrend[symbol] = historicValues;

          const prevValue = prevDate ? seriesFx.rates[prevDate]?.[symbol] : 0;
          const latestValue = latestDate ? seriesFx.rates[latestDate]?.[symbol] : 0;

          if (prevValue && latestValue) {
            const prevInBRL = 1 / prevValue;
            const latestInBRL = 1 / latestValue;
            nextVariation[symbol] = ((latestInBRL - prevInBRL) / prevInBRL) * 100;
          } else {
            nextVariation[symbol] = 0;
          }
        });

        setFiatVariation(nextVariation);
        setFiatTrend(nextTrend);

        const usdToBRL = nextFiatRates.USD || 0;
        const nextCryptoRates = { ...cryptoRatesBRL };
        const nextCryptoVariation = { ...cryptoVariation };

        cryptoData.data.forEach((asset) => {
          const matchedEntry = (Object.entries(cryptoIdMap) as [CryptoSymbol, string][])
            .find(([, id]) => id === asset.id);

          if (!matchedEntry) return;

          const [symbol] = matchedEntry;
          const priceUsd = Number(asset.priceUsd);
          const change24h = Number(asset.changePercent24Hr);

          nextCryptoRates[symbol] = priceUsd * usdToBRL;
          nextCryptoVariation[symbol] = change24h;
        });

        setCryptoRatesBRL(nextCryptoRates);
        setCryptoVariation(nextCryptoVariation);
        setLastUpdated(new Date().toLocaleString("pt-BR"));
      } catch (err) {
  console.log("Erro ao carregar API, usando fallback");

  // 💱 moedas
  setFiatRatesBRL({
    USD: 5.10,
    EUR: 5.50,
    GBP: 6.40,
    JPY: 0.034,
  });

  setFiatVariation({
    USD: 0.5,
    EUR: -0.2,
    GBP: 0.3,
    JPY: 0.1,
  });

  // 🪙 crypto
  setCryptoRatesBRL({
    BTC: 350000,
    ETH: 18000,
    SOL: 700,
  });

  setCryptoVariation({
    BTC: 2.1,
    ETH: -1.2,
    SOL: 3.5,
  });

  // ⚠️ IMPORTANTE
  setError(""); // limpa o erro
  setLastUpdated("modo demonstração");
}
 finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const marketCards = [
    {
      symbol: "USD" as const,
      name: "Dólar",
      value: fiatRatesBRL.USD,
      change: fiatVariation.USD,
      trend: fiatTrend.USD,
    },
    {
      symbol: "EUR" as const,
      name: "Euro",
      value: fiatRatesBRL.EUR,
      change: fiatVariation.EUR,
      trend: fiatTrend.EUR,
    },
    {
      symbol: "GBP" as const,
      name: "Libra",
      value: fiatRatesBRL.GBP,
      change: fiatVariation.GBP,
      trend: fiatTrend.GBP,
    },
    {
      symbol: "BTC" as const,
      name: "Bitcoin",
      value: cryptoRatesBRL.BTC,
      change: cryptoVariation.BTC,
      trend: [],
    },
  ];

  return (
    <div className="currency-page">
      <motion.section
        className="currency-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="currency-hero__text">
          <span className="currency-badge">Currency</span>
          <h1>Conversão e acompanhamento de moedas</h1>
          <p>
            Consulte cotações, acompanhe variações e simule conversões em tempo real
            em uma tela só.
          </p>
        </div>

        <div className="currency-hero__stats">
          <div className="hero-stat">
            <strong>{loading ? "--" : marketCards.length}</strong>
            <span>ativos em destaque</span>
          </div>

          <div className="hero-stat">
            <strong>{loading ? "--" : "24h"}</strong>
            <span>variação monitorada</span>
          </div>

          <div className="hero-stat">
            <strong>{loading ? "--" : lastUpdated || "--"}</strong>
            <span>última atualização</span>
          </div>
        </div>
      </motion.section>

      {error && <div className="currency-error">{error}</div>}

      <section className="currency-grid">
        <motion.div
          className="currency-card currency-card--converter"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <div className="card-header">
            <div>
              <span className="card-kicker">Conversor</span>
              <h2>Simule o valor em outra moeda</h2>
            </div>
          </div>

          <div className="converter-form">
            <label>
              Valor
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number.isNaN(amount) ? "" : amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>

            <div className="converter-row">
              <label>
                De
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as SupportedSymbol)}
                >
                  {Object.keys(allPricesInBRL).map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="swap-button"
                onClick={() => {
                  const currentFrom = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(currentFrom);
                }}
              >
                ⇄
              </button>

              <label>
                Para
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as SupportedSymbol)}
                >
                  {Object.keys(allPricesInBRL).map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="converter-result">
              <span>Resultado</span>
              <strong>
                {loading
                  ? "Carregando..."
                  : toCurrency === "BTC" || toCurrency === "ETH" || toCurrency === "SOL"
                  ? `${convertedValue.toFixed(6)} ${toCurrency}`
                  : `${convertedValue.toFixed(2)} ${toCurrency}`}
              </strong>
              <small>
                {amount} {fromCurrency} equivale a{" "}
                {toCurrency === "BTC" || toCurrency === "ETH" || toCurrency === "SOL"
                  ? convertedValue.toFixed(6)
                  : convertedValue.toFixed(2)}{" "}
                {toCurrency}
              </small>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="currency-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="card-header">
            <div>
              <span className="card-kicker">Mercado</span>
              <h2>Destaques do dia</h2>
            </div>
          </div>

          <div className="market-grid">
            {marketCards.map((item) => {
              const positive = item.change >= 0;
              const sparkline = buildSparklinePoints(item.trend);

              return (
                <div className="market-item" key={item.symbol}>
                  <div className="market-item__top">
                    <div>
                      <span className="market-symbol">{item.symbol}</span>
                      <h3>{item.name}</h3>
                    </div>

                    <span className={`market-change ${positive ? "up" : "down"}`}>
                      {loading ? "--" : formatPercent(item.change)}
                    </span>
                  </div>

                  <strong className="market-price">
                    {loading ? "--" : formatCurrency(item.value)}
                  </strong>

                  {item.trend.length > 1 ? (
                    <svg className="sparkline" viewBox="0 0 120 44" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        points={sparkline}
                      />
                    </svg>
                  ) : (
                    <div className="market-hint">
                      Variação de 24h
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="currency-bottom">
        <motion.div
          className="currency-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className="card-header">
            <div>
              <span className="card-kicker">Fiat</span>
              <h2>Cotações principais</h2>
            </div>
          </div>

          <div className="list-table">
            {fiatTargets.map((symbol) => (
              <div className="list-row" key={symbol}>
                <div className="list-row__label">
                  <strong>{symbol}</strong>
                  <span>1 {symbol} em BRL</span>
                </div>

                <div className="list-row__value">
                  <strong>{loading ? "--" : formatCurrency(fiatRatesBRL[symbol])}</strong>
                  <span className={fiatVariation[symbol] >= 0 ? "up" : "down"}>
                    {loading ? "--" : formatPercent(fiatVariation[symbol])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="currency-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <div className="card-header">
            <div>
              <span className="card-kicker">Crypto</span>
              <h2>Criptos monitoradas</h2>
            </div>
          </div>

          <div className="list-table">
            {cryptoTargets.map((symbol) => (
              <div className="list-row" key={symbol}>
                <div className="list-row__label">
                  <strong>{symbol}</strong>
                  <span>{cryptoIdMap[symbol]}</span>
                </div>

                <div className="list-row__value">
                  <strong>{loading ? "--" : formatCurrency(cryptoRatesBRL[symbol])}</strong>
                  <span className={cryptoVariation[symbol] >= 0 ? "up" : "down"}>
                    {loading ? "--" : formatPercent(cryptoVariation[symbol])}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="currency-note">
            Essa tela usa fontes públicas para protótipo e já fica pronta para você
            trocar depois por uma API do seu backend, se quiser.
          </p>
        </motion.div>
      </section>
    </div>
  );
}