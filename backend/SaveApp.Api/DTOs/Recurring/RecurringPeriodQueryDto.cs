namespace SaveApp.Api.DTOs.Recurring
{
    public class RecurringPeriodQueryDto
    {
        public string UserId { get; set; } = "";
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public string Type { get; set; } = "";
    }
}