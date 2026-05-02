using FluentValidation;
using SaveApp.Api.DTOs.Benefits;

namespace SaveApp.Api.Validators
{
    public class BenefitsValidator : AbstractValidator<BenefitsRequestDto>
    {
        public BenefitsValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("UserId é obrigatório.");

            RuleFor(x => x.WorkStatus)
                .NotEmpty().WithMessage("Situação profissional é obrigatória.")
                .Must(x =>
                    x.ToLower() == "nao_trabalho" ||
                    x.ToLower() == "informal" ||
                    x.ToLower() == "registrado"
                )
                .WithMessage("Situação profissional inválida.");

            RuleFor(x => x.PeopleAtHome)
                .GreaterThan(0).WithMessage("Quantidade de pessoas na residência deve ser maior que zero.");

            RuleFor(x => x.HousingSituation)
                .NotEmpty().WithMessage("Situação de moradia é obrigatória.")
                .Must(x =>
                    x.ToLower() == "pais" ||
                    x.ToLower() == "sozinho" ||
                    x.ToLower() == "republica" ||
                    x.ToLower() == "aluguel" ||
                    x.ToLower() == "casa_propria"
                )
                .WithMessage("Situação de moradia inválida.");

            When(x => x.IsStudent, () =>
            {
                RuleFor(x => x.InstitutionName)
                    .NotEmpty().WithMessage("Nome da instituição é obrigatório para estudante.");

                RuleFor(x => x.Course)
                    .NotEmpty().WithMessage("Curso é obrigatório para estudante.");

                RuleFor(x => x.Period)
                    .NotEmpty().WithMessage("Período é obrigatório para estudante.");
            });
        }
    }
}