namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyConvertRequestDto
    {
        public decimal Amount { get; set; }
        public string From { get; set; } = "";
        public string To { get; set; } = "";
    }
}