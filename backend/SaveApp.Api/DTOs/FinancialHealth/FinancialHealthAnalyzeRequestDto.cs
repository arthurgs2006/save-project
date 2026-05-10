namespace SaveApp.Api.DTOs.FinancialHealth
{
    public class FinancialHealthAnalyzeRequestDto
    {
        public string UserId { get; set; } = "";

        public decimal Balance { get; set; }
        public decimal MonthlyIncome { get; set; }

        public decimal MonthlyRecurringCredits { get; set; }
        public decimal MonthlyRecurringDebits { get; set; }

        public decimal MonthlyCredits { get; set; }
        public decimal MonthlyDebits { get; set; }

        public int TransactionsCount { get; set; }

        public int GoalsCount { get; set; }
        public int ActiveGoalsCount { get; set; }
        public int CompletedGoalsCount { get; set; }

        public decimal GoalsTargetTotal { get; set; }
        public decimal GoalsCurrentTotal { get; set; }

        public bool HasEmergencyReserve { get; set; }

        public int LessonsOpened { get; set; }
        public int LessonsCompleted { get; set; }
    }
}