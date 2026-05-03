namespace SaveApp.Api.DTOs.Currency
{
    public class CurrencyQuoteDto
    {
        public string Code { get; set; } = "";
        public string CodeIn { get; set; } = "";
        public string Name { get; set; } = "";
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal VarBid { get; set; }
        public decimal PctChange { get; set; }
        public string CreatedAt { get; set; } = "";
    }
}