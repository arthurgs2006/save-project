namespace SaveApp.Api.DTOs.Goals
{
    public class GoalResponseDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = "";

        public string Title { get; set; } = "";
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public decimal MonthlyContribution { get; set; }

        public DateTime? Deadline { get; set; }

        public string Category { get; set; } = "";
        public string Priority { get; set; } = "";

        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
        public string Notes { get; set; } = "";

        public string Status { get; set; } = "";

        public decimal ProgressPercentage { get; set; }
        public decimal MissingAmount { get; set; }
        public int? DaysLeft { get; set; }
        public int? MonthsLeft { get; set; }
        public decimal MonthlyNeeded { get; set; }

        public string InsightTitle { get; set; } = "";
        public string InsightMessage { get; set; } = "";
        public string InsightTone { get; set; } = "";

        public bool IsCompleted { get; set; }
        public bool IsExpired { get; set; }

        public List<GoalMovementResponseDto> Deposits { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}