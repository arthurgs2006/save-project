namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyInsightRequestDto
    {
        public int UserId { get; set; }
        public decimal Balance { get; set; }
        public decimal Income { get; set; }
        public List<string> Preferences { get; set; } = new();
    }
}