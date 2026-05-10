using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Education;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/education")]
    public class EducationController : ControllerBase
    {
        private readonly EducationService _educationService;

        public EducationController(EducationService educationService)
        {
            _educationService = educationService;
        }

        [HttpGet("lessons")]
        public IActionResult GetLessons()
        {
            try
            {
                var result = _educationService.GetLessons();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("lessons/{slug}")]
        public IActionResult GetLessonBySlug(string slug)
        {
            try
            {
                var result = _educationService.GetLessonBySlug(slug);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("recommendations/user/{userId}/context/{context}")]
        public IActionResult GetRecommendation(
            string userId,
            string context,
            [FromQuery] EducationContextRequestDto query)
        {
            try
            {
                var result = _educationService.GetRecommendation(userId, context, query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}