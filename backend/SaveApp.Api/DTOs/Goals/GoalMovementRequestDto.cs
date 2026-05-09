namespace SaveApp.Api.DTOs.Goals
{
    public class GoalMovementRequestDto
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = "";
        public string Type { get; set; } = "add"; // add ou remove
    }
}