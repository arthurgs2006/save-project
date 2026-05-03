namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyQuotesResponseDto
    {
        public List<CurrencyQuoteDto> Quotes { get; set; } = new();
        public string Message { get; set; } = "";
    }
}