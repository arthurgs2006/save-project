namespace SaveApp.Api.DTOs.Goals
{
    public class GoalMovementResponseDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = "";
        public string Type { get; set; } = "";
        public DateTime Date { get; set; }
    }
}