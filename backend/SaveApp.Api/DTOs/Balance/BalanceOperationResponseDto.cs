namespace SaveApp.Api.DTOs.Balance
{
    public class BalanceOperationResponseDto
    {
        public string UserId { get; set; } = "";

        public decimal PreviousBalance { get; set; }
        public decimal NewBalance { get; set; }

        public BalanceStatementResponseDto Statement { get; set; } = new();

        public string Message { get; set; } = "";
    }
}