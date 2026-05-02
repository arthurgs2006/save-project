using SaveApp.Api.DTOs.Benefits;
using SaveApp.Api.Models;
using SaveApp.Api.Repositories;

namespace SaveApp.Api.Services
{
    public class BenefitsService
    {
        private readonly BenefitsRepository _repository;

        public BenefitsService(BenefitsRepository repository)
        {
            _repository = repository;
        }

        public BenefitsResponseDto Analyze(BenefitsRequestDto dto)
        {
            var benefits = GenerateBenefits(dto);

            var response = new BenefitsResponseDto
            {
                UserId = dto.UserId,
                Benefits = benefits,
                Message = benefits.Any()
                    ? "Benefícios identificados com base nas respostas informadas."
                    : "Nenhum benefício foi identificado para o perfil informado."
            };

            SaveProfile(dto, response.Benefits);

            return response;
        }

        public List<BenefitsProfile> GetHistory()
        {
            return _repository.GetAll();
        }

        public BenefitsProfile? GetLatestByUserId(int userId)
        {
            return _repository.GetLatestByUserId(userId);
        }

        private List<string> GenerateBenefits(BenefitsRequestDto dto)
        {
            var benefits = new List<string>();

            if (!dto.IsStudent)
                return benefits;

            benefits.Add("Auxílio Estudantil");

            if (dto.LivesFarFromInstitution)
                benefits.Add("Auxílio Transporte");

            var housingSituation = dto.HousingSituation.ToLower();

            if (
                housingSituation == "sozinho" ||
                housingSituation == "republica" ||
                housingSituation == "aluguel"
            )
            {
                benefits.Add("Auxílio Moradia");
            }

            var workStatus = dto.WorkStatus.ToLower();

            if (
                workStatus == "nao_trabalho" ||
                dto.PeopleAtHome >= 4
            )
            {
                benefits.Add("Auxílio Permanência");
            }

            if (
                workStatus == "nao_trabalho" ||
                workStatus == "informal"
            )
            {
                benefits.Add("Bolsa de Apoio Acadêmico");
            }

            return benefits.Distinct().ToList();
        }

        private void SaveProfile(BenefitsRequestDto dto, List<string> benefits)
        {
            var profile = new BenefitsProfile
            {
                UserId = dto.UserId,
                IsStudent = dto.IsStudent,
                InstitutionName = dto.InstitutionName,
                Course = dto.Course,
                Period = dto.Period,
                WorkStatus = dto.WorkStatus,
                PeopleAtHome = dto.PeopleAtHome,
                HousingSituation = dto.HousingSituation,
                LivesFarFromInstitution = dto.LivesFarFromInstitution,
                GeneratedBenefits = benefits,
                CreatedAt = DateTime.Now
            };

            _repository.SaveOrUpdate(profile);
        }
    }
}