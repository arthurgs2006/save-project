namespace SaveApp.Api.DTOs.Investments
{
    public class InvestmentScenarioComparisonDto
    {
        public string Profile { get; set; } = "";
        public decimal AnnualRate { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal EstimatedProfit { get; set; }
    }
}