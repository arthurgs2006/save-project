namespace SaveApp.Api.DTOs.Investments
{
    public class InvestmentSimulationRequestDto
    {
        public decimal InitialValue { get; set; }
        public decimal MonthlyContribution { get; set; }
        public int Months { get; set; }
        public string Profile { get; set; } = "";
    }
}