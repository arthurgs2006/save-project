using FluentValidation;
using SaveApp.Api.DTOs.Goals;

namespace SaveApp.Api.Validators
{
    public class GoalRequestValidator : AbstractValidator<GoalRequestDto>
    {
        public GoalRequestValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("O usuário é obrigatório.");

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("O título da meta é obrigatório.")
                .MaximumLength(80)
                .WithMessage("O título deve ter no máximo 80 caracteres.");

            RuleFor(x => x.TargetAmount)
                .GreaterThan(0)
                .WithMessage("O valor alvo deve ser maior que zero.");

            RuleFor(x => x.CurrentAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O valor atual não pode ser negativo.");

            RuleFor(x => x.MonthlyContribution)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O aporte mensal não pode ser negativo.");

            RuleFor(x => x.Category)
                .NotEmpty()
                .WithMessage("A categoria é obrigatória.");

            RuleFor(x => x.Priority)
                .Must(priority =>
                {
                    var value = priority.Trim().ToLower();

                    return value == "baixa" ||
                           value == "media" ||
                           value == "alta";
                })
                .WithMessage("A prioridade deve ser baixa, media ou alta.");

            RuleFor(x => x.Deadline)
                .GreaterThanOrEqualTo(DateTime.Today)
                .When(x => x.Deadline.HasValue)
                .WithMessage("O prazo não pode ser uma data passada.");
        }
    }
}