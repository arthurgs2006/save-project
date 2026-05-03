using SaveApp.Api.DTOs.Investments;

namespace SaveApp.Api.Services
{
    public class InvestmentsService
    {
        public InvestmentSimulationResponseDto Simulate(InvestmentSimulationRequestDto dto)
        {
            var profile = NormalizeProfile(dto.Profile);
            var annualRate = GetAnnualRate(profile);
            var monthlyRate = (decimal)Math.Pow((double)(1 + annualRate / 100), 1.0 / 12.0) - 1;

            decimal balance = dto.InitialValue;
            decimal totalInvested = dto.InitialValue;

            var projection = new List<InvestmentProjectionPointDto>();

            for (int month = 1; month <= dto.Months; month++)
            {
                balance += dto.MonthlyContribution;
                totalInvested += dto.MonthlyContribution;
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

            var finalAmount = Math.Round(balance, 2);
            var estimatedProfit = Math.Round(finalAmount - totalInvested, 2);

            return new InvestmentSimulationResponseDto
            {
                InitialValue = dto.InitialValue,
                MonthlyContribution = dto.MonthlyContribution,
                Months = dto.Months,
                Profile = profile,
                AnnualRate = annualRate,
                MonthlyRate = Math.Round(monthlyRate * 100, 4),
                TotalInvested = Math.Round(totalInvested, 2),
                FinalAmount = finalAmount,
                EstimatedProfit = estimatedProfit,
                Projection = projection,
                Message = GetSimulationMessage(profile, estimatedProfit, dto.Months)
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
                }
            };
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

        private string GetSimulationMessage(string profile, decimal profit, int months)
        {
            var profileText = profile switch
            {
                "conservador" => "com foco em segurança",
                "moderado" => "com equilíbrio entre risco e retorno",
                "agressivo" => "com maior potencial de crescimento",
                _ => "com base no perfil informado"
            };

            return $"Simulação calculada {profileText}, considerando juros compostos por {months} meses e rendimento estimado de R$ {profit:N2}.";
        }

        private string NormalizeProfile(string profile)
        {
            if (string.IsNullOrWhiteSpace(profile))
                return "moderado";

            return profile.Trim().ToLower();
        }
    }
}