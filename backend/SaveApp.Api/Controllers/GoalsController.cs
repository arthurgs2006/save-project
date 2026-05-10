using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Goals;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/goals")]
    public class GoalsController : ControllerBase
    {
        private readonly GoalsService _goalsService;
        private readonly IValidator<GoalRequestDto> _goalValidator;
        private readonly IValidator<GoalMovementRequestDto> _movementValidator;

        public GoalsController(
            GoalsService goalsService,
            IValidator<GoalRequestDto> goalValidator,
            IValidator<GoalMovementRequestDto> movementValidator)
        {
            _goalsService = goalsService;
            _goalValidator = goalValidator;
            _movementValidator = movementValidator;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUser(string userId, [FromQuery] string status = "active")
        {
            try
            {
                var result = _goalsService.GetByUser(userId, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var result = _goalsService.GetById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] GoalRequestDto dto)
        {
            var validationResult = _goalValidator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _goalsService.Create(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] GoalRequestDto dto)
        {
            var validationResult = _goalValidator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _goalsService.Update(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/movement")]
        public IActionResult AddMovement(int id, [FromBody] GoalMovementRequestDto dto)
        {
            var validationResult = _movementValidator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _goalsService.AddMovement(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/toggle-status")]
        public IActionResult ToggleStatus(int id)
        {
            try
            {
                var result = _goalsService.ToggleStatus(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _goalsService.Delete(id);
                return Ok(new { message = "Meta removida com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}