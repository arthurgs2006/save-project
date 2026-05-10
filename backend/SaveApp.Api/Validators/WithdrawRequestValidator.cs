using FluentValidation;
using SaveApp.Api.DTOs.Balance;

namespace SaveApp.Api.Validators
{
    public class WithdrawRequestValidator : AbstractValidator<WithdrawRequestDto>
    {
        public WithdrawRequestValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("O usuário é obrigatório.");

            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("O valor do saque deve ser maior que zero.");

            RuleFor(x => x.CurrentBalance)
                .GreaterThanOrEqualTo(0)
                .WithMessage("O saldo atual não pode ser negativo.");

            RuleFor(x => x)
                .Must(x => x.Amount <= x.CurrentBalance)
                .WithMessage("Saldo insuficiente para realizar esse saque.");

            RuleFor(x => x.Category)
                .NotEmpty()
                .WithMessage("A categoria é obrigatória.");
        }
    }
}