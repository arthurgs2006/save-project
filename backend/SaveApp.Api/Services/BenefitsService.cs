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
            var benefits = new List<string>();

            if (!dto.IsStudent)
            {
                var noStudentResponse = new BenefitsResponseDto
                {
                    UserId = dto.UserId,
                    Benefits = new List<string>(),
                    Message = "Nenhum benefício estudantil identificado, pois o usuário não está matriculado."
                };

                SaveProfile(dto, noStudentResponse.Benefits);
                return noStudentResponse;
            }

            // 1. Auxílio Estudantil
            benefits.Add("Auxílio Estudantil");

            // 2. Auxílio Transporte
            if (dto.LivesFarFromInstitution)
                benefits.Add("Auxílio Transporte");

            // 3. Auxílio Moradia
            if (
                dto.HousingSituation.ToLower() == "sozinho" ||
                dto.HousingSituation.ToLower() == "republica" ||
                dto.HousingSituation.ToLower() == "aluguel"
            )
            {
                benefits.Add("Auxílio Moradia");
            }

            // 4. Auxílio Permanência
            if (
                dto.WorkStatus.ToLower() == "nao_trabalho" ||
                dto.PeopleAtHome >= 4
            )
            {
                benefits.Add("Auxílio Permanência");
            }

            // 5. Bolsa de Apoio Acadêmico
            if (
                dto.WorkStatus.ToLower() == "nao_trabalho" ||
                dto.WorkStatus.ToLower() == "informal"
            )
            {
                benefits.Add("Bolsa de Apoio Acadêmico");
            }

            var response = new BenefitsResponseDto
            {
                UserId = dto.UserId,
                Benefits = benefits.Distinct().ToList(),
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

        private void SaveProfile(BenefitsRequestDto dto, List<string> benefits)
        {
            var profiles = _repository.GetAll();

            var newProfile = new BenefitsProfile
            {
                Id = profiles.Count > 0 ? profiles.Max(x => x.Id) + 1 : 1,
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

            profiles.Add(newProfile);
            _repository.SaveAll(profiles);
        }
    }
}