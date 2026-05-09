namespace SaveApp.Api.DTOs.Recommendations
{
    public class RecommendationItemDto
    {
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
        public string Risk { get; set; } = "";
        public int MatchScore { get; set; }

        public string Reason { get; set; } = "";
        public string MainBenefit { get; set; } = "";
        public string BestFor { get; set; } = "";
        public string EstimatedCost { get; set; } = "";
        public string RecommendedUsage { get; set; } = "";
        public string ActionLabel { get; set; } = "";

        public List<string> Tags { get; set; } = new();
        public List<string> InstitutionExamples { get; set; } = new();
        public List<string> AttentionPoints { get; set; } = new();
    }
}