namespace SaveApp.Api.DTOs.Recommendations
{
    public class RecommendationRequestDto
    {
        public int UserId { get; set; }
        public decimal Balance { get; set; }
        public decimal Income { get; set; }
        public List<string> Preferences { get; set; } = new();
        public List<TransactionDto> Transactions { get; set; } = new();
    }

    public class TransactionDto
    {
        public string Tipo { get; set; } = "";
        public decimal Valor { get; set; }
        public string Descricao { get; set; } = "";
        public string Data { get; set; } = "";
    }
}