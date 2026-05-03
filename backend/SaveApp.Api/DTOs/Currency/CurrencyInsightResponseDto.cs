namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyInsightResponseDto
    {
        public string Profile { get; set; } = "";
        public List<string> Insights { get; set; } = new();
        public List<string> RecommendedCurrencies { get; set; } = new();
    }
}