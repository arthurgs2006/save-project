namespace SaveApp.Api.DTOs.FinancialHealth
{
    public class FinancialScorePillarDto
    {
        public string Name { get; set; } = "";
        public int Score { get; set; }

        public string Status { get; set; } = "";
        public string Description { get; set; } = "";

        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
    }
}