import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./investments.scss";

type TabType = "renda-fixa" | "fundos" | "acoes" | "crypto";

type InvestmentItem = {
  id: number;
  nome: string;
  tipo: string;
  risco: "Baixo" | "Médio" | "Alto";
  liquidez: string;
  rentabilidade: string;
  perfil: string;
  descricao: string;
};

type CryptoItem = {
  id: number;
  sigla: string;
  nome: string;
  preco: number;
  variacao: number;
  descricao: string;
};

const rendaFixaData: InvestmentItem[] = [
  {
    id: 1,
    nome: "Tesouro Selic",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Alta",
    rentabilidade: "Próxima da Selic",
    perfil: "Conservador",
    descricao: "Opção estável e bastante usada para reserva e objetivos de curto prazo.",
  },
  {
    id: 2,
    nome: "CDB 110% CDI",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Média",
    rentabilidade: "110% do CDI",
    perfil: "Conservador / Moderado",
    descricao: "Alternativa para quem busca previsibilidade com potencial acima do CDI.",
  },
  {
    id: 3,
    nome: "LCI / LCA",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Baixa a média",
    rentabilidade: "Prefixada ou % do CDI",
    perfil: "Conservador",
    descricao: "Produto de renda fixa com foco em previsibilidade e benefício tributário.",
  },
];

const fundosData: InvestmentItem[] = [
  {
    id: 4,
    nome: "Fundo DI",
    tipo: "Fundos",
    risco: "Baixo",
    liquidez: "Alta",
    rentabilidade: "Próxima ao CDI",
    perfil: "Conservador",
    descricao: "Fundo com foco em ativos de baixo risco e alta previsibilidade.",
  },
  {
    id: 5,
    nome: "Multimercado",
    tipo: "Fundos",
    risco: "Médio",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Moderado",
    descricao: "Combina diferentes classes de ativos em busca de retorno mais flexível.",
  },
  {
    id: 6,
    nome: "Fundo de ações",
    tipo: "Fundos",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao: "Voltado para maior exposição à bolsa, com oscilações mais intensas.",
  },
];

const acoesData: InvestmentItem[] = [
  {
    id: 7,
    nome: "Ações de dividendos",
    tipo: "Ações",
    risco: "Médio",
    liquidez: "Alta",
    rentabilidade: "Variável",
    perfil: "Moderado",
    descricao: "Empresas conhecidas por distribuir parte do lucro aos acionistas.",
  },
  {
    id: 8,
    nome: "Blue chips",
    tipo: "Ações",
    risco: "Médio",
    liquidez: "Alta",
    rentabilidade: "Variável",
    perfil: "Moderado / Agressivo",
    descricao: "Empresas maiores e mais consolidadas dentro da bolsa.",
  },
  {
    id: 9,
    nome: "Small caps",
    tipo: "Ações",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao: "Papéis com maior potencial de oscilação e risco mais elevado.",
  },
];

const cryptoData: CryptoItem[] = [
  {
    id: 1,
    sigla: "BTC",
    nome: "Bitcoin",
    preco: 352000,
    variacao: 2.4,
    descricao: "Cripto mais conhecida do mercado, com alta volatilidade e forte exposição.",
  },
  {
    id: 2,
    sigla: "ETH",
    nome: "Ethereum",
    preco: 17800,
    variacao: -1.2,
    descricao: "Ativo bastante associado a aplicações descentralizadas e contratos inteligentes.",
  },
  {
    id: 3,
    sigla: "SOL",
    nome: "Solana",
    preco: 690,
    variacao: 3.8,
    descricao: "Criptomoeda com maior oscilação e foco em velocidade e escala.",
  },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: value > 9999 ? 0 : 2,
  }).format(value);

const riskClass = (risco: string) => {
  if (risco === "Baixo") return "low";
  if (risco === "Médio") return "medium";
  return "high";
};

export default function Investments() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("renda-fixa");
  const [initialValue, setInitialValue] = useState<number>(1000);
  const [monthlyValue, setMonthlyValue] = useState<number>(200);
  const [months, setMonths] = useState<number>(12);
  const [selectedSimulation, setSelectedSimulation] = useState<"conservador" | "moderado" | "agressivo">("conservador");

  const simulationRates = {
    conservador: 0.009,
    moderado: 0.013,
    agressivo: 0.017,
  };

  const simulationResult = useMemo(() => {
    const rate = simulationRates[selectedSimulation];
    let total = initialValue;

    for (let i = 0; i < months; i++) {
      total = total * (1 + rate) + monthlyValue;
    }

    return total;
  }, [initialValue, monthlyValue, months, selectedSimulation]);

  const totalInvested = initialValue + monthlyValue * months;
  const estimatedProfit = simulationResult - totalInvested;

  const renderContent = () => {
    if (activeTab === "renda-fixa") {
      return rendaFixaData.map((item) => (
        <div className="investment-item-card" key={item.id}>
          <div className="investment-item-top">
            <div>
              <span className="investment-item-type">{item.tipo}</span>
              <h3>{item.nome}</h3>
            </div>
            <span className={`risk-badge ${riskClass(item.risco)}`}>{item.risco}</span>
          </div>

          <p className="investment-item-description">{item.descricao}</p>

          <div className="investment-item-info">
            <div>
              <span>Liquidez</span>
              <strong>{item.liquidez}</strong>
            </div>
            <div>
              <span>Rentabilidade</span>
              <strong>{item.rentabilidade}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{item.perfil}</strong>
            </div>
          </div>
        </div>
      ));
    }

    if (activeTab === "fundos") {
      return fundosData.map((item) => (
        <div className="investment-item-card" key={item.id}>
          <div className="investment-item-top">
            <div>
              <span className="investment-item-type">{item.tipo}</span>
              <h3>{item.nome}</h3>
            </div>
            <span className={`risk-badge ${riskClass(item.risco)}`}>{item.risco}</span>
          </div>

          <p className="investment-item-description">{item.descricao}</p>

          <div className="investment-item-info">
            <div>
              <span>Liquidez</span>
              <strong>{item.liquidez}</strong>
            </div>
            <div>
              <span>Rentabilidade</span>
              <strong>{item.rentabilidade}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{item.perfil}</strong>
            </div>
          </div>
        </div>
      ));
    }

    if (activeTab === "acoes") {
      return acoesData.map((item) => (
        <div className="investment-item-card" key={item.id}>
          <div className="investment-item-top">
            <div>
              <span className="investment-item-type">{item.tipo}</span>
              <h3>{item.nome}</h3>
            </div>
            <span className={`risk-badge ${riskClass(item.risco)}`}>{item.risco}</span>
          </div>

          <p className="investment-item-description">{item.descricao}</p>

          <div className="investment-item-info">
            <div>
              <span>Liquidez</span>
              <strong>{item.liquidez}</strong>
            </div>
            <div>
              <span>Rentabilidade</span>
              <strong>{item.rentabilidade}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{item.perfil}</strong>
            </div>
          </div>
        </div>
      ));
    }

    return cryptoData.map((item) => (
      <div className="investment-item-card crypto-card" key={item.id}>
        <div className="investment-item-top">
          <div>
            <span className="investment-item-type">Crypto</span>
            <h3>
              {item.nome} <small>{item.sigla}</small>
            </h3>
          </div>

          <span className={`variation-badge ${item.variacao >= 0 ? "positive" : "negative"}`}>
            {item.variacao >= 0 ? "+" : ""}
            {item.variacao.toFixed(2)}%
          </span>
        </div>

        <p className="investment-item-description">{item.descricao}</p>

        <div className="investment-item-info">
          <div>
            <span>Preço</span>
            <strong>{formatMoney(item.preco)}</strong>
          </div>
          <div>
            <span>Volatilidade</span>
            <strong>Alta</strong>
          </div>
          <div>
            <span>Perfil</span>
            <strong>Agressivo</strong>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="investments-page">
      <motion.div
        className="investments-header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <button className="investments-back-btn" onClick={() => navigate("/homescreen")}>
          ← Voltar
        </button>

        <div className="investments-hero">
          <span className="investments-badge">Investimentos</span>
          <h1>Consulta, comparação e simulação</h1>
          <p>
            Explore opções de investimento por perfil, compare características e
            simule cenários sem realizar aplicações.
          </p>
        </div>
      </motion.div>

      <section className="investments-summary">
        <div className="summary-card">
          <span>Foco da tela</span>
          <strong>Consulta e educação</strong>
        </div>

        <div className="summary-card">
          <span>Perfis</span>
          <strong>Conservador ao agressivo</strong>
        </div>

        <div className="summary-card">
          <span>Crypto</span>
          <strong>Somente consulta</strong>
        </div>
      </section>

      <section className="investments-tabs">
        <button
          className={activeTab === "renda-fixa" ? "active" : ""}
          onClick={() => setActiveTab("renda-fixa")}
        >
          Renda fixa
        </button>

        <button
          className={activeTab === "fundos" ? "active" : ""}
          onClick={() => setActiveTab("fundos")}
        >
          Fundos
        </button>

        <button
          className={activeTab === "acoes" ? "active" : ""}
          onClick={() => setActiveTab("acoes")}
        >
          Ações
        </button>

        <button
          className={activeTab === "crypto" ? "active" : ""}
          onClick={() => setActiveTab("crypto")}
        >
          Crypto
        </button>
      </section>

      <motion.section
        className="investments-content"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
      >
        {renderContent()}
      </motion.section>

      {activeTab !== "crypto" && (
        <motion.section
          className="investments-simulator"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <div className="simulator-header">
            <div>
              <span className="investments-badge secondary">Simulador</span>
              <h2>Projete um cenário</h2>
            </div>
          </div>

          <div className="simulator-grid">
            <label>
              Valor inicial
              <input
                type="number"
                min="0"
                value={Number.isNaN(initialValue) ? "" : initialValue}
                onChange={(e) => setInitialValue(Number(e.target.value))}
              />
            </label>

            <label>
              Aporte mensal
              <input
                type="number"
                min="0"
                value={Number.isNaN(monthlyValue) ? "" : monthlyValue}
                onChange={(e) => setMonthlyValue(Number(e.target.value))}
              />
            </label>

            <label>
              Tempo (meses)
              <input
                type="number"
                min="1"
                value={Number.isNaN(months) ? "" : months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
            </label>

            <label>
              Perfil estimado
              <select
                value={selectedSimulation}
                onChange={(e) =>
                  setSelectedSimulation(
                    e.target.value as "conservador" | "moderado" | "agressivo"
                  )
                }
              >
                <option value="conservador">Conservador</option>
                <option value="moderado">Moderado</option>
                <option value="agressivo">Agressivo</option>
              </select>
            </label>
          </div>

          <div className="simulator-result">
            <div>
              <span>Total investido</span>
              <strong>{formatMoney(totalInvested)}</strong>
            </div>

            <div>
              <span>Valor estimado</span>
              <strong>{formatMoney(simulationResult)}</strong>
            </div>

            <div>
              <span>Rendimento estimado</span>
              <strong className={estimatedProfit >= 0 ? "profit" : "loss"}>
                {formatMoney(estimatedProfit)}
              </strong>
            </div>
          </div>

          <p className="simulator-note">
            Esta simulação possui caráter informativo e educacional, sem representar
            recomendação financeira direta.
          </p>
        </motion.section>
      )}
    </div>
  );
}