using SaveApp.Api.DTOs.Balance;
using SaveApp.Api.DTOs.Goals;
using SaveApp.Api.Models;

namespace SaveApp.Api.Services
{
    public class BalanceService
    {
        private static readonly List<BalanceStatement> Statements = new();

        private readonly GoalsService _goalsService;

        public BalanceService(GoalsService goalsService)
        {
            _goalsService = goalsService;
        }

        public BalanceOperationResponseDto Deposit(DepositRequestDto dto)
        {
            var previousBalance = dto.CurrentBalance;
            var newBalance = previousBalance + dto.Amount;

            var statement = CreateStatement(
                userId: dto.UserId,
                amount: dto.Amount,
                tipo: "credito",
                origem: "deposito",
                category: dto.Category,
                description: dto.Description,
                goalId: dto.GoalId
            );

            Statements.Add(statement);

            if (dto.GoalId.HasValue)
            {
                _goalsService.AddMovement(dto.GoalId.Value, new GoalMovementRequestDto
                {
                    Amount = dto.Amount,
                    Type = "add",
                    Description = string.IsNullOrWhiteSpace(dto.Description)
                        ? "Depósito vinculado à meta"
                        : dto.Description.Trim()
                });
            }

            return new BalanceOperationResponseDto
            {
                UserId = dto.UserId,
                PreviousBalance = Math.Round(previousBalance, 2),
                NewBalance = Math.Round(newBalance, 2),
                Statement = MapToResponse(statement),
                Message = dto.GoalId.HasValue
                    ? "Depósito realizado e meta atualizada com sucesso."
                    : "Depósito realizado com sucesso."
            };
        }

        public BalanceOperationResponseDto Withdraw(WithdrawRequestDto dto)
        {
            if (dto.Amount > dto.CurrentBalance)
                throw new Exception("Saldo insuficiente para realizar esse saque.");

            var previousBalance = dto.CurrentBalance;
            var newBalance = previousBalance - dto.Amount;

            var statement = CreateStatement(
                userId: dto.UserId,
                amount: dto.Amount,
                tipo: "debito",
                origem: "saque",
                category: dto.Category,
                description: dto.Description,
                goalId: null
            );

            Statements.Add(statement);

            return new BalanceOperationResponseDto
            {
                UserId = dto.UserId,
                PreviousBalance = Math.Round(previousBalance, 2),
                NewBalance = Math.Round(newBalance, 2),
                Statement = MapToResponse(statement),
                Message = "Saque realizado com sucesso."
            };
        }

        public List<BalanceStatementResponseDto> GetStatementsByUser(string userId)
        {
            return Statements
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapToResponse)
                .ToList();
        }

        private BalanceStatement CreateStatement(
            string userId,
            decimal amount,
            string tipo,
            string origem,
            string category,
            string description,
            int? goalId)
        {
            var now = DateTime.Now;
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            var prefix = origem == "saque" ? "SAQ" : "DEP";

            var data = now.ToString("dd/MM/yyyy");
            var hora = now.ToString("HH:mm:ss");

            return new BalanceStatement
            {
                Id = timestamp,
                UserId = userId,
                TransactionId = $"{prefix}-{timestamp}-{Random.Shared.Next(1000, 9999)}",

                Tipo = tipo,
                Descricao = BuildDescription(origem, category, description),
                Valor = Math.Round(amount, 2),

                Data = data,
                Hora = hora,
                DataHora = $"{data} às {hora}",
                CreatedAt = now,

                Status = "concluido",
                Metodo = "saldo_manual",
                Origem = origem,
                Category = category,

                GoalId = goalId,
                GoalName = null
            };
        }

        private string BuildDescription(string origem, string category, string description)
        {
            if (!string.IsNullOrWhiteSpace(description))
                return description.Trim();

            if (origem == "saque")
                return $"Saque registrado: {category}";

            return $"Depósito registrado: {category}";
        }

        private BalanceStatementResponseDto MapToResponse(BalanceStatement statement)
        {
            return new BalanceStatementResponseDto
            {
                Id = statement.Id,
                TransactionId = statement.TransactionId,

                Tipo = statement.Tipo,
                Descricao = statement.Descricao,
                Valor = statement.Valor,

                Data = statement.Data,
                Hora = statement.Hora,
                DataHora = statement.DataHora,
                CreatedAt = statement.CreatedAt,

                Status = statement.Status,
                Metodo = statement.Metodo,
                Origem = statement.Origem,
                Category = statement.Category,

                GoalId = statement.GoalId,
                GoalName = statement.GoalName
            };
        }
    }
}