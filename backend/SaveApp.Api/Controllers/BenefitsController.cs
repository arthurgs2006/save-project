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
            Console.WriteLine("[BenefitsController] POST /api/benefits/analyze chamado");
            Console.WriteLine($"[BenefitsController] UserId recebido: {dto.UserId}");

            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
            {
                Console.WriteLine("[BenefitsController] Validação falhou:");

                foreach (var error in validationResult.Errors)
                    Console.WriteLine($"- {error.PropertyName}: {error.ErrorMessage}");

                return BadRequest(validationResult.Errors);
            }

            try
            {
                var result = _benefitsService.Analyze(dto);

                Console.WriteLine("[BenefitsController] Análise concluída e enviada para salvar.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BenefitsController] Erro no Analyze: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("user/{userId}")]
        public IActionResult Update(int userId, [FromBody] BenefitsRequestDto dto)
        {
            Console.WriteLine($"[BenefitsController] PUT /api/benefits/user/{userId} chamado");

            dto.UserId = userId;

            var validationResult = _validator.Validate(dto);

            if (!validationResult.IsValid)
            {
                Console.WriteLine("[BenefitsController] Validação falhou no update:");

                foreach (var error in validationResult.Errors)
                    Console.WriteLine($"- {error.PropertyName}: {error.ErrorMessage}");

                return BadRequest(validationResult.Errors);
            }

            try
            {
                var result = _benefitsService.Analyze(dto);

                Console.WriteLine("[BenefitsController] Perfil atualizado com sucesso.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BenefitsController] Erro no Update: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}/latest")]
        public IActionResult GetLatestByUserId(int userId)
        {
            Console.WriteLine($"[BenefitsController] GET /api/benefits/user/{userId}/latest chamado");

            var profile = _benefitsService.GetLatestByUserId(userId);

            if (profile == null)
            {
                Console.WriteLine("[BenefitsController] Nenhum perfil encontrado.");
                return NotFound(new { message = "Nenhum perfil de benefícios encontrado para este usuário." });
            }

            Console.WriteLine($"[BenefitsController] Perfil encontrado. Id: {profile.Id}");

            return Ok(profile);
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            Console.WriteLine("[BenefitsController] GET /api/benefits/history chamado");

            var history = _benefitsService.GetHistory();

            Console.WriteLine($"[BenefitsController] Total no histórico: {history.Count}");

            return Ok(history);
        }
    }
}