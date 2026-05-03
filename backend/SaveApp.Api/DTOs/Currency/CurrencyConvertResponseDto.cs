namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyConvertResponseDto
    {
        public decimal Amount { get; set; }
        public string From { get; set; } = "";
        public string To { get; set; } = "";
        public decimal Rate { get; set; }
        public decimal Result { get; set; }
        public string Message { get; set; } = "";
    }
}