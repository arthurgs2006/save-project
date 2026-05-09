using SaveApp.Api.DTOs.Recurring;
using SaveApp.Api.Models;

namespace SaveApp.Api.Services
{
    public class RecurringTransactionsService
    {
        private static readonly List<RecurringTransaction> Recurrings = new();
        private static int _nextId = 1;

        public List<RecurringTransactionResponseDto> GetByUser(int userId)
        {
            return Recurrings
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapToResponse)
                .ToList();
        }

        public List<RecurringTransactionResponseDto> GetByPeriod(RecurringPeriodQueryDto dto)
        {
            var type = Normalize(dto.Type);

            return Recurrings
                .Where(x => x.UserId == dto.UserId)
                .Where(x => string.IsNullOrWhiteSpace(type) || Normalize(x.Type) == type)
                .Where(x => x.IsActive)
                .Where(x => IsValidForPeriod(dto.PeriodStart, dto.PeriodEnd, x.StartDate, x.EndDate))
                .OrderBy(x => x.BillingDay)
                .Select(MapToResponse)
                .ToList();
        }

        public RecurringTransactionResponseDto Create(RecurringTransactionRequestDto dto)
        {
            var recurring = new RecurringTransaction
            {
                Id = _nextId++,
                UserId = dto.UserId,
                Name = dto.Name.Trim(),
                Value = dto.Value,
                Type = Normalize(dto.Type),
                Frequency = Normalize(dto.Frequency),
                BillingDay = dto.BillingDay,
                Category = dto.Category.Trim(),
                Description = dto.Description.Trim(),
                StartDate = dto.StartDate.Date,
                EndDate = dto.EndDate?.Date,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.Now
            };

            Recurrings.Add(recurring);

            return MapToResponse(recurring);
        }

        public RecurringTransactionResponseDto Update(int id, RecurringTransactionRequestDto dto)
        {
            var recurring = Recurrings.FirstOrDefault(x => x.Id == id);

            if (recurring == null)
                throw new Exception("Recorrência não encontrada.");

            recurring.Name = dto.Name.Trim();
            recurring.Value = dto.Value;
            recurring.Type = Normalize(dto.Type);
            recurring.Frequency = Normalize(dto.Frequency);
            recurring.BillingDay = dto.BillingDay;
            recurring.Category = dto.Category.Trim();
            recurring.Description = dto.Description.Trim();
            recurring.StartDate = dto.StartDate.Date;
            recurring.EndDate = dto.EndDate?.Date;
            recurring.IsActive = dto.IsActive;
            recurring.UpdatedAt = DateTime.Now;

            return MapToResponse(recurring);
        }

        public void Delete(int id)
        {
            var recurring = Recurrings.FirstOrDefault(x => x.Id == id);

            if (recurring == null)
                throw new Exception("Recorrência não encontrada.");

            Recurrings.Remove(recurring);
        }

        public decimal GetMonthlyEquivalent(decimal value, string frequency)
        {
            return Normalize(frequency) switch
            {
                "daily" => Math.Round(value * 30, 2),
                "weekly" => Math.Round(value * 4.33m, 2),
                "yearly" => Math.Round(value / 12, 2),
                _ => Math.Round(value, 2)
            };
        }

        public bool IsValidForPeriod(
            DateTime periodStart,
            DateTime periodEnd,
            DateTime startDate,
            DateTime? endDate)
        {
            var startsBeforePeriodEnds = startDate.Date <= periodEnd.Date;
            var endsAfterPeriodStarts = !endDate.HasValue || endDate.Value.Date >= periodStart.Date;

            return startsBeforePeriodEnds && endsAfterPeriodStarts;
        }

        private RecurringTransactionResponseDto MapToResponse(RecurringTransaction recurring)
        {
            var today = DateTime.Today;
            var currentMonthStart = new DateTime(today.Year, today.Month, 1);
            var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);

            var isValidForCurrentMonth = IsValidForPeriod(
                currentMonthStart,
                currentMonthEnd,
                recurring.StartDate,
                recurring.EndDate
            );

            return new RecurringTransactionResponseDto
            {
                Id = recurring.Id,
                UserId = recurring.UserId,
                Name = recurring.Name,
                Value = recurring.Value,
                Type = recurring.Type,
                Frequency = recurring.Frequency,
                BillingDay = recurring.BillingDay,
                Category = recurring.Category,
                Description = recurring.Description,
                StartDate = recurring.StartDate,
                EndDate = recurring.EndDate,
                IsActive = recurring.IsActive,
                IsValidForCurrentMonth = isValidForCurrentMonth,
                MonthlyEquivalent = GetMonthlyEquivalent(recurring.Value, recurring.Frequency),
                PeriodLabel = GetPeriodLabel(recurring.StartDate, recurring.EndDate),
                StatusLabel = GetStatusLabel(recurring)
            };
        }

        private string GetPeriodLabel(DateTime startDate, DateTime? endDate)
        {
            if (!endDate.HasValue)
                return $"Desde {startDate:dd/MM/yyyy}, sem data final.";

            return $"De {startDate:dd/MM/yyyy} até {endDate.Value:dd/MM/yyyy}.";
        }

        private string GetStatusLabel(RecurringTransaction recurring)
        {
            if (!recurring.IsActive)
                return "Inativo";

            var today = DateTime.Today;

            if (today < recurring.StartDate.Date)
                return "Agendado";

            if (recurring.EndDate.HasValue && today > recurring.EndDate.Value.Date)
                return "Encerrado";

            return "Ativo";
        }

        private string Normalize(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? ""
                : value.Trim().ToLower();
        }
    }
}