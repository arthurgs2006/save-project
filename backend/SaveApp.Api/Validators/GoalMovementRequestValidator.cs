using FluentValidation;
using SaveApp.Api.DTOs.Goals;

namespace SaveApp.Api.Validators
{
    public class GoalMovementRequestValidator : AbstractValidator<GoalMovementRequestDto>
    {
        public GoalMovementRequestValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("O valor deve ser maior que zero.");

            RuleFor(x => x.Type)
                .NotEmpty()
                .WithMessage("O tipo da movimentação é obrigatório.")
                .Must(type =>
                {
                    var value = type.Trim().ToLower();

                    return value == "add" || value == "remove";
                })
                .WithMessage("O tipo deve ser add ou remove.");
        }
    }
}