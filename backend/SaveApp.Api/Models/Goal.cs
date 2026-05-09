namespace SaveApp.Api.Models
{
    public class Goal
    {
        public int Id { get; set; }
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

        public string Status { get; set; } = "active";

        public List<GoalMovement> Deposits { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}