using SaveApp.Api.DTOs.Investments;

namespace SaveApp.Api.Services
{
    public class InvestmentsService
    {
        public InvestmentSimulationResponseDto Simulate(InvestmentSimulationRequestDto dto)
        {
            var profile = Normalize(dto.Profile, "moderado");
            var goalType = Normalize(dto.GoalType, "crescimento");

            var annualRate = GetAnnualRate(profile);
            var simulation = CalculateSimulation(dto.InitialValue, dto.MonthlyContribution, dto.Months, annualRate);

            var finalAmount = Math.Round(simulation.FinalAmount, 2);
            var totalInvested = Math.Round(simulation.TotalInvested, 2);
            var estimatedProfit = Math.Round(finalAmount - totalInvested, 2);

            bool? goalReached = null;
            decimal? missingAmount = null;
            decimal? goalProgressPercentage = null;

            if (dto.TargetAmount.HasValue)
            {
                goalReached = finalAmount >= dto.TargetAmount.Value;
                missingAmount = Math.Max(dto.TargetAmount.Value - finalAmount, 0);
                goalProgressPercentage = Math.Round((finalAmount / dto.TargetAmount.Value) * 100, 2);
            }

            return new InvestmentSimulationResponseDto
            {
                InitialValue = dto.InitialValue,
                MonthlyContribution = dto.MonthlyContribution,
                Months = dto.Months,
                Profile = profile,
                GoalType = goalType,

                AnnualRate = annualRate,
                MonthlyRate = Math.Round(simulation.MonthlyRate * 100, 4),

                TotalInvested = totalInvested,
                FinalAmount = finalAmount,
                EstimatedProfit = estimatedProfit,

                TargetAmount = dto.TargetAmount,
                GoalReached = goalReached,
                MissingAmount = missingAmount,
                GoalProgressPercentage = goalProgressPercentage,

                Projection = simulation.Projection,
                Scenarios = BuildScenarios(dto),

                RecommendationTitle = GetRecommendationTitle(goalType),
                RecommendationMessage = GetRecommendationMessage(goalType, profile, dto.TargetAmount, finalAmount, missingAmount, dto.Months),
                RiskMessage = GetRiskMessage(profile),

                Message = GetSimulationMessage(profile, goalType, estimatedProfit, dto.Months)
            };
        }

        public object GetOptions()
        {
            return new
            {
                Profiles = new[]
                {
                    new
                    {
                        Id = "conservador",
                        Name = "Conservador",
                        AnnualRate = 10.5,
                        Risk = "Baixo",
                        Description = "Foco em segurança, reserva de emergência e baixa oscilação."
                    },
                    new
                    {
                        Id = "moderado",
                        Name = "Moderado",
                        AnnualRate = 13.5,
                        Risk = "Médio",
                        Description = "Equilíbrio entre segurança e crescimento gradual do patrimônio."
                    },
                    new
                    {
                        Id = "agressivo",
                        Name = "Agressivo",
                        AnnualRate = 18.0,
                        Risk = "Alto",
                        Description = "Maior potencial de retorno, aceitando mais oscilações."
                    }
                },
                Goals = new[]
                {
                    new
                    {
                        Id = "reserva",
                        Name = "Reserva de emergência",
                        Description = "Ideal para guardar dinheiro com segurança e liquidez."
                    },
                    new
                    {
                        Id = "viagem",
                        Name = "Viagem",
                        Description = "Objetivo de curto ou médio prazo, com foco em previsibilidade."
                    },
                    new
                    {
                        Id = "compra",
                        Name = "Compra planejada",
                        Description = "Para juntar dinheiro para um bem específico."
                    },
                    new
                    {
                        Id = "aposentadoria",
                        Name = "Aposentadoria",
                        Description = "Objetivo de longo prazo, aproveitando juros compostos."
                    },
                    new
                    {
                        Id = "crescimento",
                        Name = "Crescimento patrimonial",
                        Description = "Foco em aumentar o patrimônio ao longo do tempo."
                    }
                }
            };
        }

        private InvestmentCalculationResult CalculateSimulation(
            decimal initialValue,
            decimal monthlyContribution,
            int months,
            decimal annualRate)
        {
            var monthlyRate = (decimal)Math.Pow((double)(1 + annualRate / 100), 1.0 / 12.0) - 1;

            decimal balance = initialValue;
            decimal totalInvested = initialValue;

            var projection = new List<InvestmentProjectionPointDto>();

            for (int month = 1; month <= months; month++)
            {
                balance += monthlyContribution;
                totalInvested += monthlyContribution;
                balance *= 1 + monthlyRate;

                var profit = balance - totalInvested;

                projection.Add(new InvestmentProjectionPointDto
                {
                    Month = month,
                    Invested = Math.Round(totalInvested, 2),
                    Balance = Math.Round(balance, 2),
                    Profit = Math.Round(profit, 2)
                });
            }

            return new InvestmentCalculationResult
            {
                MonthlyRate = monthlyRate,
                TotalInvested = totalInvested,
                FinalAmount = balance,
                Projection = projection
            };
        }

        private List<InvestmentScenarioComparisonDto> BuildScenarios(InvestmentSimulationRequestDto dto)
        {
            var profiles = new[] { "conservador", "moderado", "agressivo" };
            var scenarios = new List<InvestmentScenarioComparisonDto>();

            foreach (var profile in profiles)
            {
                var annualRate = GetAnnualRate(profile);
                var simulation = CalculateSimulation(dto.InitialValue, dto.MonthlyContribution, dto.Months, annualRate);

                var finalAmount = Math.Round(simulation.FinalAmount, 2);
                var totalInvested = Math.Round(simulation.TotalInvested, 2);

                scenarios.Add(new InvestmentScenarioComparisonDto
                {
                    Profile = profile,
                    AnnualRate = annualRate,
                    FinalAmount = finalAmount,
                    EstimatedProfit = Math.Round(finalAmount - totalInvested, 2)
                });
            }

            return scenarios;
        }

        private decimal GetAnnualRate(string profile)
        {
            return profile switch
            {
                "conservador" => 10.5m,
                "moderado" => 13.5m,
                "agressivo" => 18.0m,
                _ => 13.5m
            };
        }

        private string GetRecommendationTitle(string goalType)
        {
            return goalType switch
            {
                "reserva" => "Priorize segurança e liquidez",
                "viagem" => "Planeje com previsibilidade",
                "compra" => "Mantenha constância nos aportes",
                "aposentadoria" => "Use o tempo a favor dos juros compostos",
                "crescimento" => "Busque equilíbrio entre retorno e risco",
                _ => "Simulação personalizada"
            };
        }

        private string GetRecommendationMessage(
            string goalType,
            string profile,
            decimal? targetAmount,
            decimal finalAmount,
            decimal? missingAmount,
            int months)
        {
            var baseMessage = goalType switch
            {
                "reserva" => "Como seu objetivo é formar uma reserva, investimentos mais seguros e com facilidade de resgate fazem mais sentido.",
                "viagem" => "Como seu objetivo tem prazo definido, é melhor evitar grandes oscilações e manter uma estratégia previsível.",
                "compra" => "Para uma compra planejada, a consistência dos aportes costuma ser mais importante do que buscar alto risco.",
                "aposentadoria" => "Para aposentadoria, o prazo longo aumenta o impacto dos juros compostos sobre o patrimônio.",
                "crescimento" => "Para crescimento patrimonial, o ideal é equilibrar potencial de retorno com controle de risco.",
                _ => "A simulação foi calculada com base nos dados informados."
            };

            if (!targetAmount.HasValue)
                return baseMessage;

            if (finalAmount >= targetAmount.Value)
            {
                return $"{baseMessage} Com os valores informados, a meta de R$ {targetAmount.Value:N2} pode ser alcançada em {months} meses.";
            }

            return $"{baseMessage} Com os valores informados, ainda faltariam aproximadamente R$ {missingAmount:N2} para alcançar a meta.";
        }

        private string GetRiskMessage(string profile)
        {
            return profile switch
            {
                "conservador" => "O perfil conservador reduz oscilações e prioriza segurança, mas tende a ter menor potencial de retorno.",
                "moderado" => "O perfil moderado busca equilíbrio entre segurança e crescimento, aceitando alguma oscilação.",
                "agressivo" => "O perfil agressivo busca maior retorno, mas pode envolver mais risco e variação nos resultados.",
                _ => "O risco foi calculado com base no perfil informado."
            };
        }

        private string GetSimulationMessage(string profile, string goalType, decimal profit, int months)
        {
            return $"Simulação para objetivo de {goalType}, com perfil {profile}, considerando juros compostos por {months} meses e rendimento estimado de R$ {profit:N2}.";
        }

        private string Normalize(string value, string defaultValue)
        {
            if (string.IsNullOrWhiteSpace(value))
                return defaultValue;

            return value.Trim().ToLower();
        }

        private class InvestmentCalculationResult
        {
            public decimal MonthlyRate { get; set; }
            public decimal TotalInvested { get; set; }
            public decimal FinalAmount { get; set; }
            public List<InvestmentProjectionPointDto> Projection { get; set; } = new();
        }
    }
}