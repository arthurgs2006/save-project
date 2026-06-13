import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
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
type GoalType = "reserva" | "viagem" | "compra" | "aposentadoria" | "crescimento";

type InvestmentItem = {
  id: number;
  nome: string;
  tipo: string;
  risco: "Baixo" | "Médio" | "Alto";
  liquidez: string;
  rentabilidade: string;
  perfil: string;
  descricao: string;
  idealPara: string;
};

type ProjectionPoint = {
  month: number;
  invested: number;
  balance: number;
  profit: number;
};

type ScenarioComparison = {
  profile: string;
  annualRate: number;
  finalAmount: number;
  estimatedProfit: number;
};

type SimulationResponse = {
  initialValue: number;
  monthlyContribution: number;
  months: number;

  profile: string;
  goalType: string;

  annualRate: number;
  monthlyRate: number;

  totalInvested: number;
  finalAmount: number;
  estimatedProfit: number;

  targetAmount?: number | null;
  goalReached?: boolean | null;
  missingAmount?: number | null;
  goalProgressPercentage?: number | null;

  recommendationTitle?: string;
  recommendationMessage?: string;
  riskMessage?: string;

  projection: ProjectionPoint[];
  scenarios?: ScenarioComparison[];

  message: string;
};

type UserFinancialProfile = {
  balance: number;
  income: number;
  suggestedProfile: SimulationProfile;
  healthText: string;
};

const profileLabel: Record<SimulationProfile, string> = {
  conservador: "Conservador",
  moderado: "Moderado",
  agressivo: "Agressivo"
};

const goalLabel: Record<GoalType, string> = {
  reserva: "Reserva de emergência",
  viagem: "Viagem",
  compra: "Compra planejada",
  aposentadoria: "Aposentadoria",
  crescimento: "Crescimento patrimonial"
};

const goalDescriptions: Record<GoalType, string> = {
  reserva: "Foco em segurança, liquidez e estabilidade para imprevistos.",
  viagem: "Planejamento com prazo definido e baixa exposição a oscilações.",
  compra: "Organização para alcançar um bem específico com previsibilidade.",
  aposentadoria: "Estratégia de longo prazo usando o tempo a favor dos juros compostos.",
  crescimento: "Busca por evolução patrimonial equilibrando retorno e risco."
};

const guideText: Record<TabType, { title: string; description: string }> = {
  "renda-fixa": {
    title: "Renda fixa",
    description:
      "Indicada para quem busca mais previsibilidade. É muito usada para reserva, metas de curto prazo e organização financeira."
  },
  fundos: {
    title: "Fundos de investimento",
    description:
      "Reúnem recursos de vários investidores e contam com gestão profissional. Podem variar bastante conforme a estratégia."
  },
  acoes: {
    title: "Ações",
    description:
      "Representam participação em empresas. Podem ter maior potencial de retorno, mas também maior oscilação."
  },
  crypto: {
    title: "Criptoativos",
    description:
      "São ativos digitais de alta volatilidade. Devem ser tratados com cautela e foco educativo dentro do app."
  }
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
    descricao:
      "Título público com baixa oscilação, muito usado para reserva de emergência e dinheiro que precisa ficar acessível.",
    idealPara: "Reserva, curto prazo e segurança"
  },
  {
    id: 2,
    nome: "CDB com liquidez diária",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Alta",
    rentabilidade: "Percentual do CDI",
    perfil: "Conservador / Moderado",
    descricao:
      "Produto emitido por bancos. Pode ser uma alternativa simples para manter o dinheiro rendendo com possibilidade de resgate.",
    idealPara: "Reserva e objetivos próximos"
  },
  {
    id: 3,
    nome: "LCI / LCA",
    tipo: "Renda fixa",
    risco: "Baixo",
    liquidez: "Média",
    rentabilidade: "Prefixada ou % do CDI",
    perfil: "Conservador",
    descricao:
      "Investimentos de renda fixa ligados aos setores imobiliário e do agronegócio, geralmente usados em objetivos de médio prazo.",
    idealPara: "Metas planejadas"
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
    descricao:
      "Fundo que costuma investir em ativos mais conservadores. Pode ser usado como alternativa simples para quem quer praticidade.",
    idealPara: "Perfil iniciante e conservador"
  },
  {
    id: 5,
    nome: "Fundo multimercado",
    tipo: "Fundos",
    risco: "Médio",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Moderado",
    descricao:
      "Pode combinar renda fixa, moedas, ações e outros ativos. Busca retorno maior, aceitando mais variação.",
    idealPara: "Diversificação"
  },
  {
    id: 6,
    nome: "Fundo de ações",
    tipo: "Fundos",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao:
      "Fundo com foco em empresas listadas na bolsa. É mais indicado para objetivos de longo prazo.",
    idealPara: "Longo prazo"
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
    descricao:
      "Empresas que historicamente distribuem parte dos lucros. Podem ser usadas em estratégias de renda e longo prazo.",
    idealPara: "Construção de patrimônio"
  },
  {
    id: 8,
    nome: "Blue chips",
    tipo: "Ações",
    risco: "Médio",
    liquidez: "Alta",
    rentabilidade: "Variável",
    perfil: "Moderado / Agressivo",
    descricao:
      "Ações de empresas maiores e mais consolidadas. Ainda sofrem oscilação, mas costumam ter mais liquidez.",
    idealPara: "Exposição gradual à bolsa"
  },
  {
    id: 9,
    nome: "Small caps",
    tipo: "Ações",
    risco: "Alto",
    liquidez: "Média",
    rentabilidade: "Variável",
    perfil: "Agressivo",
    descricao:
      "Empresas menores, com maior potencial de crescimento e também maior risco de variação.",
    idealPara: "Perfil agressivo"
  }
];

const cryptoData: InvestmentItem[] = [
  {
    id: 10,
    nome: "Bitcoin",
    tipo: "Crypto",
    risco: "Alto",
    liquidez: "Alta",
    rentabilidade: "Muito variável",
    perfil: "Agressivo",
    descricao:
      "Criptoativo mais conhecido do mercado. Possui alta volatilidade e deve ser tratado com cautela.",
    idealPara: "Estudo e alta tolerância a risco"
  },
  {
    id: 11,
    nome: "Ethereum",
    tipo: "Crypto",
    risco: "Alto",
    liquidez: "Alta",
    rentabilidade: "Muito variável",
    perfil: "Agressivo",
    descricao:
      "Ativo digital ligado a contratos inteligentes e aplicações descentralizadas. Também possui forte oscilação.",
    idealPara: "Exposição tecnológica"
  },
  {
    id: 12,
    nome: "Stablecoins",
    tipo: "Crypto",
    risco: "Médio",
    liquidez: "Alta",
    rentabilidade: "Variável",
    perfil: "Moderado / Agressivo",
    descricao:
      "Criptoativos que tentam acompanhar moedas tradicionais. Ainda envolvem riscos de tecnologia, emissor e mercado.",
    idealPara: "Uso educativo e cauteloso"
  }
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: Math.abs(value || 0) > 9999 ? 0 : 2
  }).format(value || 0);

const formatPercent = (value: number) =>
  `${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;

const normalizeProfile = (profile: string): SimulationProfile => {
  const value = profile?.toLowerCase();

  if (value === "conservador" || value === "moderado" || value === "agressivo") {
    return value;
  }

  return "moderado";
};

const riskClass = (risk: string) => {
  if (risk === "Baixo") return "low";
  if (risk === "Médio") return "medium";
  return "high";
};

export default function Investments() {
  const [activeTab, setActiveTab] = useState<TabType>("renda-fixa");

  const [initialValue, setInitialValue] = useState<number>(1000);
  const [monthlyValue, setMonthlyValue] = useState<number>(250);
  const [months, setMonths] = useState<number>(24);
  const [targetAmount, setTargetAmount] = useState<number>(10000);

  const [selectedProfile, setSelectedProfile] =
    useState<SimulationProfile>("moderado");
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("crescimento");

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  const userFinancialProfile = useMemo<UserFinancialProfile>(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const balance = Number(user?.saldo_final || 0);
      const income = Number(user?.receita || 0);

      const reserveMonths = income > 0 ? balance / income : 0;

      if (balance <= 0 || income <= 0) {
        return {
          balance,
          income,
          suggestedProfile: "conservador",
          healthText:
            "Ainda não há saldo ou renda suficientes registrados. Comece com opções conservadoras e de fácil resgate enquanto organiza seu orçamento."
        };
      }

      if (balance < 700 || income < 1800) {
        return {
          balance,
          income,
          suggestedProfile: "conservador",
          healthText:
            "O cenário sugere priorizar reserva de emergência e opções de baixo risco antes de buscar maior retorno."
        };
      }

      if (reserveMonths < 1) {
        return {
          balance,
          income,
          suggestedProfile: "conservador",
          healthText:
            "Sua reserva atual ainda cobre menos de um mês de renda. Vale consolidá-la em opções seguras e líquidas antes de migrar para um perfil moderado."
        };
      }

      if (balance < 3000 || income < 3500 || reserveMonths < 3) {
        return {
          balance,
          income,
          suggestedProfile: "moderado",
          healthText:
            "O cenário indica equilíbrio entre segurança, crescimento e previsibilidade, mantendo parte do saldo como reserva."
        };
      }

      if (balance >= 8000 && income >= 6000 && reserveMonths >= 6) {
        return {
          balance,
          income,
          suggestedProfile: "agressivo",
          healthText:
            "Sua reserva está bem consolidada, então o cenário permite estudar opções com maior potencial de retorno, mantendo controle de risco."
        };
      }

      if (balance >= 3000 && income >= 3500 && reserveMonths >= 3) {
        return {
          balance,
          income,
          suggestedProfile: "agressivo",
          healthText:
            "O cenário permite estudar opções com maior potencial de retorno, desde que parte da reserva continue protegida em produtos de baixo risco."
        };
      }

      return {
        balance,
        income,
        suggestedProfile: "moderado",
        healthText:
          "O cenário indica equilíbrio entre segurança, crescimento e previsibilidade. Reforçar a reserva amplia a margem para um perfil mais arrojado."
      };
    } catch {
      return {
        balance: 0,
        income: 0,
        suggestedProfile: "moderado",
        healthText:
          "Com poucos dados do usuário, o perfil moderado é usado como ponto de partida."
      };
    }
  }, []);

  const guideItems = useMemo(() => {
    if (activeTab === "renda-fixa") return rendaFixaData;
    if (activeTab === "fundos") return fundosData;
    if (activeTab === "acoes") return acoesData;
    return cryptoData;
  }, [activeTab]);

  const scenarioChartData = useMemo(() => {
    if (!simulation?.scenarios?.length) return [];

    return simulation.scenarios.map((scenario) => ({
      profile: profileLabel[normalizeProfile(scenario.profile)],
      finalAmount: scenario.finalAmount,
      estimatedProfit: scenario.estimatedProfit,
      annualRate: scenario.annualRate
    }));
  }, [simulation]);

  const lastProjectionPoints = useMemo(() => {
    if (!simulation?.projection?.length) return [];

    return simulation.projection.slice(-4);
  }, [simulation]);

  const goalProgress = simulation?.goalProgressPercentage ?? 0;
  const safeGoalProgress = Math.min(goalProgress, 100);

  async function handleSimulation() {
    try {
      setLoadingSimulation(true);
      setSimulationError("");

      const response = await fetch(`${INVESTMENTS_API_URL}/investments/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initialValue: Number(initialValue || 0),
          monthlyContribution: Number(monthlyValue || 0),
          months: Number(months || 1),
          profile: selectedProfile,
          goalType: selectedGoal,
          targetAmount: Number(targetAmount || 0) > 0 ? Number(targetAmount) : null
        })
      });

      const raw = await response.text();

      if (!response.ok) {
        throw new Error(raw || "Não foi possível simular agora.");
      }

      const result = JSON.parse(raw) as SimulationResponse;
      setSimulation(result);
    } catch {
      setSimulationError(
        "Não foi possível carregar a simulação agora. Verifique os dados informados e tente novamente."
      );
    } finally {
      setLoadingSimulation(false);
    }
  }

  return (
    <div className="investments-page">
      <motion.section
        className="investments-hero-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <TitleHeader title="Investimentos" />

        <div className="investments-hero-grid">
          <div className="investments-hero-copy">
            <span className="investments-badge">Planejamento financeiro</span>
            <h1>Simule investimentos com base no seu objetivo</h1>
            <p>
              Escolha uma meta, informe seus valores e veja uma projeção com
              rendimento estimado, comparação de perfis e análise personalizada.
            </p>
          </div>

          <div className="investments-hero-panel">
            <span>Perfil sugerido</span>
            <strong>{profileLabel[userFinancialProfile.suggestedProfile]}</strong>
            <p>{userFinancialProfile.healthText}</p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="investments-simulator-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.35 }}
      >
        <div className="simulator-top">
          <div>
            <span className="investments-badge secondary">Simulador</span>
            <h2>Monte seu cenário</h2>
            <p>
              Os campos abaixo deixam a simulação mais personalizada para o seu
              momento financeiro e para o objetivo escolhido.
            </p>
          </div>

          <button
            type="button"
            className="simulator-action"
            onClick={handleSimulation}
            disabled={loadingSimulation}
          >
            {loadingSimulation ? "Calculando..." : "Simular investimento"}
          </button>
        </div>

        <div className="simulator-grid">
          <label>
            Objetivo
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value as GoalType)}
            >
              <option value="reserva">Reserva de emergência</option>
              <option value="viagem">Viagem</option>
              <option value="compra">Compra planejada</option>
              <option value="aposentadoria">Aposentadoria</option>
              <option value="crescimento">Crescimento patrimonial</option>
            </select>
          </label>

          <label>
            Perfil
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value as SimulationProfile)}
            >
              <option value="conservador">Conservador</option>
              <option value="moderado">Moderado</option>
              <option value="agressivo">Agressivo</option>
            </select>
          </label>

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
            Prazo em meses
            <input
              type="number"
              min="1"
              max="600"
              value={Number.isNaN(months) ? "" : months}
              onChange={(e) => setMonths(Number(e.target.value))}
            />
          </label>

          <label>
            Meta financeira
            <input
              type="number"
              min="0"
              value={Number.isNaN(targetAmount) ? "" : targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="goal-context-box">
          <div>
            <span>Objetivo selecionado</span>
            <strong>{goalLabel[selectedGoal]}</strong>
          </div>
          <p>{goalDescriptions[selectedGoal]}</p>
        </div>

        {simulationError && (
          <div className="simulator-error">
            {simulationError}
          </div>
        )}
      </motion.section>

      {simulation && (
        <motion.section
          className="simulation-dashboard"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.35 }}
        >
          <div className="result-highlight">
            <div>
              <span>Valor final estimado</span>
              <strong>{formatMoney(simulation.finalAmount)}</strong>
              <p>
                Simulação para {simulation.months} meses com perfil{" "}
                {profileLabel[normalizeProfile(simulation.profile)]}.
              </p>
            </div>

            <div className="result-rate">
              <span>Taxa anual usada</span>
              <strong>{formatPercent(simulation.annualRate)}</strong>
              <small>Taxa mensal aproximada: {formatPercent(simulation.monthlyRate)}</small>
            </div>
          </div>

          <div className="result-cards">
            <div>
              <span>Total investido</span>
              <strong>{formatMoney(simulation.totalInvested)}</strong>
            </div>

            <div>
              <span>Rendimento estimado</span>
              <strong className={simulation.estimatedProfit >= 0 ? "profit" : "loss"}>
                {formatMoney(simulation.estimatedProfit)}
              </strong>
            </div>

            <div>
              <span>Meta financeira</span>
              <strong>
                {simulation.targetAmount ? formatMoney(simulation.targetAmount) : "Não informada"}
              </strong>
            </div>
          </div>

          {simulation.targetAmount && (
            <div className="goal-progress-card">
              <div className="goal-progress-header">
                <div>
                  <span>Progresso da meta</span>
                  <strong>{formatPercent(goalProgress)}</strong>
                </div>

                <small className={simulation.goalReached ? "success" : "warning"}>
                  {simulation.goalReached
                    ? "Meta alcançada na simulação"
                    : `Faltam ${formatMoney(simulation.missingAmount || 0)}`}
                </small>
              </div>

              <div className="goal-progress-track">
                <div style={{ width: `${safeGoalProgress}%` }} />
              </div>
            </div>
          )}

          <div className="personalized-analysis">
            <div>
              <span className="investments-badge secondary">Análise personalizada</span>
              <h2>{simulation.recommendationTitle || "Simulação personalizada"}</h2>
              <p>
                {simulation.recommendationMessage || simulation.message}
              </p>
            </div>

            <div className="risk-analysis">
              <span>Leitura de risco</span>
              <p>{simulation.riskMessage || "O risco foi analisado com base no perfil informado."}</p>
            </div>
          </div>

          <section className="investment-charts">
            <div className="chart-card large">
              <div className="chart-header">
                <div>
                  <h3>Evolução do patrimônio</h3>
                  <span>Comparação entre valor investido e saldo projetado</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={simulation.projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: any) => formatMoney(Number(value))}
                    labelFormatter={(label) => `Mês ${label}`}
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "14px",
                      color: "#fff"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="#38bdf8"
                    fill="rgba(56, 189, 248, 0.18)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="Investido"
                    stroke="#22c55e"
                    fill="rgba(34, 197, 94, 0.08)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h3>Perfis comparados</h3>
                  <span>Valor final por perfil</span>
                </div>
              </div>

              {scenarioChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={310}>
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="profile" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value: any) => formatMoney(Number(value))}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "14px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="finalAmount" name="Valor final" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  Atualize o back-end para retornar o campo <strong>scenarios</strong>.
                </div>
              )}
            </div>
          </section>

          <div className="projection-summary">
            <div className="projection-header">
              <div>
                <h3>Últimos meses da projeção</h3>
                <span>Resumo do crescimento no final do período</span>
              </div>
            </div>

            <div className="projection-list">
              {lastProjectionPoints.map((item) => (
                <div className="projection-row" key={item.month}>
                  <span>Mês {item.month}</span>
                  <strong>{formatMoney(item.balance)}</strong>
                  <small>{formatMoney(item.profit)} de rendimento</small>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <motion.section
        className="investment-guide"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <div className="guide-header">
          <div>
            <span className="investments-badge">Guia rápido</span>
            <h2>Entenda os principais tipos de investimento</h2>
            <p>
              Esta área é educativa. A ideia é ajudar o usuário a entender riscos,
              liquidez e perfis antes de tomar qualquer decisão.
            </p>
          </div>
        </div>

        <div className="investments-tabs">
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
        </div>

        <div className="guide-context">
          <h3>{guideText[activeTab].title}</h3>
          <p>{guideText[activeTab].description}</p>
        </div>

        <div className="investment-items-grid">
          {guideItems.map((item) => (
            <div
              className={`investment-item-card ${activeTab === "crypto" ? "crypto-card" : ""}`}
              key={item.id}
            >
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

              <div className="ideal-box">
                <span>Ideal para</span>
                <strong>{item.idealPara}</strong>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <p className="simulator-note">
        As informações desta página são educativas e simuladas. O SaveApp não substitui orientação financeira profissional.
      </p>
    </div>
  );
}