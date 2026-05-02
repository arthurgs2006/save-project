namespace SaveApp.Api.DTOs.Recommendations
{
    public class RecommendationResponseDto
    {
        public int UserId { get; set; }
        public string FinancialProfile { get; set; } = "";
        public string Summary { get; set; } = "";

        public List<string> Insights { get; set; } = new();

        public List<RecommendationItemDto> Cards { get; set; } = new();
        public List<RecommendationItemDto> Banks { get; set; } = new();
        public List<RecommendationItemDto> Investments { get; set; } = new();
    }
}