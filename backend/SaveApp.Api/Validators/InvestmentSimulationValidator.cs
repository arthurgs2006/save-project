using FluentValidation;
using SaveApp.Api.DTOs.Investments;

namespace SaveApp.Api.Validators
{
    public class InvestmentSimulationValidator : AbstractValidator<InvestmentSimulationRequestDto>
    {
        public InvestmentSimulationValidator()
        {
            RuleFor(x => x.InitialValue)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O valor inicial não pode ser negativo.");

            RuleFor(x => x.MonthlyContribution)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O aporte mensal não pode ser negativo.");

            RuleFor(x => x.Months)
                .GreaterThanOrEqualTo(1)
                .WithMessage("O período deve ser de pelo menos 1 mês.")
                .LessThanOrEqualTo(600)
                .WithMessage("O período máximo permitido é de 600 meses.");

            RuleFor(x => x.Profile)
                .NotEmpty()
                .WithMessage("O perfil de investimento é obrigatório.")
                .Must(profile =>
                {
                    var value = profile.Trim().ToLower();

                    return value == "conservador" ||
                           value == "moderado" ||
                           value == "agressivo";
                })
                .WithMessage("O perfil deve ser conservador, moderado ou agressivo.");

            RuleFor(x => x.GoalType)
                .NotEmpty()
                .WithMessage("O objetivo do investimento é obrigatório.")
                .Must(goal =>
                {
                    var value = goal.Trim().ToLower();

                    return value == "reserva" ||
                           value == "viagem" ||
                           value == "compra" ||
                           value == "aposentadoria" ||
                           value == "crescimento";
                })
                .WithMessage("O objetivo deve ser reserva, viagem, compra, aposentadoria ou crescimento.");

            RuleFor(x => x.TargetAmount)
                .GreaterThan(0)
                .When(x => x.TargetAmount.HasValue)
                .WithMessage("A meta financeira deve ser maior que zero.");
        }
    }
}