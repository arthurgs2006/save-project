using SaveApp.Api.DTOs.Goals;
using SaveApp.Api.Models;

namespace SaveApp.Api.Services
{
    public class GoalsService
    {
        private static readonly List<Goal> Goals = new();
        private static int _nextGoalId = 1;
        private static int _nextMovementId = 1;

        public List<GoalResponseDto> GetByUser(string userId, string status = "active")
        {
            var query = Goals
                .Where(x => x.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && Normalize(status) != "all")
            {
                query = query.Where(x => Normalize(x.Status) == Normalize(status));
            }

            return query
                .OrderByDescending(x => x.UpdatedAt)
                .Select(MapToResponse)
                .ToList();
        }

        public GoalResponseDto GetById(int id)
        {
            var goal = Goals.FirstOrDefault(x => x.Id == id);

            if (goal == null)
                throw new Exception("Meta não encontrada.");

            return MapToResponse(goal);
        }

        public GoalResponseDto Create(GoalRequestDto dto)
        {
            var goal = new Goal
            {
                Id = _nextGoalId++,
                UserId = dto.UserId,
                Title = dto.Title.Trim(),
                TargetAmount = dto.TargetAmount,
                CurrentAmount = dto.CurrentAmount,
                MonthlyContribution = dto.MonthlyContribution,
                Deadline = dto.Deadline?.Date,
                Category = Normalize(dto.Category),
                Priority = Normalize(dto.Priority),
                Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "bi-bullseye" : dto.Icon.Trim(),
                Color = string.IsNullOrWhiteSpace(dto.Color) ? "#38bdf8" : dto.Color.Trim(),
                Notes = dto.Notes.Trim(),
                Status = dto.CurrentAmount >= dto.TargetAmount ? "completed" : "active",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            Goals.Add(goal);

            return MapToResponse(goal);
        }

        public GoalResponseDto Update(int id, GoalRequestDto dto)
        {
            var goal = Goals.FirstOrDefault(x => x.Id == id);

            if (goal == null)
                throw new Exception("Meta não encontrada.");

            goal.UserId = dto.UserId;
            goal.Title = dto.Title.Trim();
            goal.TargetAmount = dto.TargetAmount;
            goal.CurrentAmount = dto.CurrentAmount;
            goal.MonthlyContribution = dto.MonthlyContribution;
            goal.Deadline = dto.Deadline?.Date;
            goal.Category = Normalize(dto.Category);
            goal.Priority = Normalize(dto.Priority);
            goal.Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "bi-bullseye" : dto.Icon.Trim();
            goal.Color = string.IsNullOrWhiteSpace(dto.Color) ? "#38bdf8" : dto.Color.Trim();
            goal.Notes = dto.Notes.Trim();
            goal.Status = goal.CurrentAmount >= goal.TargetAmount ? "completed" : "active";
            goal.UpdatedAt = DateTime.Now;

            return MapToResponse(goal);
        }

        public void Delete(int id)
        {
            var goal = Goals.FirstOrDefault(x => x.Id == id);

            if (goal == null)
                throw new Exception("Meta não encontrada.");

            Goals.Remove(goal);
        }

        public GoalResponseDto AddMovement(int id, GoalMovementRequestDto dto)
        {
            var goal = Goals.FirstOrDefault(x => x.Id == id);

            if (goal == null)
                throw new Exception("Meta não encontrada.");

            var type = Normalize(dto.Type);
            var amount = dto.Amount;

            if (type != "add" && type != "remove")
                throw new Exception("O tipo da movimentação deve ser add ou remove.");

            if (amount <= 0)
                throw new Exception("O valor da movimentação deve ser maior que zero.");

            if (type == "remove" && amount > goal.CurrentAmount)
                throw new Exception("Não é possível remover um valor maior que o valor atual da meta.");

            if (type == "add")
                goal.CurrentAmount += amount;

            if (type == "remove")
                goal.CurrentAmount -= amount;

            goal.Status = goal.CurrentAmount >= goal.TargetAmount ? "completed" : "active";

            goal.Deposits.Add(new GoalMovement
            {
                Id = _nextMovementId++,
                Amount = amount,
                Description = dto.Description.Trim(),
                Type = type,
                Date = DateTime.Now
            });

            goal.UpdatedAt = DateTime.Now;

            return MapToResponse(goal);
        }

        public GoalResponseDto ToggleStatus(int id)
        {
            var goal = Goals.FirstOrDefault(x => x.Id == id);

            if (goal == null)
                throw new Exception("Meta não encontrada.");

            goal.Status = Normalize(goal.Status) == "completed" ? "active" : "completed";
            goal.UpdatedAt = DateTime.Now;

            return MapToResponse(goal);
        }

        private GoalResponseDto MapToResponse(Goal goal)
        {
            var progress = CalculateProgress(goal);
            var missingAmount = Math.Max(goal.TargetAmount - goal.CurrentAmount, 0);
            var daysLeft = GetDaysLeft(goal.Deadline);
            var monthsLeft = GetMonthsLeft(goal.Deadline);

            var monthlyNeeded = monthsLeft.HasValue && missingAmount > 0
                ? Math.Round(missingAmount / monthsLeft.Value, 2)
                : 0;

            var insight = GetGoalInsight(
                goal,
                progress,
                missingAmount,
                daysLeft,
                monthsLeft,
                monthlyNeeded
            );

            return new GoalResponseDto
            {
                Id = goal.Id,
                UserId = goal.UserId,

                Title = goal.Title,
                TargetAmount = goal.TargetAmount,
                CurrentAmount = goal.CurrentAmount,
                MonthlyContribution = goal.MonthlyContribution,

                Deadline = goal.Deadline,

                Category = goal.Category,
                Priority = goal.Priority,

                Icon = goal.Icon,
                Color = goal.Color,
                Notes = goal.Notes,

                Status = goal.Status,

                ProgressPercentage = progress,
                MissingAmount = missingAmount,
                DaysLeft = daysLeft,
                MonthsLeft = monthsLeft,
                MonthlyNeeded = monthlyNeeded,

                InsightTitle = insight.Title,
                InsightMessage = insight.Message,
                InsightTone = insight.Tone,

                IsCompleted = Normalize(goal.Status) == "completed" || progress >= 100,
                IsExpired = daysLeft.HasValue && daysLeft.Value < 0,

                Deposits = goal.Deposits
                    .OrderByDescending(x => x.Date)
                    .Select(x => new GoalMovementResponseDto
                    {
                        Id = x.Id,
                        Amount = x.Amount,
                        Description = x.Description,
                        Type = x.Type,
                        Date = x.Date
                    })
                    .ToList(),

                CreatedAt = goal.CreatedAt,
                UpdatedAt = goal.UpdatedAt
            };
        }

        private decimal CalculateProgress(Goal goal)
        {
            if (goal.TargetAmount <= 0)
                return 0;

            var progress = (goal.CurrentAmount / goal.TargetAmount) * 100;

            return Math.Round(Math.Min(progress, 100), 2);
        }

        private int? GetDaysLeft(DateTime? deadline)
        {
            if (!deadline.HasValue)
                return null;

            var today = DateTime.Today;
            var endDate = deadline.Value.Date;

            return (int)Math.Ceiling((endDate - today).TotalDays);
        }

        private int? GetMonthsLeft(DateTime? deadline)
        {
            var daysLeft = GetDaysLeft(deadline);

            if (!daysLeft.HasValue)
                return null;

            if (daysLeft.Value <= 0)
                return 1;

            return Math.Max((int)Math.Ceiling(daysLeft.Value / 30m), 1);
        }

        private GoalInsight GetGoalInsight(
            Goal goal,
            decimal progress,
            decimal missingAmount,
            int? daysLeft,
            int? monthsLeft,
            decimal monthlyNeeded)
        {
            if (Normalize(goal.Status) == "completed" || progress >= 100)
            {
                return new GoalInsight
                {
                    Title = "Meta alcançada",
                    Message = "Essa meta já chegou ao valor planejado. Você pode mantê-la concluída ou aumentar o objetivo.",
                    Tone = "success"
                };
            }

            if (daysLeft.HasValue && daysLeft.Value < 0)
            {
                return new GoalInsight
                {
                    Title = "Prazo vencido",
                    Message = $"Ainda faltam R$ {missingAmount:N2}. Considere ajustar o prazo ou reduzir o valor alvo.",
                    Tone = "danger"
                };
            }

            if (monthsLeft.HasValue && monthlyNeeded > 0 && goal.MonthlyContribution >= monthlyNeeded)
            {
                return new GoalInsight
                {
                    Title = "Você está no caminho certo",
                    Message = $"Mantendo R$ {goal.MonthlyContribution:N2} por mês, a meta tende a ser alcançada dentro do prazo.",
                    Tone = "success"
                };
            }

            if (monthsLeft.HasValue && monthlyNeeded > 0)
            {
                return new GoalInsight
                {
                    Title = "Aporte recomendado",
                    Message = $"Para alcançar no prazo, seria ideal guardar cerca de R$ {monthlyNeeded:N2} por mês.",
                    Tone = "warning"
                };
            }

            if (progress >= 50)
            {
                return new GoalInsight
                {
                    Title = "Boa evolução",
                    Message = "Você já passou da metade da meta. Continue acompanhando os aportes para manter o ritmo.",
                    Tone = "info"
                };
            }

            return new GoalInsight
            {
                Title = "Meta em andamento",
                Message = "Defina um prazo e um aporte mensal para receber uma previsão mais precisa.",
                Tone = "info"
            };
        }

        private string Normalize(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            return value
                .Trim()
                .ToLower()
                .Replace("é", "e")
                .Replace("ê", "e")
                .Replace("è", "e")
                .Replace("á", "a")
                .Replace("à", "a")
                .Replace("ã", "a")
                .Replace("â", "a")
                .Replace("ç", "c")
                .Replace("í", "i")
                .Replace("ó", "o")
                .Replace("ô", "o")
                .Replace("õ", "o")
                .Replace("ú", "u");
        }

        private class GoalInsight
        {
            public string Title { get; set; } = "";
            public string Message { get; set; } = "";
            public string Tone { get; set; } = "";
        }
    }
}