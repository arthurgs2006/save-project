namespace SaveApp.Api.Models
{
    public class RecurringTransaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string Name { get; set; } = "";
        public decimal Value { get; set; }

        public string Type { get; set; } = "";
        // credit ou debit

        public string Frequency { get; set; } = "monthly";
        // daily, weekly, monthly, yearly

        public int BillingDay { get; set; }

        public string Category { get; set; } = "";
        public string Description { get; set; } = "";

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}