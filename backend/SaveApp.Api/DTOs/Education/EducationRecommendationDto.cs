namespace SaveApp.Api.DTOs.Education
{
    public class EducationRecommendationDto
    {
        public string UserId { get; set; } = "";
        public string Context { get; set; } = "";

        public string RiskLevel { get; set; } = "info";
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";

        public string RecommendedLessonSlug { get; set; } = "";
        public string RecommendedLessonTitle { get; set; } = "";
        public string ActionLabel { get; set; } = "";

        public string Icon { get; set; } = "bi-journal-text";
        public string Color { get; set; } = "#38bdf8";

        public List<string> Highlights { get; set; } = new();
    }
}