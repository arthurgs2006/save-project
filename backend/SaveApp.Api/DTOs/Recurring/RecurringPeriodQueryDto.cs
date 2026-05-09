namespace SaveApp.Api.DTOs.Recurring
{
    public class RecurringPeriodQueryDto
    {
        public int UserId { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public string Type { get; set; } = "";
        // vazio, credit ou debit
    }
}