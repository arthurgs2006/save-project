using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Recommendations;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/recommendations")]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationsService _recommendationsService;
        private readonly IValidator<RecommendationRequestDto> _validator;

        public RecommendationsController(
            RecommendationsService recommendationsService,
            IValidator<RecommendationRequestDto> validator)
        {
            _recommendationsService = recommendationsService;
            _validator = validator;
        }

        [HttpPost]
        public IActionResult Generate([FromBody] RecommendationRequestDto dto)
        {
            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _recommendationsService.Generate(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}