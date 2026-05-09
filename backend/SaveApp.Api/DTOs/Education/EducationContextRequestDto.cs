namespace SaveApp.Api.DTOs.Education
{
    public class EducationContextRequestDto
    {
        public decimal? Amount { get; set; }
        public decimal? CurrentBalance { get; set; }

        public decimal? Income { get; set; }
        public decimal? Balance { get; set; }

        public decimal? RecurringCredits { get; set; }
        public decimal? RecurringDebits { get; set; }

        public bool? HasGoals { get; set; }
        public bool? HasEmergencyReserve { get; set; }

        public decimal? GoalTargetAmount { get; set; }
        public decimal? GoalCurrentAmount { get; set; }
        public decimal? MonthlyContribution { get; set; }
    }
}