namespace SaveApp.Api.DTOs.Education
{
    public class EducationLessonDto
    {
        public int Id { get; set; }

        public string Slug { get; set; } = "";
        public string Title { get; set; } = "";
        public string Category { get; set; } = "";
        public string Level { get; set; } = "";
        public string ReadingTime { get; set; } = "";

        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";

        public string Summary { get; set; } = "";
        public string Description { get; set; } = "";
        public string PracticalUse { get; set; } = "";

        public List<string> Tags { get; set; } = new();
    }
}