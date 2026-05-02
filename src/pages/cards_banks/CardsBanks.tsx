import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./cards_banks.scss";
import TitleHeader from "../../components/generic_components/titleHeader";
import { BENEFITS_API_URL } from "../../config";

type ActiveTab = "cards" | "banks";

type RecommendationItem = {
  name: string;
  type: string;
  risk: string;
  matchScore: number;
  reason: string;
  tags: string[];
};

type RecommendationResponse = {
  userId: number;
  financialProfile: string;
  summary: string;
  insights: string[];
  cards: RecommendationItem[];
  banks: RecommendationItem[];
  investments: RecommendationItem[];
};

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    return Number(value.replace(",", ".")) || 0;
  }
  return 0;
}

function getScoreClass(score: number) {
  if (score >= 90) return "low";
  if (score >= 75) return "medium";
  return "high";
}

export default function CardsBanks() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cards");
  const [onlyNoAnnualFee, setOnlyNoAnnualFee] = useState(false);
  const [onlyDigital, setOnlyDigital] = useState(false);
  const [scoreFilter, setScoreFilter] = useState("all");

  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("loggedUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(storedUser);

        const response = await fetch(`${BENEFITS_API_URL}/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: Number(user.id || user.Id || 1) || 1,
            balance: normalizeNumber(user.saldo_final),
            income: normalizeNumber(user.receita),
            preferences: user.preferencias || [],
            transactions: user.extratos || []
          })
        });

        const raw = await response.text();

        if (!response.ok) {
          throw new Error(raw || "Não foi possível carregar recomendações.");
        }

        setRecommendations(JSON.parse(raw));
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as recomendações agora.");
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  const currentItems = useMemo(() => {
    if (!recommendations) return [];

    const list = activeTab === "cards"
      ? recommendations.cards
      : recommendations.banks;

    return list.filter((item) => {
      const tags = item.tags.map((tag) => tag.toLowerCase());

      if (onlyNoAnnualFee && !tags.some((tag) => tag.includes("anuidade"))) {
        return false;
      }

      if (onlyDigital && !tags.some((tag) => tag.includes("digital"))) {
        return false;
      }

      if (scoreFilter === "high" && item.matchScore < 90) {
        return false;
      }

      if (
        scoreFilter === "medium" &&
        (item.matchScore < 75 || item.matchScore >= 90)
      ) {
        return false;
      }

      if (scoreFilter === "low" && item.matchScore >= 75) {
        return false;
      }

      return true;
    });
  }, [recommendations, activeTab, onlyNoAnnualFee, onlyDigital, scoreFilter]);

  return (
    <div className="cards-banks-page">
      <motion.div
        className="cards-banks-header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <TitleHeader title="Cartões e Bancos" />

        <div className="cards-banks-hero">
          <span className="cards-banks-badge">Recomendações</span>

          <h1>Opções financeiras para o seu perfil</h1>

          <p>
            Compare cartões e bancos com base nos seus dados financeiros,
            saldo, receita, preferências e histórico de movimentações.
          </p>
        </div>
      </motion.div>

      {loading && (
        <div className="cards-banks-state">
          Carregando recomendações personalizadas...
        </div>
      )}

      {!loading && error && (
        <div className="cards-banks-state cards-banks-state--error">
          {error}
        </div>
      )}

      {!loading && !error && recommendations && (
        <>
          <section className="cards-banks-summary">
            <div className="summary-card">
              <span>Perfil identificado</span>
              <strong>{recommendations.financialProfile}</strong>
            </div>

            <div className="summary-card">
              <span>Cartões recomendados</span>
              <strong>{recommendations.cards.length}</strong>
            </div>

            <div className="summary-card">
              <span>Bancos recomendados</span>
              <strong>{recommendations.banks.length}</strong>
            </div>
          </section>

          <section className="profile-insights">
            <div>
              <span className="cards-banks-badge">Baseado no seu perfil</span>
              <h2>{recommendations.summary}</h2>
            </div>

            <div className="insights-grid">
              {recommendations.insights.map((insight, index) => (
                <div className="insight-card" key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="cards-banks-tabs">
            <button
              type="button"
              className={activeTab === "cards" ? "active" : ""}
              onClick={() => setActiveTab("cards")}
            >
              Cartões
            </button>

            <button
              type="button"
              className={activeTab === "banks" ? "active" : ""}
              onClick={() => setActiveTab("banks")}
            >
              Bancos
            </button>
          </section>

          <section className="cards-banks-filters">
            <label className="filter-check">
              <input
                type="checkbox"
                checked={onlyNoAnnualFee}
                onChange={(event) => setOnlyNoAnnualFee(event.target.checked)}
              />
              Sem anuidade
            </label>

            <label className="filter-check">
              <input
                type="checkbox"
                checked={onlyDigital}
                onChange={(event) => setOnlyDigital(event.target.checked)}
              />
              Digital
            </label>

            <label className="filter-select">
              Compatibilidade
              <select
                value={scoreFilter}
                onChange={(event) => setScoreFilter(event.target.value)}
              >
                <option value="all">Todas</option>
                <option value="high">Alta compatibilidade</option>
                <option value="medium">Média compatibilidade</option>
                <option value="low">Baixa compatibilidade</option>
              </select>
            </label>
          </section>

          <motion.section
            className="cards-banks-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div className="financial-item-card" key={`${item.name}-${index}`}>
                  <div className="financial-item-top">
                    <div>
                      <span className="financial-item-type">{item.type}</span>
                      <h3>{item.name}</h3>
                      <small>{item.reason}</small>
                    </div>

                    <span className={`score-badge ${getScoreClass(item.matchScore)}`}>
                      {item.matchScore}%
                    </span>
                  </div>

                  <p className="financial-item-description">
                    Recomendação gerada com base no seu saldo, receita,
                    preferências e movimentações recentes.
                  </p>

                  <div className="financial-item-info">
                    <div>
                      <span>Risco</span>
                      <strong>{item.risk}</strong>
                    </div>

                    <div>
                      <span>Compatibilidade</span>
                      <strong>{item.matchScore}%</strong>
                    </div>

                    <div>
                      <span>Tags</span>
                      <strong>{item.tags.join(", ")}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="cards-banks-state">
                Nenhuma recomendação encontrada com os filtros atuais.
              </div>
            )}
          </motion.section>
        </>
      )}
    </div>
  );
}