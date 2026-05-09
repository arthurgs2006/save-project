namespace SaveApp.Api.DTOs.Balance
{
    public class BalanceStatementResponseDto
    {
        public long Id { get; set; }
        public string TransactionId { get; set; } = "";

        public string Tipo { get; set; } = "";
        public string Descricao { get; set; } = "";

        public decimal Valor { get; set; }

        public string Data { get; set; } = "";
        public string Hora { get; set; } = "";
        public string DataHora { get; set; } = "";

        public DateTime CreatedAt { get; set; }

        public string Status { get; set; } = "concluido";
        public string Metodo { get; set; } = "saldo_manual";
        public string Origem { get; set; } = "";

        public string Category { get; set; } = "";

        public int? GoalId { get; set; }
        public string? GoalName { get; set; }
    }
}