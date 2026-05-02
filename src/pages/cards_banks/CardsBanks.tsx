import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./cards_banks.scss";
import TitleHeader from "../../components/generic_components/titleHeader";

type TabType = "cards" | "banks";

type CardItem = {
  id: number;
  nome: string;
  banco: string;
  anuidade: string;
  cashback: string;
  score: "Baixo" | "Médio" | "Alto";
  perfil: string;
  recomendacao: string;
  semAnuidade: boolean;
};

type BankItem = {
  id: number;
  nome: string;
  tarifa: string;
  rendimento: string;
  contaDigital: boolean;
  perfil: string;
  recomendacao: string;
};

const cardsData: CardItem[] = [
  {
    id: 1,
    nome: "Nubank Platinum",
    banco: "Nubank",
    anuidade: "Sem anuidade",
    cashback: "Não possui cashback",
    score: "Médio",
    perfil: "Uso diário",
    recomendacao: "Boa escolha para quem busca simplicidade e controle pelo app.",
    semAnuidade: true,
  },
  {
    id: 2,
    nome: "Inter Black",
    banco: "Banco Inter",
    anuidade: "Sem anuidade (com condição)",
    cashback: "1% cashback",
    score: "Alto",
    perfil: "Cashback / benefícios",
    recomendacao: "Mais indicado para quem quer vantagens e maior faixa de renda.",
    semAnuidade: true,
  },
  {
    id: 3,
    nome: "C6 Carbon",
    banco: "C6 Bank",
    anuidade: "Possui anuidade",
    cashback: "Pontos e benefícios",
    score: "Alto",
    perfil: "Milhas / benefícios",
    recomendacao: "Opção mais voltada a quem prioriza vantagens premium.",
    semAnuidade: false,
  },
  {
    id: 4,
    nome: "Santander SX",
    banco: "Santander",
    anuidade: "Isenta com condição",
    cashback: "Não possui cashback",
    score: "Baixo",
    perfil: "Entrada",
    recomendacao: "Alternativa mais acessível para quem está começando no crédito.",
    semAnuidade: false,
  },
];

const banksData: BankItem[] = [
  {
    id: 1,
    nome: "Nubank",
    tarifa: "Sem tarifa",
    rendimento: "Rende automaticamente",
    contaDigital: true,
    perfil: "Simplicidade",
    recomendacao: "Boa opção para organização financeira e praticidade no dia a dia.",
  },
  {
    id: 2,
    nome: "Banco Inter",
    tarifa: "Sem tarifa",
    rendimento: "100% do CDI em opções integradas",
    contaDigital: true,
    perfil: "Conta + investimentos",
    recomendacao: "Mais interessante para quem quer centralizar serviços em um só lugar.",
  },
  {
    id: 3,
    nome: "C6 Bank",
    tarifa: "Baixa tarifa / digital",
    rendimento: "Produtos atrelados ao CDI",
    contaDigital: true,
    perfil: "Benefícios e personalização",
    recomendacao: "Opção para quem busca conta digital com mais variedade de serviços.",
  },
  {
    id: 4,
    nome: "Itaú",
    tarifa: "Pode possuir tarifa",
    rendimento: "Depende do produto",
    contaDigital: false,
    perfil: "Tradicional",
    recomendacao: "Mais adequado para quem prefere uma instituição mais tradicional.",
  },
];

const scoreClass = (score: string) => {
  if (score === "Baixo") return "low";
  if (score === "Médio") return "medium";
  return "high";
};

export default function CardsBanks() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("cards");
  const [onlyNoAnnualFee, setOnlyNoAnnualFee] = useState<boolean>(false);
  const [scoreFilter, setScoreFilter] = useState<string>("Todos");
  const [onlyDigital, setOnlyDigital] = useState<boolean>(false);

  const filteredCards = useMemo(() => {
    return cardsData.filter((item) => {
      const annualityMatch = onlyNoAnnualFee ? item.semAnuidade : true;
      const scoreMatch = scoreFilter === "Todos" ? true : item.score === scoreFilter;
      return annualityMatch && scoreMatch;
    });
  }, [onlyNoAnnualFee, scoreFilter]);

  const filteredBanks = useMemo(() => {
    return banksData.filter((item) => {
      return onlyDigital ? item.contaDigital : true;
    });
  }, [onlyDigital]);

  return (
    <div className="cards-banks-page">
      <motion.div
        className="cards-banks-header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
         <TitleHeader title="Cartões e Bancos"  />

        <div className="cards-banks-hero">
          <span className="cards-banks-badge">Cartões e Bancos</span>
          <h1>Compare opções financeiras do dia a dia</h1>
          <p>
            Analise cartões de crédito e contas bancárias com base em taxas,
            benefícios, rendimento e aderência ao perfil do usuário.
          </p>
        </div>
      </motion.div>

      <section className="cards-banks-summary">
        <div className="summary-card">
          <span>Módulo</span>
          <strong>Comparação financeira</strong>
        </div>

        <div className="summary-card">
          <span>Organização</span>
          <strong>Abas por categoria</strong>
        </div>

        <div className="summary-card">
          <span>Foco</span>
          <strong>Custo-benefício e perfil</strong>
        </div>
      </section>

      <section className="cards-banks-tabs">
        <button
          className={activeTab === "cards" ? "active" : ""}
          onClick={() => setActiveTab("cards")}
        >
          Cartões
        </button>

        <button
          className={activeTab === "banks" ? "active" : ""}
          onClick={() => setActiveTab("banks")}
        >
          Bancos
        </button>
      </section>

      {activeTab === "cards" && (
        <>
          <section className="cards-banks-filters">
            <label className="filter-check">
              <input
                type="checkbox"
                checked={onlyNoAnnualFee}
                onChange={(e) => setOnlyNoAnnualFee(e.target.checked)}
              />
              <span>Somente sem anuidade</span>
            </label>

            <label className="filter-select">
              <span>Filtrar por score</span>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
              </select>
            </label>
          </section>

          <motion.section
            className="cards-banks-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            {filteredCards.map((item) => (
              <div className="financial-item-card" key={item.id}>
                <div className="financial-item-top">
                  <div>
                    <span className="financial-item-type">Cartão</span>
                    <h3>{item.nome}</h3>
                    <small>{item.banco}</small>
                  </div>

                  <span className={`score-badge ${scoreClass(item.score)}`}>
                    Score {item.score}
                  </span>
                </div>

                <p className="financial-item-description">{item.recomendacao}</p>

                <div className="financial-item-info">
                  <div>
                    <span>Anuidade</span>
                    <strong>{item.anuidade}</strong>
                  </div>
                  <div>
                    <span>Cashback / benefícios</span>
                    <strong>{item.cashback}</strong>
                  </div>
                  <div>
                    <span>Perfil indicado</span>
                    <strong>{item.perfil}</strong>
                  </div>
                </div>
              </div>
            ))}
          </motion.section>
        </>
      )}

      {activeTab === "banks" && (
        <>
          <section className="cards-banks-filters">
            <label className="filter-check">
              <input
                type="checkbox"
                checked={onlyDigital}
                onChange={(e) => setOnlyDigital(e.target.checked)}
              />
              <span>Somente bancos digitais</span>
            </label>
          </section>

          <motion.section
            className="cards-banks-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            {filteredBanks.map((item) => (
              <div className="financial-item-card" key={item.id}>
                <div className="financial-item-top">
                  <div>
                    <span className="financial-item-type">Banco</span>
                    <h3>{item.nome}</h3>
                    <small>{item.contaDigital ? "Conta digital" : "Conta tradicional"}</small>
                  </div>

                  <span className={`digital-badge ${item.contaDigital ? "yes" : "no"}`}>
                    {item.contaDigital ? "Digital" : "Tradicional"}
                  </span>
                </div>

                <p className="financial-item-description">{item.recomendacao}</p>

                <div className="financial-item-info">
                  <div>
                    <span>Taxas / tarifas</span>
                    <strong>{item.tarifa}</strong>
                  </div>
                  <div>
                    <span>Rendimento</span>
                    <strong>{item.rendimento}</strong>
                  </div>
                  <div>
                    <span>Perfil indicado</span>
                    <strong>{item.perfil}</strong>
                  </div>
                </div>
              </div>
            ))}
          </motion.section>
        </>
      )}
    </div>
  );
}