namespace SaveApp.Api.DTOs.Recommendations
{
    public class RecommendationItemDto
    {
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
        public string Risk { get; set; } = "";
        public int MatchScore { get; set; }
        public string Reason { get; set; } = "";
        public List<string> Tags { get; set; } = new();
    }
}