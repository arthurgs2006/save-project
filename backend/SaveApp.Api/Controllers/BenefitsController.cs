using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Benefits;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/benefits")]
    public class BenefitsController : ControllerBase
    {
        private readonly BenefitsService _benefitsService;
        private readonly IValidator<BenefitsRequestDto> _validator;

        public BenefitsController(
            BenefitsService benefitsService,
            IValidator<BenefitsRequestDto> validator)
        {
            _benefitsService = benefitsService;
            _validator = validator;
        }

        [HttpPost("analyze")]
        public IActionResult Analyze([FromBody] BenefitsRequestDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _benefitsService.Analyze(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            var history = _benefitsService.GetHistory();
            return Ok(history);
        }
    }
}