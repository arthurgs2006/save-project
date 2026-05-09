namespace SaveApp.Api.DTOs.FinancialHealth
{
    public class FinancialScoreResponseDto
    {
        public string UserId { get; set; } = "";

        public int Score { get; set; }
        public string Level { get; set; } = "";
        public string Summary { get; set; } = "";

        public List<FinancialScorePillarDto> Pillars { get; set; } = new();

        public List<FinancialScoreInsightDto> Strengths { get; set; } = new();
        public List<FinancialScoreInsightDto> Warnings { get; set; } = new();

        public List<FinancialRecommendedActionDto> RecommendedActions { get; set; } = new();

        public string MainLessonSlug { get; set; } = "";
        public string MainLessonTitle { get; set; } = "";
    }
}