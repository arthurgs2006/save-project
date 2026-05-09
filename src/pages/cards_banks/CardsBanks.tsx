import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./cards_banks.scss";
import TitleHeader from "../../components/generic_components/titleHeader";
import { BENEFITS_API_URL } from "../../config";

type ActiveTab = "cards" | "banks";
type GoalFilter = "all" | "low-cost" | "cashback" | "control" | "yield" | "travel";
type ScoreFilter = "all" | "high" | "medium" | "low";

type RecommendationItem = {
  name: string;
  type: string;
  risk: string;
  matchScore: number;
  reason: string;
  mainBenefit: string;
  bestFor: string;
  estimatedCost: string;
  recommendedUsage: string;
  actionLabel: string;
  tags: string[];
  institutionExamples: string[];
  attentionPoints: string[];
};

type RecommendationResponse = {
  userId: number;
  financialProfile: string;
  summary: string;
  monthlyCredits: number;
  monthlyDebits: number;
  monthlyResult: number;
  expenseRate: number;
  insights: string[];
  cards: RecommendationItem[];
  banks: RecommendationItem[];
  investments: RecommendationItem[];
};

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    return Number(cleaned) || 0;
  }

  return 0;
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item));
  }

  return [];
}

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getScoreClass(score: number) {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  return "attention";
}

function getProfileLabel(profile: string) {
  const normalized = normalizeText(profile);

  if (normalized === "conservador") return "Conservador";
  if (normalized === "moderado") return "Moderado";
  if (normalized === "agressivo") return "Agressivo";

  return profile || "Não identificado";
}

function getUserIncome(user: any) {
  return normalizeNumber(
    user.receita ??
      user.Receita ??
      user.renda ??
      user.Renda ??
      user.monthlyIncome ??
      user.MonthlyIncome ??
      user.income ??
      user.Income ??
      user.salario ??
      user.Salario
  );
}

function getUserBalance(user: any) {
  return normalizeNumber(
    user.saldo_final ??
      user.saldoFinal ??
      user.SaldoFinal ??
      user.balance ??
      user.Balance
  );
}

function getUserPreferences(user: any): string[] {
  const preferences =
    user.preferencias ??
    user.Preferencias ??
    user.preferences ??
    user.Preferences ??
    [];

  if (!Array.isArray(preferences)) return [];

  return preferences.map((item) => String(item));
}

function normalizeTransactionForApi(item: any) {
  const tipo =
    item.tipo ??
    item.Tipo ??
    item.origem ??
    item.Origem ??
    item.type ??
    item.Type ??
    "";

  const valor =
    item.valor ??
    item.Valor ??
    item.value ??
    item.Value ??
    item.amount ??
    item.Amount ??
    0;

  const descricao =
    item.descricao ??
    item.Descricao ??
    item.description ??
    item.Description ??
    item.name ??
    item.Name ??
    "";

  const data =
    item.data ??
    item.Data ??
    item.createdAt ??
    item.CreatedAt ??
    item.date ??
    item.Date ??
    "";

  return {
    tipo: String(tipo),
    valor: normalizeNumber(valor),
    descricao: String(descricao),
    data: String(data),
  };
}

function normalizeRecommendationItem(item: any): RecommendationItem {
  const name = item.name || item.Name || "Recomendação financeira";
  const type = item.type || item.Type || "Opção";
  const risk = item.risk || item.Risk || "Não informado";
  const matchScore = Number(item.matchScore || item.MatchScore || 0);

  const tags = normalizeList(item.tags || item.Tags);

  const institutionExamples = normalizeList(
    item.institutionExamples || item.InstitutionExamples
  );

  const attentionPoints = normalizeList(
    item.attentionPoints || item.AttentionPoints
  );

  const fallbackBenefit =
    normalizeText(type).includes("banco")
      ? "Organização e praticidade financeira"
      : "Uso financeiro mais adequado ao perfil";

  const fallbackBestFor =
    normalizeText(type).includes("banco")
      ? "Usuários que querem organizar dinheiro, pagamentos e movimentações."
      : "Usuários que querem comparar custo, controle e benefícios antes de escolher.";

  const fallbackExamples =
    normalizeText(type).includes("banco")
      ? ["Nubank", "Inter", "C6 Bank", "Mercado Pago"]
      : ["Nubank", "Inter", "C6 Bank", "Itaú"];

  return {
    name,
    type,
    risk,
    matchScore,
    reason:
      item.reason ||
      item.Reason ||
      "Essa opção foi identificada com base nos seus dados financeiros.",
    mainBenefit: item.mainBenefit || item.MainBenefit || fallbackBenefit,
    bestFor: item.bestFor || item.BestFor || fallbackBestFor,
    estimatedCost:
      item.estimatedCost ||
      item.EstimatedCost ||
      "Verifique tarifas, anuidade e regras diretamente na instituição.",
    recommendedUsage:
      item.recommendedUsage ||
      item.RecommendedUsage ||
      "Use como referência para comparar opções antes de contratar.",
    actionLabel: item.actionLabel || item.ActionLabel || "Ver análise",
    tags: tags.length > 0 ? tags : ["Comparação", "Educação financeira"],
    institutionExamples:
      institutionExamples.length > 0 ? institutionExamples : fallbackExamples,
    attentionPoints:
      attentionPoints.length > 0
        ? attentionPoints
        : [
            "As condições podem mudar com o tempo.",
            "Confira tarifas, juros e regras no site oficial da instituição.",
            "Evite contratar produtos que aumentem gastos sem necessidade.",
          ],
  };
}

function normalizeRecommendationResponse(data: any): RecommendationResponse {
  const rawCards = Array.isArray(data.cards)
    ? data.cards
    : Array.isArray(data.Cards)
      ? data.Cards
      : [];

  const rawBanks = Array.isArray(data.banks)
    ? data.banks
    : Array.isArray(data.Banks)
      ? data.Banks
      : [];

  const rawInvestments = Array.isArray(data.investments)
    ? data.investments
    : Array.isArray(data.Investments)
      ? data.Investments
      : [];

  const rawInsights = Array.isArray(data.insights)
    ? data.insights
    : Array.isArray(data.Insights)
      ? data.Insights
      : [];

  return {
    userId: Number(data.userId || data.UserId || 0),
    financialProfile:
      data.financialProfile ||
      data.FinancialProfile ||
      "Não identificado",
    summary:
      data.summary ||
      data.Summary ||
      "Analisamos seus dados para sugerir opções educativas de bancos e cartões.",
    monthlyCredits: normalizeNumber(data.monthlyCredits ?? data.MonthlyCredits),
    monthlyDebits: normalizeNumber(data.monthlyDebits ?? data.MonthlyDebits),
    monthlyResult: normalizeNumber(data.monthlyResult ?? data.MonthlyResult),
    expenseRate: normalizeNumber(data.expenseRate ?? data.ExpenseRate),
    insights: normalizeList(rawInsights),
    cards: rawCards.map((item: any) => normalizeRecommendationItem(item)),
    banks: rawBanks.map((item: any) => normalizeRecommendationItem(item)),
    investments: rawInvestments.map((item: any) =>
      normalizeRecommendationItem(item)
    ),
  };
}

export default function CardsBanks() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cards");
  const [goalFilter, setGoalFilter] = useState<GoalFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);

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

        const requestBody = {
          userId: Number(user.id || user.Id || 1) || 1,
          balance: getUserBalance(user),
          income: getUserIncome(user),
          preferences: getUserPreferences(user),
          transactions: (user.extratos || user.Extratos || []).map(
            normalizeTransactionForApi
          ),
        };

        const response = await fetch(`${BENEFITS_API_URL}/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const raw = await response.text();

        if (!response.ok) {
          throw new Error(raw || "Não foi possível carregar recomendações.");
        }

        const parsed = JSON.parse(raw);
        const normalized = normalizeRecommendationResponse(parsed);

        setRecommendations(normalized);
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

    const list =
      activeTab === "cards" ? recommendations.cards : recommendations.banks;

    return list.filter((item) => {
      const tags = item.tags || [];
      const institutionExamples = item.institutionExamples || [];
      const attentionPoints = item.attentionPoints || [];

      const searchableText = normalizeText(
        [
          item.name,
          item.type,
          item.risk,
          item.reason,
          item.mainBenefit,
          item.bestFor,
          item.estimatedCost,
          item.recommendedUsage,
          tags.join(" "),
          institutionExamples.join(" "),
          attentionPoints.join(" "),
        ].join(" ")
      );

      if (
        search.trim() &&
        !searchableText.includes(normalizeText(search.trim()))
      ) {
        return false;
      }

      if (goalFilter !== "all") {
        const tagsText = tags.map(normalizeText).join(" ");
        const name = normalizeText(item.name);
        const filterText = `${tagsText} ${name}`;

        if (
          goalFilter === "low-cost" &&
          !filterText.includes("sem anuidade") &&
          !filterText.includes("sem tarifa") &&
          !filterText.includes("baixo custo")
        ) {
          return false;
        }

        if (goalFilter === "cashback" && !filterText.includes("cashback")) {
          return false;
        }

        if (
          goalFilter === "control" &&
          !filterText.includes("controle") &&
          !filterText.includes("organizacao") &&
          !filterText.includes("organização")
        ) {
          return false;
        }

        if (
          goalFilter === "yield" &&
          !filterText.includes("rendimento") &&
          !filterText.includes("reserva")
        ) {
          return false;
        }

        if (
          goalFilter === "travel" &&
          !filterText.includes("viagem") &&
          !filterText.includes("internacional") &&
          !filterText.includes("milhas")
        ) {
          return false;
        }
      }

      if (scoreFilter === "high" && item.matchScore < 90) return false;

      if (
        scoreFilter === "medium" &&
        (item.matchScore < 75 || item.matchScore >= 90)
      ) {
        return false;
      }

      if (scoreFilter === "low" && item.matchScore >= 75) return false;

      return true;
    });
  }, [recommendations, activeTab, goalFilter, scoreFilter, search]);

  function closeModal() {
    setSelectedItem(null);
  }

  return (
    <div className="cards-banks-page">
      <motion.div
        className="cards-banks-header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <TitleHeader title="Cartões e Bancos" />

        <div className="cards-banks-hero-grid">
          <div className="cards-banks-hero">
            <span className="cards-banks-badge">Assistente financeiro</span>

            <h1>Compare bancos e cartões para o seu momento</h1>

            <p>
              Receba recomendações educativas com base em saldo, renda,
              movimentações, preferências e perfil financeiro.
            </p>
          </div>

          {recommendations && (
            <div className="cards-banks-profile-card">
              <span>Perfil identificado</span>
              <strong>{getProfileLabel(recommendations.financialProfile)}</strong>
              <p>{recommendations.summary}</p>
            </div>
          )}
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
          <section className="profile-insights">
            <div className="profile-insights-header">
              <div>
                <span className="cards-banks-badge">Leitura personalizada</span>
                <h2>O que seus dados indicam</h2>
              </div>
            </div>

            <div className="insights-grid">
              {recommendations.insights.length > 0 ? (
                recommendations.insights.map((insight, index) => (
                  <div className="insight-card" key={index}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{insight}</p>
                  </div>
                ))
              ) : (
                <div className="insight-card">
                  <span>01</span>
                  <p>
                    Ainda não há insights suficientes. Registre movimentações,
                    renda e preferências para melhorar as recomendações.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="cards-banks-tabs">
            <button
              type="button"
              className={activeTab === "cards" ? "active" : ""}
              onClick={() => setActiveTab("cards")}
            >
              <i className="bi bi-credit-card-2-front"></i>
              Cartões
            </button>

            <button
              type="button"
              className={activeTab === "banks" ? "active" : ""}
              onClick={() => setActiveTab("banks")}
            >
              <i className="bi bi-bank"></i>
              Bancos
            </button>
          </section>

          <section className="cards-banks-filters">
            <div className="cards-banks-search">
              <i className="bi bi-search"></i>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por Nubank, cashback, viagem, rendimento..."
              />
            </div>

            <label className="filter-select">
              Objetivo
              <select
                value={goalFilter}
                onChange={(event) =>
                  setGoalFilter(event.target.value as GoalFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="low-cost">Menor custo</option>
                <option value="cashback">Cashback</option>
                <option value="control">Controle</option>
                <option value="yield">Rendimento</option>
                <option value="travel">Viagem</option>
              </select>
            </label>

            <label className="filter-select">
              Compatibilidade
              <select
                value={scoreFilter}
                onChange={(event) =>
                  setScoreFilter(event.target.value as ScoreFilter)
                }
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </label>
          </section>

          <motion.section
            className="cards-banks-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="cards-banks-content-header">
              <div>
                <span className="cards-banks-badge secondary">
                  {activeTab === "cards"
                    ? "Cartões recomendados"
                    : "Bancos recomendados"}
                </span>
                <h2>{currentItems.length} opções encontradas</h2>
              </div>
            </div>

            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <article
                  className="financial-item-card"
                  key={`${item.name}-${index}`}
                >
                  <div className="financial-item-top">
                    <div>
                      <span className="financial-item-type">{item.type}</span>
                      <h3>{item.name}</h3>
                      <small>{item.reason}</small>
                    </div>

                    <span className={`score-badge ${getScoreClass(item.matchScore)}`}>
                      {item.matchScore}% compatível
                    </span>
                  </div>

                  <div className="financial-main-benefit">
                    <span>Principal benefício</span>
                    <strong>{item.mainBenefit}</strong>
                  </div>

                  <div className="financial-examples">
                    <span>Exemplos de mercado</span>
                    <div>
                      {item.institutionExamples.map((example) => (
                        <strong key={example}>{example}</strong>
                      ))}
                    </div>
                  </div>

                  <div className="financial-item-info">
                    <div>
                      <span>Ideal para</span>
                      <strong>{item.bestFor}</strong>
                    </div>

                    <div>
                      <span>Custo estimado</span>
                      <strong>{item.estimatedCost}</strong>
                    </div>

                    <div>
                      <span>Uso recomendado</span>
                      <strong>{item.recommendedUsage}</strong>
                    </div>
                  </div>

                  <div className="financial-bottom-grid">
                    <div className="attention-box">
                      <span>Pontos de atenção</span>
                      <ul>
                        {item.attentionPoints.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="tags-box">
                      <span>Tags</span>
                      <div>
                        {item.tags.map((tag) => (
                          <small key={tag}>{tag}</small>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="financial-card-footer">
                    <p>
                      Antes de contratar, confira tarifas, regras e condições
                      atualizadas diretamente na instituição.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                    >
                      Ver análise
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="cards-banks-state">
                Nenhuma recomendação encontrada com os filtros atuais.
              </div>
            )}
          </motion.section>

          <section className="cards-banks-education">
            <div>
              <span className="cards-banks-badge">Guia rápido</span>
              <h2>Como escolher melhor?</h2>
            </div>

            <div className="education-grid">
              <div>
                <i className="bi bi-credit-card"></i>
                <strong>Cartão</strong>
                <p>
                  Compare anuidade, juros, limite, benefícios e se o produto
                  ajuda ou atrapalha seu controle.
                </p>
              </div>

              <div>
                <i className="bi bi-bank"></i>
                <strong>Banco</strong>
                <p>
                  Avalie tarifas, atendimento, rendimento, facilidade do app,
                  PIX, segurança e organização por metas.
                </p>
              </div>

              <div>
                <i className="bi bi-shield-check"></i>
                <strong>Antes de contratar</strong>
                <p>
                  Leia as condições atuais da instituição. Benefícios, taxas e
                  regras podem mudar.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {selectedItem && (
        <div className="recommendation-modal-overlay" onClick={closeModal}>
          <motion.div
            className="recommendation-modal"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="recommendation-modal-close"
              onClick={closeModal}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="recommendation-modal-header">
              <span className="cards-banks-badge">Análise da recomendação</span>
              <h2>{selectedItem.name}</h2>
              <p>{selectedItem.reason}</p>
            </div>

            <div className="recommendation-modal-score">
              <div>
                <span>Compatibilidade</span>
                <strong>{selectedItem.matchScore}%</strong>
              </div>

              <div>
                <span>Risco</span>
                <strong>{selectedItem.risk}</strong>
              </div>

              <div>
                <span>Tipo</span>
                <strong>{selectedItem.type}</strong>
              </div>
            </div>

            <div className="recommendation-modal-grid">
              <div>
                <span>Principal benefício</span>
                <strong>{selectedItem.mainBenefit}</strong>
              </div>

              <div>
                <span>Ideal para</span>
                <strong>{selectedItem.bestFor}</strong>
              </div>

              <div>
                <span>Custo estimado</span>
                <strong>{selectedItem.estimatedCost}</strong>
              </div>

              <div>
                <span>Uso recomendado</span>
                <strong>{selectedItem.recommendedUsage}</strong>
              </div>
            </div>

            <div className="recommendation-modal-section">
              <span>Exemplos de mercado</span>
              <div className="recommendation-modal-pills">
                {selectedItem.institutionExamples.map((example) => (
                  <strong key={example}>{example}</strong>
                ))}
              </div>
            </div>

            <div className="recommendation-modal-section">
              <span>Pontos de atenção</span>
              <ul>
                {selectedItem.attentionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-modal-warning">
              <i className="bi bi-info-circle"></i>
              <p>
                Essa análise é educativa. Antes de contratar qualquer produto,
                confira tarifas, anuidade, juros, benefícios e regras atualizadas
                diretamente na instituição.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}