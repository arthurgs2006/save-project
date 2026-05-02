namespace SaveApp.Api.DTOs.Benefits
{
    public class BenefitsResponseDto
    {
        public int UserId { get; set; }
        public List<string> Benefits { get; set; } = new();
        public string Message { get; set; } = "";
    }
}