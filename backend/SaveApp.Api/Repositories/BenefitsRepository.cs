using System.Text.Json;
using SaveApp.Api.Models;

namespace SaveApp.Api.Repositories
{
    public class BenefitsRepository
    {
        private readonly string _filePath;

        public BenefitsRepository(IWebHostEnvironment env)
        {
            _filePath = Path.Combine(
                env.ContentRootPath,
                "Data",
                "Json",
                "benefits_profiles.json"
            );

            Console.WriteLine($"[BenefitsRepository] JSON path: {_filePath}");
        }

        public List<BenefitsProfile> GetAll()
        {
            if (!File.Exists(_filePath))
            {
                Console.WriteLine("[BenefitsRepository] Arquivo JSON ainda não existe.");
                return new List<BenefitsProfile>();
            }

            var json = File.ReadAllText(_filePath);

            if (string.IsNullOrWhiteSpace(json))
                return new List<BenefitsProfile>();

            return JsonSerializer.Deserialize<List<BenefitsProfile>>(json)
                   ?? new List<BenefitsProfile>();
        }

        public BenefitsProfile? GetLatestByUserId(int userId)
        {
            return GetAll()
                .Where(profile => profile.UserId == userId)
                .OrderByDescending(profile => profile.CreatedAt)
                .FirstOrDefault();
        }

        public void SaveOrUpdate(BenefitsProfile profile)
        {
            var profiles = GetAll();

            var existingProfile = profiles
                .Where(item => item.UserId == profile.UserId)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefault();

            if (existingProfile == null)
            {
                profile.Id = profiles.Count > 0 ? profiles.Max(item => item.Id) + 1 : 1;
                profiles.Add(profile);

                Console.WriteLine($"[BenefitsRepository] Criando perfil Id {profile.Id}");
            }
            else
            {
                existingProfile.IsStudent = profile.IsStudent;
                existingProfile.InstitutionName = profile.InstitutionName;
                existingProfile.Course = profile.Course;
                existingProfile.Period = profile.Period;
                existingProfile.WorkStatus = profile.WorkStatus;
                existingProfile.PeopleAtHome = profile.PeopleAtHome;
                existingProfile.HousingSituation = profile.HousingSituation;
                existingProfile.LivesFarFromInstitution = profile.LivesFarFromInstitution;
                existingProfile.GeneratedBenefits = profile.GeneratedBenefits;
                existingProfile.CreatedAt = DateTime.Now;

                Console.WriteLine($"[BenefitsRepository] Atualizando perfil Id {existingProfile.Id}");
            }

            SaveAll(profiles);
        }

        public void SaveAll(List<BenefitsProfile> profiles)
        {
            var directoryPath = Path.GetDirectoryName(_filePath);

            if (!string.IsNullOrWhiteSpace(directoryPath) && !Directory.Exists(directoryPath))
                Directory.CreateDirectory(directoryPath);

            var json = JsonSerializer.Serialize(profiles, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(_filePath, json);

            Console.WriteLine($"[BenefitsRepository] Salvo com sucesso em: {_filePath}");
        }
    }
}