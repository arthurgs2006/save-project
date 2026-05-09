using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.FinancialHealth;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/financial-health")]
    public class FinancialHealthController : ControllerBase
    {
        private readonly FinancialHealthService _financialHealthService;

        public FinancialHealthController(FinancialHealthService financialHealthService)
        {
            _financialHealthService = financialHealthService;
        }

        [HttpPost("analyze")]
        public IActionResult Analyze([FromBody] FinancialHealthAnalyzeRequestDto dto)
        {
            try
            {
                var result = _financialHealthService.Analyze(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}