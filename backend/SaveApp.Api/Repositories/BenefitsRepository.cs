using System.Text.Json;
using SaveApp.Api.Models;

namespace SaveApp.Api.Repositories
{
    public class BenefitsRepository
    {
        private readonly string _filePath = Path.Combine("Data", "Json", "benefits_profiles.json");

        public List<BenefitsProfile> GetAll()
        {
            if (!File.Exists(_filePath))
                return new List<BenefitsProfile>();

            var json = File.ReadAllText(_filePath);

            if (string.IsNullOrWhiteSpace(json))
                return new List<BenefitsProfile>();

            return JsonSerializer.Deserialize<List<BenefitsProfile>>(json) ?? new List<BenefitsProfile>();
        }

        public void SaveAll(List<BenefitsProfile> profiles)
        {
            var json = JsonSerializer.Serialize(profiles, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(_filePath, json);
        }
    }
}