namespace SaveApp.Api.DTOs.Recurring
{
    public class RecurringTransactionResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string Name { get; set; } = "";
        public decimal Value { get; set; }

        public string Type { get; set; } = "";
        public string Frequency { get; set; } = "";

        public int BillingDay { get; set; }

        public string Category { get; set; } = "";
        public string Description { get; set; } = "";

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsValidForCurrentMonth { get; set; }
        public decimal MonthlyEquivalent { get; set; }

        public string PeriodLabel { get; set; } = "";
        public string StatusLabel { get; set; } = "";
    }
}