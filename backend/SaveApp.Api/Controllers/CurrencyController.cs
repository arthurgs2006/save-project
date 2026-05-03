using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Currency;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/currency")]
    public class CurrencyController : ControllerBase
    {
        private readonly CurrencyService _currencyService;

        public CurrencyController(CurrencyService currencyService)
        {
            _currencyService = currencyService;
        }

        [HttpGet("quotes")]
        public async Task<IActionResult> GetQuotes([FromQuery] string symbols = "USD-BRL,EUR-BRL,BTC-BRL")
        {
            try
            {
                var result = await _currencyService.GetQuotesAsync(symbols);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("convert")]
        public async Task<IActionResult> Convert([FromBody] CurrencyConvertRequestDto dto)
        {
            try
            {
                var result = await _currencyService.ConvertAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory(
            [FromQuery] string symbol = "USD-BRL",
            [FromQuery] int days = 15)
        {
            try
            {
                var result = await _currencyService.GetHistoryAsync(symbol, days);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("insights")]
        public IActionResult Insights([FromBody] CurrencyInsightRequestDto dto)
        {
            try
            {
                var result = _currencyService.GenerateInsights(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}