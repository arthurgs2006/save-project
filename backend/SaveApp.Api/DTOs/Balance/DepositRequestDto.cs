namespace SaveApp.Api.DTOs.Balance
{
    public class DepositRequestDto
    {
        public string UserId { get; set; } = "";
        public decimal Amount { get; set; }
        public decimal CurrentBalance { get; set; }

        public string Category { get; set; } = "Conta";
        public string Description { get; set; } = "";

        public int? GoalId { get; set; }
    }
}