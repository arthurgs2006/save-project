using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Investments;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/investments")]
    public class InvestmentsController : ControllerBase
    {
        private readonly InvestmentsService _investmentsService;
        private readonly IValidator<InvestmentSimulationRequestDto> _validator;

        public InvestmentsController(
            InvestmentsService investmentsService,
            IValidator<InvestmentSimulationRequestDto> validator)
        {
            _investmentsService = investmentsService;
            _validator = validator;
        }

        [HttpPost("simulate")]
        public IActionResult Simulate([FromBody] InvestmentSimulationRequestDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _investmentsService.Simulate(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("options")]
        public IActionResult GetOptions()
        {
            var options = _investmentsService.GetOptions();
            return Ok(options);
        }
    }
}