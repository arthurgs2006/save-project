using System.Text.Json;
using SaveApp.Api.Models;

namespace SaveApp.Api.Data.Repositories
{
    public class UserRepository
    {
        private readonly string _filePath = Path.Combine("Data", "Json", "users.json");

        public List<User> GetAll()
        {
            if (!File.Exists(_filePath))
                return new List<User>();

            var json = File.ReadAllText(_filePath);

            if (string.IsNullOrWhiteSpace(json))
                return new List<User>();

            return JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
        }

        public void SaveAll(List<User> users)
        {
            var json = JsonSerializer.Serialize(users, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(_filePath, json);
        }
    }
}