namespace SaveApp.Api.DTOs.Investments
{
    public class InvestmentProjectionPointDto
    {
        public int Month { get; set; }
        public decimal Invested { get; set; }
        public decimal Balance { get; set; }
        public decimal Profit { get; set; }
    }
}