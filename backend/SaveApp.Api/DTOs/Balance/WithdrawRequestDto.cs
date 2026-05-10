namespace SaveApp.Api.DTOs.Balance
{
    public class WithdrawRequestDto
    {
        public string UserId { get; set; } = "";
        public decimal Amount { get; set; }
        public decimal CurrentBalance { get; set; }

        public string Category { get; set; } = "Conta";
        public string Description { get; set; } = "";
    }
}