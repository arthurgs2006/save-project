namespace SaveApp.Api.DTOs.Investments
{
    public class InvestmentSimulationResponseDto
    {
        public decimal InitialValue { get; set; }
        public decimal MonthlyContribution { get; set; }
        public int Months { get; set; }
        public string Profile { get; set; } = "";
        public decimal AnnualRate { get; set; }
        public decimal MonthlyRate { get; set; }
        public decimal TotalInvested { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal EstimatedProfit { get; set; }
        public List<InvestmentProjectionPointDto> Projection { get; set; } = new();
        public string Message { get; set; } = "";
    }
}