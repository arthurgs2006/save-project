using System.Linq;
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

        public User? GetById(int id)
        {
            return GetAll().FirstOrDefault(u => u.Id == id);
        }

        public void SaveAll(List<User> users)
        {
            var json = JsonSerializer.Serialize(users, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(_filePath, json);
        }

        public void Save(User user)
        {
            var users = GetAll();
            var index = users.FindIndex(u => u.Id == user.Id);

            if (index == -1)
            {
                users.Add(user);
            }
            else
            {
                users[index] = user;
            }

            SaveAll(users);
        }
    }
}