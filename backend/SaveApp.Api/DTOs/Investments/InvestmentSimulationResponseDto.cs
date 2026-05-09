namespace SaveApp.Api.DTOs.Investments
{
    public class InvestmentSimulationResponseDto
    {
        public decimal InitialValue { get; set; }
        public decimal MonthlyContribution { get; set; }
        public int Months { get; set; }

        public string Profile { get; set; } = "";
        public string GoalType { get; set; } = "";

        public decimal AnnualRate { get; set; }
        public decimal MonthlyRate { get; set; }

        public decimal TotalInvested { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal EstimatedProfit { get; set; }

        public decimal? TargetAmount { get; set; }
        public bool? GoalReached { get; set; }
        public decimal? MissingAmount { get; set; }
        public decimal? GoalProgressPercentage { get; set; }

        public string RecommendationTitle { get; set; } = "";
        public string RecommendationMessage { get; set; } = "";
        public string RiskMessage { get; set; } = "";

        public List<InvestmentProjectionPointDto> Projection { get; set; } = new();
        public List<InvestmentScenarioComparisonDto> Scenarios { get; set; } = new();

        public string Message { get; set; } = "";
    }
}