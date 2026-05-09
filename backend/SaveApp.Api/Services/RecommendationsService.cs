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
                .Where(x => IsCredit(x.Tipo))
                .Sum(x => Math.Abs(x.Valor));

            var debits = dto.Transactions
                .Where(x => IsDebit(x.Tipo))
                .Sum(x => Math.Abs(x.Valor));

            var monthlyBase = income > 0 ? income : credits;
            var expenseRate = monthlyBase > 0
                ? Math.Round((debits / monthlyBase) * 100, 2)
                : 0;

            var monthlyResult = credits - debits;

            var profile = GetFinancialProfile(income, balance, credits, debits, expenseRate);
            var insights = GenerateInsights(income, balance, credits, debits, expenseRate, dto.Preferences);

            return new RecommendationResponseDto
            {
                UserId = dto.UserId,
                FinancialProfile = profile,
                Summary = GetSummary(profile, income, balance, expenseRate),
                MonthlyCredits = credits,
                MonthlyDebits = debits,
                MonthlyResult = monthlyResult,
                ExpenseRate = expenseRate,
                Insights = insights,
                Cards = RecommendCards(profile, income, balance, expenseRate, dto.Preferences),
                Banks = RecommendBanks(profile, income, balance, expenseRate, dto.Preferences),
                Investments = RecommendInvestments(profile, income, balance)
            };
        }

        private string GetFinancialProfile(
            decimal income,
            decimal balance,
            decimal credits,
            decimal debits,
            decimal expenseRate)
        {
            if (balance < 500 || income < 1800 || expenseRate >= 85)
                return "conservador";

            if (balance >= 500 && balance < 3000)
                return "moderado";

            if (income >= 4000 && balance >= 2500 && expenseRate < 70)
                return "agressivo";

            if (credits > 0 && debits > credits)
                return "conservador";

            return "moderado";
        }

        private string GetSummary(string profile, decimal income, decimal balance, decimal expenseRate)
        {
            return profile switch
            {
                "conservador" =>
                    "Seu perfil indica prioridade em baixo custo, controle financeiro, produtos simples e menor exposição a tarifas ou riscos.",

                "moderado" =>
                    "Seu perfil indica equilíbrio entre praticidade, controle, benefícios e produtos que podem melhorar sua organização financeira.",

                "agressivo" =>
                    "Seu perfil indica maior margem para comparar produtos com benefícios, cashback, pontos, serviços premium e alternativas de rendimento.",

                _ =>
                    "Perfil financeiro identificado com base nos dados informados."
            };
        }

        private List<string> GenerateInsights(
            decimal income,
            decimal balance,
            decimal credits,
            decimal debits,
            decimal expenseRate,
            List<string> preferences)
        {
            var insights = new List<string>();

            if (credits > 0)
                insights.Add($"Foram analisadas entradas recentes no valor de R$ {credits:N2}.");

            if (debits > 0)
                insights.Add($"Foram analisadas saídas recentes no valor de R$ {debits:N2}.");

            if (balance < 500)
                insights.Add("Seu saldo atual pede foco em produtos sem tarifa, sem anuidade e com boa previsibilidade.");

            if (income > 0 && expenseRate >= 80)
                insights.Add("Seus gastos consomem uma parte alta da renda. Cartões simples e bancos com controle pelo app tendem a combinar melhor.");

            if (credits > 0 && debits > credits)
                insights.Add("As saídas recentes superam as entradas. Vale priorizar controle, alertas e evitar produtos com custo fixo.");

            if (balance >= 1000)
                insights.Add("Parte do saldo pode ser organizada em uma conta com liquidez ou reserva de baixo risco, conforme seu objetivo.");

            if (preferences.Any())
                insights.Add($"Suas preferências indicam foco em: {string.Join(", ", preferences)}.");

            if (!insights.Any())
                insights.Add("Seu perfil está equilibrado. Compare produtos por custo, praticidade, benefícios e facilidade de controle.");

            return insights;
        }

        private List<RecommendationItemDto> RecommendCards(
            string profile,
            decimal income,
            decimal balance,
            decimal expenseRate,
            List<string> preferences)
        {
            var cards = new List<RecommendationItemDto>();

            cards.Add(new RecommendationItemDto
            {
                Name = "Cartão essencial sem anuidade",
                Type = "Cartão",
                Risk = "Baixo",
                MatchScore = profile == "conservador" ? 96 : 86,
                MainBenefit = "Evitar custo fixo mensal",
                BestFor = "Uso diário, compras básicas e controle financeiro.",
                EstimatedCost = "Geralmente sem anuidade, dependendo da instituição.",
                RecommendedUsage = "Usar para compras planejadas e pagar a fatura integralmente.",
                ActionLabel = "Comparar cartões básicos",
                Reason = "Combina com usuários que querem praticidade sem assumir custos recorrentes.",
                Tags = new List<string> { "Sem anuidade", "Controle", "Iniciante", "Baixo custo" },
                InstitutionExamples = new List<string> { "Nubank", "Inter", "Neon", "Will Bank" },
                AttentionPoints = new List<string>
                {
                    "Benefícios podem ser mais simples.",
                    "Limite depende da análise da instituição.",
                    "Evite parcelamentos longos se o objetivo for controle."
                }
            });

            if (income >= 1800 && expenseRate < 85)
            {
                cards.Add(new RecommendationItemDto
                {
                    Name = "Cartão com cashback",
                    Type = "Cartão",
                    Risk = "Médio",
                    MatchScore = profile == "moderado" ? 92 : 82,
                    MainBenefit = "Receber parte do gasto de volta",
                    BestFor = "Usuários que concentram compras no cartão e pagam a fatura em dia.",
                    EstimatedCost = "Pode ser gratuito ou ter regras para liberar benefícios.",
                    RecommendedUsage = "Concentrar gastos essenciais, sem aumentar consumo só por cashback.",
                    ActionLabel = "Ver opções com cashback",
                    Reason = "Seu perfil permite buscar benefício em compras recorrentes sem priorizar produtos premium.",
                    Tags = new List<string> { "Cashback", "Benefícios", "Compras", "Uso recorrente" },
                    InstitutionExamples = new List<string> { "Méliuz", "Inter", "PicPay", "C6 Bank" },
                    AttentionPoints = new List<string>
                    {
                        "Cashback não compensa juros de atraso.",
                        "Verifique regras de resgate.",
                        "Evite gastar mais apenas para acumular benefício."
                    }
                });
            }

            if ((income >= 3500 && balance >= 1500) || preferences.Any(x => Normalize(x).Contains("viagem")))
            {
                cards.Add(new RecommendationItemDto
                {
                    Name = "Cartão com pontos ou benefícios de viagem",
                    Type = "Cartão",
                    Risk = "Médio",
                    MatchScore = profile == "agressivo" ? 88 : 74,
                    MainBenefit = "Acumular pontos, milhas ou benefícios adicionais",
                    BestFor = "Usuários com gastos maiores e interesse em viagens, pontos ou serviços extras.",
                    EstimatedCost = "Pode ter anuidade ou exigir gasto mínimo.",
                    RecommendedUsage = "Avaliar se os benefícios superam qualquer custo fixo.",
                    ActionLabel = "Comparar benefícios",
                    Reason = "Pode fazer sentido se você usa bastante o cartão e aproveita benefícios reais.",
                    Tags = new List<string> { "Pontos", "Milhas", "Viagem", "Benefícios" },
                    InstitutionExamples = new List<string> { "C6 Bank", "XP", "BTG Pactual", "Itaú" },
                    AttentionPoints = new List<string>
                    {
                        "Pode ter anuidade.",
                        "Benefícios variam bastante conforme o plano.",
                        "Não é ideal se a renda está muito comprometida."
                    }
                });
            }

            if (income >= 6000 && balance >= 4000 && profile == "agressivo")
            {
                cards.Add(new RecommendationItemDto
                {
                    Name = "Cartão premium",
                    Type = "Cartão",
                    Risk = "Alto",
                    MatchScore = 84,
                    MainBenefit = "Benefícios avançados e serviços extras",
                    BestFor = "Usuários com renda maior, gastos recorrentes altos e uso estratégico dos benefícios.",
                    EstimatedCost = "Pode ter anuidade elevada ou exigência de relacionamento.",
                    RecommendedUsage = "Usar apenas se os benefícios forem realmente aproveitados.",
                    ActionLabel = "Avaliar custo-benefício",
                    Reason = "Seu perfil sugere margem para analisar produtos mais completos, desde que o custo faça sentido.",
                    Tags = new List<string> { "Premium", "Limite maior", "Benefícios", "Alta renda" },
                    InstitutionExamples = new List<string> { "XP Visa Infinite", "BTG Black", "Itaú Personnalité", "Santander Select" },
                    AttentionPoints = new List<string>
                    {
                        "Custo pode ser alto.",
                        "Benefícios exigem uso frequente.",
                        "Não deve ser prioridade antes da reserva financeira."
                    }
                });
            }

            return cards.OrderByDescending(x => x.MatchScore).ToList();
        }

        private List<RecommendationItemDto> RecommendBanks(
            string profile,
            decimal income,
            decimal balance,
            decimal expenseRate,
            List<string> preferences)
        {
            var banks = new List<RecommendationItemDto>();

            banks.Add(new RecommendationItemDto
            {
                Name = "Conta digital sem tarifas",
                Type = "Banco",
                Risk = "Baixo",
                MatchScore = profile == "conservador" ? 97 : 90,
                MainBenefit = "Reduzir custos bancários",
                BestFor = "Usuários que querem praticidade, PIX, cartão, app simples e baixo custo.",
                EstimatedCost = "Geralmente sem tarifa de manutenção.",
                RecommendedUsage = "Usar como conta principal para movimentações do dia a dia.",
                ActionLabel = "Comparar contas digitais",
                Reason = "Combina com quem quer controlar melhor o dinheiro sem pagar por serviços básicos.",
                Tags = new List<string> { "Digital", "Sem tarifa", "Controle", "PIX" },
                InstitutionExamples = new List<string> { "Nubank", "Inter", "Neon", "C6 Bank" },
                AttentionPoints = new List<string>
                {
                    "Serviços avançados podem ter cobrança.",
                    "Atendimento pode variar por instituição.",
                    "Verifique limites, saques e tarifas específicas."
                }
            });

            if (balance >= 500)
            {
                banks.Add(new RecommendationItemDto
                {
                    Name = "Conta com rendimento automático",
                    Type = "Banco",
                    Risk = "Baixo",
                    MatchScore = profile == "conservador" ? 91 : 86,
                    MainBenefit = "Fazer o saldo parado render",
                    BestFor = "Reserva de emergência, dinheiro parado e metas de curto prazo.",
                    EstimatedCost = "Normalmente sem custo direto, mas pode haver impostos ou regras de prazo.",
                    RecommendedUsage = "Separar uma parte do saldo para reserva com liquidez.",
                    ActionLabel = "Ver contas com rendimento",
                    Reason = "Seu saldo permite organizar uma reserva que não fique totalmente parada.",
                    Tags = new List<string> { "Rendimento", "Reserva", "Liquidez", "Baixo risco" },
                    InstitutionExamples = new List<string> { "Nubank", "Mercado Pago", "PicPay", "Inter" },
                    AttentionPoints = new List<string>
                    {
                        "Rendimento pode mudar ao longo do tempo.",
                        "Verifique liquidez e tributação.",
                        "Não confunda reserva com dinheiro para gastar."
                    }
                });
            }

            if (income >= 3000 || preferences.Any(x => Normalize(x).Contains("organizacao")))
            {
                banks.Add(new RecommendationItemDto
                {
                    Name = "Banco com organização por objetivos",
                    Type = "Banco",
                    Risk = "Baixo",
                    MatchScore = profile == "moderado" ? 88 : 80,
                    MainBenefit = "Separar dinheiro por metas",
                    BestFor = "Usuários que querem separar reserva, gastos mensais e objetivos.",
                    EstimatedCost = "Pode ser gratuito, dependendo do banco e dos serviços usados.",
                    RecommendedUsage = "Criar divisões para reserva, contas fixas, lazer e metas.",
                    ActionLabel = "Comparar organização por metas",
                    Reason = "Ajuda a transformar planejamento em rotina, principalmente com metas e recorrentes.",
                    Tags = new List<string> { "Metas", "Organização", "Planejamento", "Controle" },
                    InstitutionExamples = new List<string> { "Nubank Caixinhas", "Inter", "C6 Bank", "Itaú" },
                    AttentionPoints = new List<string>
                    {
                        "Nem todo recurso rende automaticamente.",
                        "Organização depende de disciplina do usuário.",
                        "Compare usabilidade e regras do app."
                    }
                });
            }

            if (preferences.Any(x => Normalize(x).Contains("viagem")) || income >= 4500)
            {
                banks.Add(new RecommendationItemDto
                {
                    Name = "Conta com serviços para viagem ou uso internacional",
                    Type = "Banco",
                    Risk = "Médio",
                    MatchScore = profile == "agressivo" ? 84 : 76,
                    MainBenefit = "Facilitar compras e organização em moeda estrangeira",
                    BestFor = "Usuários que viajam, compram em sites internacionais ou querem estudar câmbio.",
                    EstimatedCost = "Pode envolver spread, IOF, tarifas ou regras específicas.",
                    RecommendedUsage = "Usar como apoio para viagens, não como conta principal sem comparação.",
                    ActionLabel = "Avaliar conta internacional",
                    Reason = "Pode ser útil se sua rotina envolve viagens ou compras internacionais.",
                    Tags = new List<string> { "Viagem", "Internacional", "Câmbio", "Serviços" },
                    InstitutionExamples = new List<string> { "Wise", "Nomad", "C6 Global", "Inter Global Account" },
                    AttentionPoints = new List<string>
                    {
                        "Taxas e câmbio mudam com frequência.",
                        "Verifique IOF e spread.",
                        "Nem sempre é necessário para uso doméstico."
                    }
                });
            }

            return banks.OrderByDescending(x => x.MatchScore).ToList();
        }

        private List<RecommendationItemDto> RecommendInvestments(string profile, decimal income, decimal balance)
        {
            var investments = new List<RecommendationItemDto>();

            investments.Add(new RecommendationItemDto
            {
                Name = "Reserva em renda fixa de baixo risco",
                Type = "Investimento",
                Risk = "Baixo",
                MatchScore = profile == "conservador" ? 96 : 86,
                MainBenefit = "Segurança e liquidez",
                BestFor = "Reserva de emergência e objetivos de curto prazo.",
                EstimatedCost = "Pode ter imposto ou taxa conforme produto/instituição.",
                RecommendedUsage = "Priorizar antes de produtos de maior risco.",
                ActionLabel = "Estudar renda fixa",
                Reason = "Indicado para criar base financeira antes de buscar retornos maiores.",
                Tags = new List<string> { "Reserva", "Renda fixa", "Baixo risco", "Liquidez" },
                InstitutionExamples = new List<string> { "Tesouro Selic", "CDB liquidez diária", "Fundos DI" },
                AttentionPoints = new List<string>
                {
                    "Rentabilidade pode variar.",
                    "Verifique liquidez e impostos.",
                    "Não é promessa de ganho fixo líquido."
                }
            });

            if (balance >= 1000)
            {
                investments.Add(new RecommendationItemDto
                {
                    Name = "CDB com liquidez diária",
                    Type = "Investimento",
                    Risk = "Baixo",
                    MatchScore = 88,
                    MainBenefit = "Buscar rendimento mantendo acesso ao dinheiro",
                    BestFor = "Dinheiro que não precisa ficar parado na conta corrente.",
                    EstimatedCost = "Normalmente atrelado ao CDI, com tributação conforme prazo.",
                    RecommendedUsage = "Comparar percentual do CDI e segurança da instituição.",
                    ActionLabel = "Comparar CDBs",
                    Reason = "Seu saldo permite considerar alternativas simples para rendimento.",
                    Tags = new List<string> { "CDB", "CDI", "Liquidez", "Renda fixa" },
                    InstitutionExamples = new List<string> { "CDBs de bancos digitais", "CDBs de corretoras" },
                    AttentionPoints = new List<string>
                    {
                        "Verifique FGC e emissor.",
                        "Compare liquidez real.",
                        "Rentabilidade líquida depende do prazo."
                    }
                });
            }

            return investments.OrderByDescending(x => x.MatchScore).ToList();
        }

        private bool IsCredit(string value)
        {
            var normalized = Normalize(value);

            return normalized.Contains("credito") ||
                   normalized.Contains("deposito") ||
                   normalized.Contains("entrada") ||
                   normalized.Contains("recebido") ||
                   normalized.Contains("receita");
        }

        private bool IsDebit(string value)
        {
            var normalized = Normalize(value);

            return normalized.Contains("debito") ||
                   normalized.Contains("saque") ||
                   normalized.Contains("saida") ||
                   normalized.Contains("gasto") ||
                   normalized.Contains("despesa");
        }

        private string Normalize(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            return value
                .Trim()
                .ToLower()
                .Replace("é", "e")
                .Replace("ê", "e")
                .Replace("è", "e")
                .Replace("á", "a")
                .Replace("à", "a")
                .Replace("ã", "a")
                .Replace("â", "a")
                .Replace("ç", "c")
                .Replace("í", "i")
                .Replace("ó", "o")
                .Replace("ô", "o")
                .Replace("õ", "o")
                .Replace("ú", "u");
        }
    }
}