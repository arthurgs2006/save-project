namespace SaveApp.Api.DTOs.FinancialHealth
{
    public class FinancialRecommendedActionDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";

        public string Route { get; set; } = "";
        public string LessonSlug { get; set; } = "";

        public string ActionLabel { get; set; } = "";
        public string Priority { get; set; } = "medium";

        public string Icon { get; set; } = "bi-arrow-right";
    }
}