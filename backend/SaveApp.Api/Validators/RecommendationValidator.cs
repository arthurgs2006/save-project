using FluentValidation;
using SaveApp.Api.DTOs.Recommendations;

namespace SaveApp.Api.Validators
{
    public class RecommendationValidator : AbstractValidator<RecommendationRequestDto>
    {
        public RecommendationValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("O usuário é obrigatório.");

            RuleFor(x => x.Balance)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O saldo não pode ser negativo.");

            RuleFor(x => x.Income)
                .GreaterThanOrEqualTo(0)
                .WithMessage("A receita não pode ser negativa.");
        }
    }
}