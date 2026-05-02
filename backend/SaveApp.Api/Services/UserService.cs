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

            users.Add(newUser);
            _repository.SaveAll(users);

            return newUser;
        }

        public List<User> GetAll()
        {
            return _repository.GetAll();
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