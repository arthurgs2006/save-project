using SaveApp.Api.DTOs.Recommendations;

namespace SaveApp.Api.Services
{
    public class RecommendationsService
    {
        public RecommendationResponseDto Generate(RecommendationRequestDto dto)
        {
            var income = dto.Income;
            var balance = dto.Balance;

            var credits = dto.Transactions
                .Where(x => x.Tipo.ToLower() == "credito")
                .Sum(x => x.Valor);

            var debits = dto.Transactions
                .Where(x => x.Tipo.ToLower() == "debito" || x.Tipo.ToLower() == "saque")
                .Sum(x => x.Valor);

            var profile = GetFinancialProfile(income, balance, credits, debits);
            var insights = GenerateInsights(income, balance, credits, debits, dto.Preferences);

            return new RecommendationResponseDto
            {
                UserId = dto.UserId,
                FinancialProfile = profile,
                Summary = GetSummary(profile),
                Insights = insights,
                Cards = RecommendCards(profile, income, balance),
                Banks = RecommendBanks(profile, income, balance, dto.Preferences),
                Investments = RecommendInvestments(profile, income, balance)
            };
        }

        private string GetFinancialProfile(decimal income, decimal balance, decimal credits, decimal debits)
        {
            if (balance < 300 || income < 1800)
                return "conservador";

            if (debits > credits && credits > 0)
                return "conservador";

            if (balance >= 300 && balance < 2500)
                return "moderado";

            return "agressivo";
        }

        private string GetSummary(string profile)
        {
            return profile switch
            {
                "conservador" => "Seu perfil indica foco em segurança, controle de gastos e baixa exposição a risco.",
                "moderado" => "Seu perfil indica equilíbrio entre segurança, benefícios financeiros e crescimento gradual.",
                "agressivo" => "Seu perfil indica maior margem para buscar rendimento, cashback e produtos com mais vantagens.",
                _ => "Perfil financeiro identificado com base nos dados informados."
            };
        }

        private List<string> GenerateInsights(
            decimal income,
            decimal balance,
            decimal credits,
            decimal debits,
            List<string> preferences)
        {
            var insights = new List<string>();

            if (balance < 300)
                insights.Add("Seu saldo atual está baixo. Priorize bancos sem tarifa e cartões sem anuidade.");

            if (income < 2000)
                insights.Add("Sua renda indica que produtos financeiros simples e sem custo fixo podem ser mais adequados.");

            if (credits > 0 && debits > credits)
                insights.Add("Seus gastos parecem maiores que suas entradas recentes. Vale priorizar controle financeiro.");

            if (preferences.Any())
                insights.Add($"Suas preferências indicam atenção para: {string.Join(", ", preferences)}.");

            if (balance >= 1000)
                insights.Add("Seu saldo permite considerar uma reserva em renda fixa de baixo risco.");

            if (!insights.Any())
                insights.Add("Seu perfil está equilibrado. Você pode comparar opções por custo, benefício e praticidade.");

            return insights;
        }

        private List<RecommendationItemDto> RecommendCards(string profile, decimal income, decimal balance)
        {
            var cards = new List<RecommendationItemDto>();

            cards.Add(new RecommendationItemDto
            {
                Name = "Cartão sem anuidade",
                Type = "Cartão",
                Risk = "Baixo",
                MatchScore = profile == "conservador" ? 95 : 82,
                Reason = "Boa opção para evitar custo fixo e manter controle financeiro.",
                Tags = new List<string> { "Sem anuidade", "Uso diário", "Baixo custo" }
            });

            if (income >= 1800)
            {
                cards.Add(new RecommendationItemDto
                {
                    Name = "Cartão com cashback",
                    Type = "Cartão",
                    Risk = "Médio",
                    MatchScore = profile == "moderado" ? 90 : 78,
                    Reason = "Pode devolver parte dos gastos e gerar benefício no uso recorrente.",
                    Tags = new List<string> { "Cashback", "Benefícios", "Compras" }
                });
            }

            if (income >= 4000 && balance >= 2000)
            {
                cards.Add(new RecommendationItemDto
                {
                    Name = "Cartão premium",
                    Type = "Cartão",
                    Risk = "Alto",
                    MatchScore = profile == "agressivo" ? 88 : 62,
                    Reason = "Pode fazer sentido caso você tenha renda maior e use bastante benefícios.",
                    Tags = new List<string> { "Premium", "Limite maior", "Benefícios" }
                });
            }

            return cards.OrderByDescending(x => x.MatchScore).ToList();
        }

        private List<RecommendationItemDto> RecommendBanks(
            string profile,
            decimal income,
            decimal balance,
            List<string> preferences)
        {
            var banks = new List<RecommendationItemDto>();

            banks.Add(new RecommendationItemDto
            {
                Name = "Banco digital sem tarifas",
                Type = "Banco",
                Risk = "Baixo",
                MatchScore = 94,
                Reason = "Combina com usuários que querem praticidade, baixo custo e controle pelo app.",
                Tags = new List<string> { "Digital", "Sem tarifa", "Prático" }
            });

            if (balance >= 500)
            {
                banks.Add(new RecommendationItemDto
                {
                    Name = "Conta com rendimento automático",
                    Type = "Banco",
                    Risk = "Baixo",
                    MatchScore = profile == "conservador" ? 88 : 84,
                    Reason = "Ajuda o saldo parado a render sem exigir decisões complexas.",
                    Tags = new List<string> { "Rendimento", "Reserva", "Liquidez" }
                });
            }

            if (preferences.Contains("viagem") || income >= 3500)
            {
                banks.Add(new RecommendationItemDto
                {
                    Name = "Conta com benefícios e cartão integrado",
                    Type = "Banco",
                    Risk = "Médio",
                    MatchScore = 80,
                    Reason = "Pode ser útil para quem busca benefícios, organização e serviços em um só lugar.",
                    Tags = new List<string> { "Benefícios", "Cartão", "Organização" }
                });
            }

            return banks.OrderByDescending(x => x.MatchScore).ToList();
        }

        private List<RecommendationItemDto> RecommendInvestments(string profile, decimal income, decimal balance)
        {
            var investments = new List<RecommendationItemDto>();

            investments.Add(new RecommendationItemDto
            {
                Name = "Tesouro Selic / reserva de emergência",
                Type = "Investimento",
                Risk = "Baixo",
                MatchScore = profile == "conservador" ? 96 : 86,
                Reason = "Indicado para segurança, liquidez e construção de reserva.",
                Tags = new List<string> { "Renda fixa", "Baixo risco", "Reserva" }
            });

            if (balance >= 1000)
            {
                investments.Add(new RecommendationItemDto
                {
                    Name = "CDB com liquidez diária",
                    Type = "Investimento",
                    Risk = "Baixo",
                    MatchScore = 88,
                    Reason = "Alternativa simples para buscar rendimento mantendo acesso ao dinheiro.",
                    Tags = new List<string> { "CDB", "CDI", "Liquidez" }
                });
            }

            if (profile == "moderado" || profile == "agressivo")
            {
                investments.Add(new RecommendationItemDto
                {
                    Name = "Fundos multimercado",
                    Type = "Investimento",
                    Risk = "Médio",
                    MatchScore = profile == "moderado" ? 86 : 78,
                    Reason = "Pode equilibrar risco e retorno para objetivos de médio prazo.",
                    Tags = new List<string> { "Moderado", "Diversificação", "Fundos" }
                });
            }

            if (profile == "agressivo")
            {
                investments.Add(new RecommendationItemDto
                {
                    Name = "Ações ou cripto com baixa exposição",
                    Type = "Investimento",
                    Risk = "Alto",
                    MatchScore = 76,
                    Reason = "Pode fazer sentido para pequena parte da carteira, aceitando maior oscilação.",
                    Tags = new List<string> { "Alto risco", "Longo prazo", "Volatilidade" }
                });
            }

            return investments.OrderByDescending(x => x.MatchScore).ToList();
        }
    }
}