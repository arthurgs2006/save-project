using System.Globalization;
using System.Text.Json;
using SaveApp.Api.DTOs.Currency;

namespace SaveApp.Api.Services
{
    public class CurrencyService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<CurrencyService> _logger;

        public CurrencyService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<CurrencyService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        // ─── Quotes ──────────────────────────────────────────────

        public async Task<CurrencyQuotesResponseDto> GetQuotesAsync(string symbols)
        {
            var token = GetToken();
            var pairs = BuildPairs(symbols);

            // Fetch pairs individually so a single invalid pair
            // does not break the entire response.
            var pairList = pairs
                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrEmpty(p))
                .ToList();

            var quotes = new List<CurrencyQuoteDto>();
            var errors = new List<string>();

            foreach (var pair in pairList)
            {
                try
                {
                    var url = $"https://economia.awesomeapi.com.br/json/last/{pair}?token={token}";

                    var response = await _httpClient.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Par {Pair} retornou {Status}.", pair, response.StatusCode);
                        errors.Add(pair);
                        continue;
                    }

                    var json = await response.Content.ReadAsStringAsync();
                    var document = JsonDocument.Parse(json);

                    foreach (var property in document.RootElement.EnumerateObject())
                    {
                        var item = property.Value;
                        quotes.Add(MapQuote(item));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erro ao buscar par {Pair}.", pair);
                    errors.Add(pair);
                }
            }

            var message = errors.Any()
                ? $"Cotações carregadas. Pares indisponíveis: {string.Join(", ", errors)}."
                : "Cotações carregadas com sucesso.";

            return new CurrencyQuotesResponseDto
            {
                Quotes = quotes,
                Message = message
            };
        }

        // ─── Convert ─────────────────────────────────────────────

        public async Task<CurrencyConvertResponseDto> ConvertAsync(CurrencyConvertRequestDto dto)
        {
            var from = NormalizeCurrency(dto.From);
            var to   = NormalizeCurrency(dto.To);

            if (from == to)
            {
                return new CurrencyConvertResponseDto
                {
                    Amount  = dto.Amount,
                    From    = from,
                    To      = to,
                    Rate    = 1,
                    Result  = dto.Amount,
                    Message = "Moedas iguais. Nenhuma conversão necessária."
                };
            }

            decimal rate;

            try
            {
                rate = await GetConversionRateAsync(from, to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao obter taxa de conversão {From} → {To}.", from, to);
                throw new InvalidOperationException(
                    $"Não foi possível obter a taxa de câmbio para {from} → {to}. Verifique se ambas as moedas são suportadas.");
            }

            return new CurrencyConvertResponseDto
            {
                Amount  = dto.Amount,
                From    = from,
                To      = to,
                Rate    = Math.Round(rate, 6),
                Result  = Math.Round(dto.Amount * rate, 6),
                Message = "Conversão realizada com cotação atual da AwesomeAPI."
            };
        }

        // ─── History ─────────────────────────────────────────────

        public async Task<List<CurrencyHistoryPointDto>> GetHistoryAsync(string symbol, int days)
        {
            var token          = GetToken();
            var normalizedPair = NormalizePair(symbol);
            var safeDays       = Math.Clamp(days, 1, 360);

            var url = $"https://economia.awesomeapi.com.br/json/daily/{normalizedPair}/{safeDays}?token={token}";

            HttpResponseMessage response;

            try
            {
                response = await _httpClient.GetAsync(url);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro de rede ao buscar histórico de {Symbol}.", symbol);
                throw new InvalidOperationException(
                    $"Erro de conexão ao buscar histórico de {symbol}. Tente novamente.");
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Histórico de {Symbol} retornou HTTP {Status}.",
                    symbol,
                    response.StatusCode);

                throw new InvalidOperationException(
                    $"A API retornou {(int)response.StatusCode} para o par {normalizedPair}. " +
                    "Verifique se o par é suportado.");
            }

            var json = await response.Content.ReadAsStringAsync();

            JsonDocument document;

            try
            {
                document = JsonDocument.Parse(json);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Resposta inválida ao buscar histórico de {Symbol}: {Json}", symbol, json[..Math.Min(200, json.Length)]);
                throw new InvalidOperationException("Resposta inesperada da API de histórico.");
            }

            var history = new List<CurrencyHistoryPointDto>();

            foreach (var item in document.RootElement.EnumerateArray())
            {
                try
                {
                    history.Add(new CurrencyHistoryPointDto
                    {
                        Date      = GetString(item, "create_date"),
                        Bid       = GetDecimal(item, "bid"),
                        Ask       = GetDecimal(item, "ask"),
                        High      = GetDecimal(item, "high"),
                        Low       = GetDecimal(item, "low"),
                        PctChange = GetDecimal(item, "pctChange")
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Ignorando item inválido no histórico de {Symbol}.", symbol);
                }
            }

            return history
                .Where(h => !string.IsNullOrEmpty(h.Date))
                .OrderBy(h => h.Date)
                .ToList();
        }

        // ─── Insights ────────────────────────────────────────────

        public CurrencyInsightResponseDto GenerateInsights(CurrencyInsightRequestDto dto)
        {
            var profile     = "conservador";
            var insights    = new List<string>();
            var recommended = new List<string>();

            if (dto.Balance < 500)
            {
                insights.Add("Seu saldo atual sugere priorizar reserva em real antes de explorar exposição cambial.");
                recommended.Add("BRL");
            }

            if (dto.Balance >= 500 && dto.Balance < 1000)
            {
                insights.Add("Você está em uma fase de transição. Acompanhe o dólar como referência antes de diversificar.");
                recommended.Add("USD");
            }

            if (dto.Balance >= 1000 && dto.Income >= 1800)
            {
                profile = "moderado";
                insights.Add("Seu perfil permite acompanhar dólar e euro como forma de diversificação de portfólio.");
                recommended.Add("USD");
                recommended.Add("EUR");
            }

            if (dto.Balance >= 3000 && dto.Income >= 3500)
            {
                profile = "moderado-agressivo";
                insights.Add("Seu saldo e receita permitem considerar pequena exposição a ativos mais voláteis, como criptomoedas.");
                recommended.Add("BTC");
                recommended.Add("ETH");
            }

            if (dto.Balance >= 8000 && dto.Income >= 6000)
            {
                profile = "agressivo";
                insights.Add("Perfil adequado para diversificação ampla, incluindo moedas emergentes e criptoativos.");
            }

            if (dto.Preferences.Any(x => x.Contains("viagem", StringComparison.OrdinalIgnoreCase)))
            {
                insights.Add("Para quem tem interesse em viagens, acompanhar dólar e euro ajuda a planejar câmbio com antecedência.");
                recommended.AddRange(new[] { "USD", "EUR" });
            }

            if (dto.Preferences.Any(x => x.Contains("invest", StringComparison.OrdinalIgnoreCase)))
            {
                insights.Add("Fique atento à volatilidade do BTC e ETH: oscilações grandes podem gerar oportunidades ou riscos.");
                recommended.AddRange(new[] { "BTC", "ETH" });
            }

            if (!insights.Any())
            {
                insights.Add("Acompanhe as principais moedas regularmente antes de tomar qualquer decisão financeira.");
            }

            // Always add educational disclaimer
            insights.Add("⚠️ Estas informações são educativas. Consulte um especialista antes de investir em moeda estrangeira.");

            return new CurrencyInsightResponseDto
            {
                Profile               = profile,
                Insights              = insights.Distinct().ToList(),
                RecommendedCurrencies = recommended.Distinct().ToList()
            };
        }

        // ─── Private helpers ─────────────────────────────────────

        private async Task<decimal> GetConversionRateAsync(string from, string to)
        {
            if (from == "BRL")
            {
                var quote = await GetSingleQuoteAsync(to, "BRL");
                if (quote.Bid == 0) throw new InvalidOperationException($"Cotação zero para {to}-BRL.");
                return 1m / quote.Bid;
            }

            if (to == "BRL")
            {
                var quote = await GetSingleQuoteAsync(from, "BRL");
                if (quote.Bid == 0) throw new InvalidOperationException($"Cotação zero para {from}-BRL.");
                return quote.Bid;
            }

            // Cross rate via BRL
            var fromBrl = await GetSingleQuoteAsync(from, "BRL");
            var toBrl   = await GetSingleQuoteAsync(to, "BRL");

            if (toBrl.Bid == 0) throw new InvalidOperationException($"Cotação zero para {to}-BRL.");

            return fromBrl.Bid / toBrl.Bid;
        }

        private async Task<CurrencyQuoteDto> GetSingleQuoteAsync(string from, string to)
        {
            var response = await GetQuotesAsync($"{from}-{to}");
            var quote    = response.Quotes.FirstOrDefault();

            if (quote == null)
                throw new InvalidOperationException($"Cotação não encontrada para o par {from}-{to}.");

            return quote;
        }

        private string GetToken()
        {
            var token = _configuration["AwesomeApi:Token"];

            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogCritical("Token da AwesomeAPI não configurado em AwesomeApi:Token.");
                throw new InvalidOperationException(
                    "Token da AwesomeAPI não configurado. Adicione 'AwesomeApi:Token' ao appsettings.");
            }

            return token;
        }

        private string BuildPairs(string symbols)
        {
            if (string.IsNullOrWhiteSpace(symbols))
                return "USD-BRL,EUR-BRL,BTC-BRL";

            return string.Join(",",
                symbols
                    .Split(",", StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => NormalizePair(s.Trim()))
                    .Where(s => !string.IsNullOrEmpty(s))
                    .Distinct());
        }

        private string NormalizePair(string value)
        {
            var normalized = value.Trim().ToUpper();
            return normalized.Contains("-") ? normalized : $"{normalized}-BRL";
        }

        private string NormalizeCurrency(string value) =>
            value.Trim().ToUpper();

        private CurrencyQuoteDto MapQuote(JsonElement item) =>
            new CurrencyQuoteDto
            {
                Code      = GetString(item, "code"),
                CodeIn    = GetString(item, "codein"),
                Name      = GetString(item, "name"),
                Bid       = GetDecimal(item, "bid"),
                Ask       = GetDecimal(item, "ask"),
                High      = GetDecimal(item, "high"),
                Low       = GetDecimal(item, "low"),
                VarBid    = GetDecimal(item, "varBid"),
                PctChange = GetDecimal(item, "pctChange"),
                CreatedAt = GetString(item, "create_date")
            };

        private string GetString(JsonElement element, string property) =>
            element.TryGetProperty(property, out var value)
                ? value.GetString() ?? ""
                : "";

        private decimal GetDecimal(JsonElement element, string property)
        {
            if (!element.TryGetProperty(property, out var value))
                return 0;

            var text = value.ValueKind == JsonValueKind.Number
                ? value.GetRawText()
                : value.GetString();

            if (string.IsNullOrWhiteSpace(text)) return 0;

            return decimal.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var result)
                ? result
                : 0;
        }
    }
}