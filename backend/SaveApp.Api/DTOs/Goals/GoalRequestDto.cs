namespace SaveApp.Api.DTOs.Goals
{
    public class GoalRequestDto
    {
        public string UserId { get; set; } = "";

        public string Title { get; set; } = "";
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public decimal MonthlyContribution { get; set; }

        public DateTime? Deadline { get; set; }

        public string Category { get; set; } = "reserva";
        public string Priority { get; set; } = "media";

        public string Icon { get; set; } = "bi-bullseye";
        public string Color { get; set; } = "#38bdf8";
        public string Notes { get; set; } = "";
    }
}