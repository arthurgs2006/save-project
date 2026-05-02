using SaveApp.Api.DTOs.Investments;
using SaveApp.Api.Models;
    
namespace SaveApp.Api.Services
{
    public class InvestmentsService
    {
        public InvestmentSimulationResponseDto Simulate(InvestmentSimulationRequestDto dto)
        {
            var annualRate = GetAnnualRate(dto.Profile);
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
                Profile = NormalizeProfile(dto.Profile),
                AnnualRate = annualRate,
                MonthlyRate = Math.Round(monthlyRate * 100, 4),
                TotalInvested = Math.Round(totalInvested, 2),
                FinalAmount = finalAmount,
                EstimatedProfit = estimatedProfit,
                Projection = projection,
                Message = "Simulação calculada com juros compostos mensais."
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
                        Description = "Perfil com menor risco e crescimento mais estável."
                    },
                    new
                    {
                        Id = "moderado",
                        Name = "Moderado",
                        AnnualRate = 13.5,
                        Description = "Perfil equilibrado entre segurança e rentabilidade."
                    },
                    new
                    {
                        Id = "agressivo",
                        Name = "Agressivo",
                        AnnualRate = 18.0,
                        Description = "Perfil com maior risco e maior potencial de retorno."
                    }
                }
            };
        }

        private decimal GetAnnualRate(string profile)
        {
            return NormalizeProfile(profile) switch
            {
                "conservador" => 10.5m,
                "moderado" => 13.5m,
                "agressivo" => 18.0m,
                _ => 13.5m
            };
        }

        private string NormalizeProfile(string profile)
        {
            return profile.Trim().ToLower();
        }
    }
}