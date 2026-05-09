namespace SaveApp.Api.DTOs.FinancialHealth
{
    public class FinancialScoreInsightDto
    {
        public string Type { get; set; } = "info";
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";

        public string Icon { get; set; } = "bi-info-circle";
    }
}