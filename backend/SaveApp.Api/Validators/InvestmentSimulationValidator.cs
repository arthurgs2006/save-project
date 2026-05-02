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
        }
    }
}