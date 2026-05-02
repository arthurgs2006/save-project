using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.User;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IValidator<CreateUserDto> _validator;

        public AuthController(
            UserService userService,
            IValidator<CreateUserDto> validator)
        {
            _userService = userService;
            _validator = validator;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] CreateUserDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var user = _userService.Create(dto);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(int id)
        {
            var result = _userService.Delete(id);
            if (!result)
                return NotFound(new { message = "Usuário não encontrado." });

            return Ok(new { message = "Usuário excluído com sucesso." });
        }
    }
}