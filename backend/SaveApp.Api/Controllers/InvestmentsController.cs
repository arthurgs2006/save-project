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
            catch
            {
                return StatusCode(500, new
                    {
                        message = "Ocorreu um erro ao processar a simulação de investimento."
                    });
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