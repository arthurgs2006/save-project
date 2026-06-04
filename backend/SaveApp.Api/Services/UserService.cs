using System.Linq;
using SaveApp.Api.Data.Repositories;
using SaveApp.Api.DTOs.User;
using SaveApp.Api.Models;
using SaveApp.Api.Validators;

namespace SaveApp.Api.Services
{
    public class UserService
    {
        private readonly UserRepository _repository;

        public UserService(UserRepository repository)
        {
            _repository = repository;
        }

        public User Create(CreateUserDto dto)
        {

            var users = _repository.GetAll();

            var emailExists = users.Any(u => u.Email.ToLower() == dto.Email.ToLower());

            if (emailExists)
                throw new Exception("E-mail já cadastrado.");

            var newUser = new User
            {
                Id = users.Count > 0 ? users.Max(u => u.Id) + 1 : 1,
                Name = dto.Name,
                Email = dto.Email,
                Password = dto.Password
            };

            if (dto.AdditionalData != null)
            {
                foreach (var kvp in dto.AdditionalData)
                {
                    newUser.AdditionalData[kvp.Key] = kvp.Value;
                }
            }

            users.Add(newUser);
            _repository.SaveAll(users);

            return newUser;
        }

        public List<User> GetAll()
        {
            return _repository.GetAll();
        }

        public User? GetById(int id)
        {
            return _repository.GetById(id);
        }

        public User? Update(int id, UpdateUserDto dto)
        {
            var user = _repository.GetById(id);

            if (user == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.Password = dto.Password;

            if (dto.AdditionalData != null)
            {
                foreach (var kvp in dto.AdditionalData)
                {
                    user.AdditionalData[kvp.Key] = kvp.Value;
                }
            }

            _repository.Save(user);
            return user;
        }

        public bool Delete(int id)
        {
            var users = _repository.GetAll();
            var user = users.FirstOrDefault(u => u.Id == id);

            if (user == null)
                return false;

            users.Remove(user);
            _repository.SaveAll(users);
            return true;
        }
    }
}