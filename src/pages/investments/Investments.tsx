import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import "./Investments.scss";
import TitleHeader from "../../components/generic_components/titleHeader";
import { INVESTMENTS_API_URL } from "../../config";

type TabType = "renda-fixa" | "fundos" | "acoes" | "crypto";
type SimulationProfile = "conservador" | "moderado" | "agressivo";
type GoalType = "reserva" | "crescimento" | "longo-prazo";

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

type ProjectionPoint = {
  month: number;
  invested: number;
  balance: number;
  profit: number;
};

type SimulationResponse = {
  initialValue: number;
  monthlyContribution: number;
  months: number;
  profile: string;
  annualRate: number;
  monthlyRate: number;
  totalInvested: number;
  finalAmount: number;
  estimatedProfit: number;
  projection: ProjectionPoint[];
  message: string;
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
    descricao: "Opção estável para reserva de emergência e objetivos de curto prazo."
  },
  {
    id: 2,
    nome: "CDB liquidez diária",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Alta",
    rentabilidade: "Percentual do CDI",
    perfil: "Conservador / Moderado",
    descricao: "Alternativa simples para manter o dinheiro rendendo com acesso rápido."
  },
  {
    id: 3,
    nome: "LCI / LCA",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Média",
    rentabilidade: "Prefixada ou % do CDI",
    perfil: "Conservador",
    descricao: "Produto com previsibilidade e foco em objetivos de médio prazo."
  }
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
    descricao: "Fundo com foco em ativos de baixo risco e gestão profissional."
  },
  {
    id: 5,
    nome: "Multimercado",
    tipo: "Fundos",
    risco: "Médio",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Moderado",
    descricao: "Combina diferentes classes de ativos para buscar retorno mais flexível."
  },
  {
    id: 6,
    nome: "Fundo de ações",
    tipo: "Fundos",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao: "Voltado para exposição à bolsa, aceitando maior oscilação."
  }
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
    descricao: "Empresas conhecidas por distribuir parte dos lucros aos acionistas."
  },
  {
    id: 8,
    nome: "Blue chips",
    tipo: "Ações",
    risco: "Médio",
    liquidez: "Alta",
    rentabilidade: "Variável",
    perfil: "Moderado / Agressivo",
    descricao: "Empresas maiores e mais consolidadas dentro da bolsa."
  },
  {
    id: 9,
    nome: "Small caps",
    tipo: "Ações",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao: "Ações com maior potencial de crescimento e maior risco."
  }
];

const cryptoData: CryptoItem[] = [
  {
    id: 1,
    sigla: "BTC",
    nome: "Bitcoin",
    preco: 352000,
    variacao: 2.4,
    descricao: "Cripto mais conhecida do mercado, com alta volatilidade."
  },
  {
    id: 2,
    sigla: "ETH",
    nome: "Ethereum",
    preco: 17800,
    variacao: -1.2,
    descricao: "Ativo associado a aplicações descentralizadas e contratos inteligentes."
  },
  {
    id: 3,
    sigla: "SOL",
    nome: "Solana",
    preco: 690,
    variacao: 3.8,
    descricao: "Criptomoeda com alta oscilação e foco em velocidade."
  }
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: value > 9999 ? 0 : 2
  }).format(value || 0);

const riskClass = (risco: string) => {
  if (risco === "Baixo") return "low";
  if (risco === "Médio") return "medium";
  return "high";
};

const profileLabel = {
  conservador: "Conservador",
  moderado: "Moderado",
  agressivo: "Agressivo"
};

export default function Investments() {
  const [activeTab, setActiveTab] = useState<TabType>("renda-fixa");
  const [initialValue, setInitialValue] = useState<number>(1000);
  const [monthlyValue, setMonthlyValue] = useState<number>(200);
  const [months, setMonths] = useState<number>(24);
  const [selectedSimulation, setSelectedSimulation] =
    useState<SimulationProfile>("moderado");
  const [goal, setGoal] = useState<GoalType>("crescimento");

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [scenarioComparison, setScenarioComparison] = useState<any[]>([]);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  const userProfile = useMemo(() => {
    const storedUser = localStorage.getItem("loggedUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const balance = Number(user?.saldo_final || 0);
    const income = Number(user?.receita || 0);

    if (balance < 700 || income < 1800) return "conservador";
    if (balance >= 3000 && income >= 3500) return "agressivo";
    return "moderado";
  }, []);

  const recommendation = useMemo(() => {
    if (goal === "reserva") {
      return {
        title: "Reserva de emergência",
        profile: "conservador",
        text: "Para reserva, o ideal é priorizar liquidez e baixo risco antes de buscar maior retorno."
      };
    }

    if (goal === "longo-prazo") {
      return {
        title: "Longo prazo",
        profile: userProfile === "conservador" ? "moderado" : userProfile,
        text: "Para longo prazo, pode fazer sentido aceitar um pouco mais de oscilação de forma gradual."
      };
    }

    return {
      title: "Crescimento gradual",
      profile: userProfile,
      text: "Seu perfil sugere equilíbrio entre segurança, crescimento e previsibilidade."
    };
  }, [goal, userProfile]);

  async function simulateProfile(profile: SimulationProfile) {
    const response = await fetch(`${INVESTMENTS_API_URL}/investments/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        initialValue: Number(initialValue || 0),
        monthlyContribution: Number(monthlyValue || 0),
        months: Number(months || 1),
        profile
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new Error(raw || "Não foi possível simular agora.");
    }

    return JSON.parse(raw) as SimulationResponse;
  }

  async function handleSimulation() {
    try {
      setLoadingSimulation(true);
      setSimulationError("");

      const mainSimulation = await simulateProfile(selectedSimulation);

      const profiles: SimulationProfile[] = ["conservador", "moderado", "agressivo"];
      const comparisons = await Promise.all(
        profiles.map(async (profile) => {
          const result = await simulateProfile(profile);

          return {
            profile: profileLabel[profile],
            finalAmount: result.finalAmount,
            profit: result.estimatedProfit,
            annualRate: result.annualRate
          };
        })
      );

      setSimulation(mainSimulation);
      setScenarioComparison(comparisons);
    } catch {
      setSimulationError("Não foi possível carregar a simulação agora.");
    } finally {
      setLoadingSimulation(false);
    }
  }

  const renderContent = () => {
    const data =
      activeTab === "renda-fixa"
        ? rendaFixaData
        : activeTab === "fundos"
          ? fundosData
          : activeTab === "acoes"
            ? acoesData
            : [];

    if (activeTab !== "crypto") {
      return data.map((item) => (
        <div className="investment-item-card" key={item.id}>
          <div className="investment-item-top">
            <div>
              <span className="investment-item-type">{item.tipo}</span>
              <h3>{item.nome}</h3>
            </div>

            <span className={`risk-badge ${riskClass(item.risco)}`}>
              {item.risco}
            </span>
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
        <TitleHeader title="Investimentos" />

        <div className="investments-hero">
          <span className="investments-badge">Investimentos</span>
          <h1>Consulta, comparação e simulação</h1>
          <p>
            Explore opções por perfil, compare cenários e visualize a evolução
            do seu dinheiro ao longo do tempo.
          </p>
        </div>
      </motion.div>

      <section className="investments-summary">
        <div className="summary-card">
          <span>Perfil detectado</span>
          <strong>{profileLabel[userProfile as SimulationProfile]}</strong>
        </div>

        <div className="summary-card">
          <span>Objetivo</span>
          <strong>{recommendation.title}</strong>
        </div>

        <div className="summary-card">
          <span>Perfil recomendado</span>
          <strong>{profileLabel[recommendation.profile as SimulationProfile]}</strong>
        </div>
      </section>

      <section className="personalized-box">
        <div>
          <span className="investments-badge secondary">Recomendado para você</span>
          <h2>{recommendation.title}</h2>
          <p>{recommendation.text}</p>
        </div>

        <label>
          Objetivo
          <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
            <option value="reserva">Reserva</option>
            <option value="crescimento">Crescimento</option>
            <option value="longo-prazo">Longo prazo</option>
          </select>
        </label>
      </section>

      <section className="investments-tabs">
        <button className={activeTab === "renda-fixa" ? "active" : ""} onClick={() => setActiveTab("renda-fixa")}>
          Renda fixa
        </button>

        <button className={activeTab === "fundos" ? "active" : ""} onClick={() => setActiveTab("fundos")}>
          Fundos
        </button>

        <button className={activeTab === "acoes" ? "active" : ""} onClick={() => setActiveTab("acoes")}>
          Ações
        </button>

        <button className={activeTab === "crypto" ? "active" : ""} onClick={() => setActiveTab("crypto")}>
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

            <button
              type="button"
              className="simulator-action"
              onClick={handleSimulation}
              disabled={loadingSimulation}
            >
              {loadingSimulation ? "Calculando..." : "Simular"}
            </button>
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
                onChange={(e) => setSelectedSimulation(e.target.value as SimulationProfile)}
              >
                <option value="conservador">Conservador</option>
                <option value="moderado">Moderado</option>
                <option value="agressivo">Agressivo</option>
              </select>
            </label>
          </div>

          {simulationError && (
            <div className="simulator-error">
              {simulationError}
            </div>
          )}

          {simulation && (
            <>
              <div className="simulator-result">
                <div>
                  <span>Total investido</span>
                  <strong>{formatMoney(simulation.totalInvested)}</strong>
                </div>

                <div>
                  <span>Valor estimado</span>
                  <strong>{formatMoney(simulation.finalAmount)}</strong>
                </div>

                <div>
                  <span>Rendimento</span>
                  <strong className={simulation.estimatedProfit >= 0 ? "profit" : "loss"}>
                    {formatMoney(simulation.estimatedProfit)}
                  </strong>
                </div>
              </div>

              <section className="investment-charts">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Evolução do patrimônio</h3>
                    <span>{simulation.months} meses</span>
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={simulation.projection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value: any) => formatMoney(Number(value))}
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "12px",
                          color: "#fff"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#38bdf8"
                        fill="rgba(56, 189, 248, 0.18)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        stroke="#22c55e"
                        fill="rgba(34, 197, 94, 0.08)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Comparação de cenários</h3>
                    <span>Valor final</span>
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={scenarioComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="profile" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value: any) => formatMoney(Number(value))}
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "12px",
                          color: "#fff"
                        }}
                      />
                      <Bar dataKey="finalAmount" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <div className="projection-box">
                <div className="projection-header">
                  <h3>Resumo inteligente</h3>
                  <span>{simulation.profile}</span>
                </div>

                <p className="projection-text">
                  {simulation.message}
                </p>

                <div className="projection-list">
                  {simulation.projection.slice(-4).map((item) => (
                    <div className="projection-row" key={item.month}>
                      <span>Mês {item.month}</span>
                      <strong>{formatMoney(item.balance)}</strong>
                      <small>{formatMoney(item.profit)} de rendimento</small>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <p className="simulator-note">
            Esta simulação possui caráter informativo e educacional, sem representar
            recomendação financeira direta.
          </p>
        </motion.section>
      )}
    </div>
  );
}