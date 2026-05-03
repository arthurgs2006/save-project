namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyHistoryPointDto
    {
        public string Date { get; set; } = "";
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal PctChange { get; set; }
    }
}