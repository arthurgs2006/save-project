using FluentValidation;
using SaveApp.Api.DTOs.Recurring;

namespace SaveApp.Api.Validators
{
    public class RecurringTransactionValidator : AbstractValidator<RecurringTransactionRequestDto>
    {
        public RecurringTransactionValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("O usuário é obrigatório.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("O nome da recorrência é obrigatório.")
                .MaximumLength(80)
                .WithMessage("O nome deve ter no máximo 80 caracteres.");

            RuleFor(x => x.Value)
                .GreaterThan(0)
                .WithMessage("O valor deve ser maior que zero.");

            RuleFor(x => x.Type)
                .NotEmpty()
                .WithMessage("O tipo é obrigatório.")
                .Must(type =>
                {
                    var value = Normalize(type);
                    return value == "credit" || value == "debit";
                })
                .WithMessage("O tipo deve ser credit ou debit.");

            RuleFor(x => x.Frequency)
                .NotEmpty()
                .WithMessage("A frequência é obrigatória.")
                .Must(frequency =>
                {
                    var value = Normalize(frequency);

                    return value == "daily" ||
                           value == "weekly" ||
                           value == "monthly" ||
                           value == "yearly";
                })
                .WithMessage("A frequência deve ser daily, weekly, monthly ou yearly.");

            RuleFor(x => x.BillingDay)
                .InclusiveBetween(1, 31)
                .WithMessage("O dia da recorrência deve estar entre 1 e 31.");

            RuleFor(x => x.StartDate)
                .NotEmpty()
                .WithMessage("A data inicial é obrigatória.");

            RuleFor(x => x.EndDate)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .When(x => x.EndDate.HasValue)
                .WithMessage("A data final não pode ser menor que a data inicial.");
        }

        private string Normalize(string value)
        {
            return value.Trim().ToLower();
        }
    }
}