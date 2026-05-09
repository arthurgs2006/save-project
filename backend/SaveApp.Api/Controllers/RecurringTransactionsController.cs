using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Recurring;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/recurring-transactions")]
    public class RecurringTransactionsController : ControllerBase
    {
        private readonly RecurringTransactionsService _service;
        private readonly IValidator<RecurringTransactionRequestDto> _validator;

        public RecurringTransactionsController(
            RecurringTransactionsService service,
            IValidator<RecurringTransactionRequestDto> validator)
        {
            _service = service;
            _validator = validator;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUser(int userId)
        {
            try
            {
                var result = _service.GetByUser(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("period")]
        public IActionResult GetByPeriod(
            [FromQuery] int userId,
            [FromQuery] DateTime periodStart,
            [FromQuery] DateTime periodEnd,
            [FromQuery] string type = "")
        {
            try
            {
                var result = _service.GetByPeriod(new RecurringPeriodQueryDto
                {
                    UserId = userId,
                    PeriodStart = periodStart,
                    PeriodEnd = periodEnd,
                    Type = type
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] RecurringTransactionRequestDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _service.Create(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] RecurringTransactionRequestDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _service.Update(id, dto);
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
                _service.Delete(id);
                return Ok(new { message = "Recorrência removida com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}