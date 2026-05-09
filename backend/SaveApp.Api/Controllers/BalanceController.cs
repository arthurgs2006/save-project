using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using SaveApp.Api.DTOs.Balance;
using SaveApp.Api.Services;

namespace SaveApp.Api.Controllers
{
    [ApiController]
    [Route("api/balance")]
    public class BalanceController : ControllerBase
    {
        private readonly BalanceService _balanceService;
        private readonly IValidator<DepositRequestDto> _depositValidator;
        private readonly IValidator<WithdrawRequestDto> _withdrawValidator;

        public BalanceController(
            BalanceService balanceService,
            IValidator<DepositRequestDto> depositValidator,
            IValidator<WithdrawRequestDto> withdrawValidator)
        {
            _balanceService = balanceService;
            _depositValidator = depositValidator;
            _withdrawValidator = withdrawValidator;
        }

        [HttpPost("deposit")]
        public IActionResult Deposit([FromBody] DepositRequestDto dto)
        {
            var validationResult = _depositValidator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _balanceService.Deposit(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("withdraw")]
        public IActionResult Withdraw([FromBody] WithdrawRequestDto dto)
        {
            var validationResult = _withdrawValidator.Validate(dto);

            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var result = _balanceService.Withdraw(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}/statements")]
        public IActionResult GetStatementsByUser(string userId)
        {
            try
            {
                var result = _balanceService.GetStatementsByUser(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}