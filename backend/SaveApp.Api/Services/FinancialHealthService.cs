using SaveApp.Api.DTOs.FinancialHealth;

namespace SaveApp.Api.Services
{
    public class FinancialHealthService
    {
        public FinancialScoreResponseDto Analyze(FinancialHealthAnalyzeRequestDto dto)
        {
            var organizationScore = CalculateOrganization(dto);
            var securityScore = CalculateSecurity(dto);
            var consistencyScore = CalculateConsistency(dto);
            var planningScore = CalculatePlanning(dto);
            var educationScore = CalculateEducation(dto);

            var finalScore = ClampScore(
                (int)Math.Round(
                    organizationScore * 0.22m +
                    securityScore * 0.26m +
                    consistencyScore * 0.18m +
                    planningScore * 0.24m +
                    educationScore * 0.10m
                )
            );

            var response = new FinancialScoreResponseDto
            {
                UserId = dto.UserId,
                Score = finalScore,
                Level = GetLevel(finalScore),
                Summary = BuildSummary(finalScore, dto),
                MainLessonSlug = GetMainLessonSlug(dto),
                MainLessonTitle = GetMainLessonTitle(GetMainLessonSlug(dto)),
                Pillars = new List<FinancialScorePillarDto>
                {
                    BuildPillar(
                        "Organização",
                        organizationScore,
                        "Mede se seus dados financeiros estão registrados e organizados.",
                        "bi-kanban",
                        "#38bdf8"
                    ),
                    BuildPillar(
                        "Segurança",
                        securityScore,
                        "Mede sua margem contra imprevistos, saldo e pressão dos recorrentes.",
                        "bi-shield-check",
                        "#14b8a6"
                    ),
                    BuildPillar(
                        "Consistência",
                        consistencyScore,
                        "Mede equilíbrio entre entradas, saídas e manutenção de bons hábitos.",
                        "bi-activity",
                        "#22c55e"
                    ),
                    BuildPillar(
                        "Planejamento",
                        planningScore,
                        "Mede metas, previsibilidade e visão de futuro.",
                        "bi-bullseye",
                        "#a855f7"
                    ),
                    BuildPillar(
                        "Educação",
                        educationScore,
                        "Mede o uso da área educativa e evolução de aprendizado.",
                        "bi-mortarboard-fill",
                        "#f59e0b"
                    )
                }
            };

            response.Strengths = BuildStrengths(dto, response.Pillars);
            response.Warnings = BuildWarnings(dto, response.Pillars);
            response.RecommendedActions = BuildRecommendedActions(dto, response.Pillars);

            return response;
        }

        private int CalculateOrganization(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 30;

            if (dto.TransactionsCount > 0) score += 20;
            if (dto.TransactionsCount >= 5) score += 15;
            if (dto.MonthlyRecurringCredits > 0 || dto.MonthlyRecurringDebits > 0) score += 20;
            if (dto.GoalsCount > 0) score += 15;

            return ClampScore(score);
        }

        private int CalculateSecurity(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 50;

            if (dto.Balance > 0) score += 15;
            if (dto.HasEmergencyReserve) score += 20;

            if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
            {
                score -= 20;
            }

            if (dto.MonthlyDebits > dto.MonthlyCredits && dto.MonthlyDebits > 0)
            {
                score -= 15;
            }

            if (dto.MonthlyIncome > 0)
            {
                var recurringWeight = dto.MonthlyRecurringDebits / dto.MonthlyIncome;

                if (recurringWeight >= 0.7m) score -= 20;
                else if (recurringWeight >= 0.5m) score -= 12;
                else if (recurringWeight <= 0.3m) score += 10;
            }

            return ClampScore(score);
        }

        private int CalculateConsistency(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 45;

            if (dto.MonthlyCredits > 0) score += 15;

            if (dto.MonthlyCredits >= dto.MonthlyDebits && dto.MonthlyCredits > 0)
            {
                score += 20;
            }
            else if (dto.MonthlyDebits > dto.MonthlyCredits && dto.MonthlyDebits > 0)
            {
                score -= 15;
            }

            if (dto.GoalsCurrentTotal > 0) score += 10;

            if (dto.CompletedGoalsCount > 0) score += 10;

            return ClampScore(score);
        }

        private int CalculatePlanning(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 35;

            if (dto.GoalsCount > 0) score += 20;
            if (dto.ActiveGoalsCount > 0) score += 15;

            if (dto.GoalsTargetTotal > 0)
            {
                var progress = dto.GoalsCurrentTotal / dto.GoalsTargetTotal;

                if (progress >= 0.75m) score += 20;
                else if (progress >= 0.4m) score += 12;
                else if (progress > 0) score += 8;
            }

            if (dto.MonthlyRecurringCredits > 0 || dto.MonthlyRecurringDebits > 0) score += 10;

            return ClampScore(score);
        }

        private int CalculateEducation(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 30;

            if (dto.LessonsOpened > 0) score += 25;
            if (dto.LessonsOpened >= 3) score += 15;
            if (dto.LessonsCompleted > 0) score += 20;
            if (dto.LessonsCompleted >= 3) score += 10;

            return ClampScore(score);
        }

        private FinancialScorePillarDto BuildPillar(
            string name,
            int score,
            string description,
            string icon,
            string color)
        {
            return new FinancialScorePillarDto
            {
                Name = name,
                Score = ClampScore(score),
                Status = GetPillarStatus(score),
                Description = description,
                Icon = icon,
                Color = color
            };
        }

        private List<FinancialScoreInsightDto> BuildStrengths(
            FinancialHealthAnalyzeRequestDto dto,
            List<FinancialScorePillarDto> pillars)
        {
            var strengths = new List<FinancialScoreInsightDto>();

            if (dto.GoalsCount > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-bullseye",
                    Title = "Você possui metas cadastradas",
                    Message = "Isso melhora seu planejamento e ajuda a transformar objetivos em progresso real."
                });
            }

            if (dto.MonthlyRecurringCredits > 0 || dto.MonthlyRecurringDebits > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-repeat",
                    Title = "Você usa recorrentes",
                    Message = "Cadastrar recorrentes melhora a previsibilidade do mês e conecta melhor a Home com seu fluxo financeiro."
                });
            }

            if (dto.MonthlyCredits >= dto.MonthlyDebits && dto.MonthlyCredits > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-graph-up-arrow",
                    Title = "Seu mês está positivo",
                    Message = "Suas entradas do mês estão cobrindo suas saídas registradas."
                });
            }

            if (dto.HasEmergencyReserve)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-shield-check",
                    Title = "Você possui reserva de emergência",
                    Message = "Isso aumenta sua segurança financeira e reduz dependência de crédito em imprevistos."
                });
            }

            if (strengths.Count == 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-info-circle",
                    Title = "Você já começou sua organização",
                    Message = "Continue registrando movimentações, recorrentes e metas para melhorar seu diagnóstico."
                });
            }

            return strengths;
        }

        private List<FinancialScoreInsightDto> BuildWarnings(
            FinancialHealthAnalyzeRequestDto dto,
            List<FinancialScorePillarDto> pillars)
        {
            var warnings = new List<FinancialScoreInsightDto>();

            if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-repeat",
                    Title = "Recorrentes pressionando o mês",
                    Message = "Seus débitos recorrentes superam suas entradas recorrentes. Isso reduz sua margem antes dos gastos variáveis."
                });
            }

            if (!dto.HasEmergencyReserve)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-shield-exclamation",
                    Title = "Reserva de emergência ausente",
                    Message = "Criar uma reserva melhora sua segurança e protege seu saldo contra imprevistos."
                });
            }

            if (dto.GoalsCount == 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-bullseye",
                    Title = "Nenhuma meta cadastrada",
                    Message = "Metas conectam seu saldo atual com objetivos futuros e melhoram seu planejamento."
                });
            }

            if (dto.MonthlyDebits > dto.MonthlyCredits && dto.MonthlyDebits > 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "danger",
                    Icon = "bi-arrow-down-circle",
                    Title = "Saídas maiores que entradas",
                    Message = "Neste mês, suas saídas registradas superam suas entradas. Vale revisar gastos e recorrentes."
                });
            }

            return warnings;
        }

        private List<FinancialRecommendedActionDto> BuildRecommendedActions(
            FinancialHealthAnalyzeRequestDto dto,
            List<FinancialScorePillarDto> pillars)
        {
            var actions = new List<FinancialRecommendedActionDto>();

            if (!dto.HasEmergencyReserve)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Criar uma meta de reserva",
                    Description = "Monte uma reserva de emergência para aumentar sua segurança financeira.",
                    Route = "/goals",
                    LessonSlug = "reserva-de-emergencia",
                    ActionLabel = "Criar ou revisar metas",
                    Priority = "high",
                    Icon = "bi-shield-check"
                });
            }

            if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Revisar gastos recorrentes",
                    Description = "Seus custos fixos estão pesando no mês. Revise assinaturas, contas e compromissos.",
                    Route = "/registerDebt",
                    LessonSlug = "gastos-fixos-recorrentes",
                    ActionLabel = "Ver recorrentes",
                    Priority = "high",
                    Icon = "bi-repeat"
                });
            }

            if (dto.GoalsCount == 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Criar sua primeira meta",
                    Description = "Transforme um objetivo em plano com valor alvo, prazo e aporte mensal.",
                    Route = "/goals",
                    LessonSlug = "planejamento-de-metas",
                    ActionLabel = "Criar meta",
                    Priority = "medium",
                    Icon = "bi-bullseye"
                });
            }

            if (dto.MonthlyCredits <= dto.MonthlyDebits && dto.MonthlyDebits > 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Revisar orçamento mensal",
                    Description = "Compare entradas, saídas e recorrentes para entender o peso real do mês.",
                    Route = "/financial-education/orcamento-mensal",
                    LessonSlug = "orcamento-mensal",
                    ActionLabel = "Aprender sobre orçamento",
                    Priority = "medium",
                    Icon = "bi-calendar-check"
                });
            }

            if (actions.Count == 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Continuar evoluindo",
                    Description = "Seu diagnóstico está equilibrado. Continue acompanhando metas, recorrentes e movimentações.",
                    Route = "/financial-education",
                    LessonSlug = "fundamentos-do-dinheiro",
                    ActionLabel = "Continuar aprendendo",
                    Priority = "low",
                    Icon = "bi-mortarboard-fill"
                });
            }

            return actions.Take(4).ToList();
        }

        private string BuildSummary(int score, FinancialHealthAnalyzeRequestDto dto)
        {
            if (score >= 85)
                return "Sua organização financeira está muito forte. Você combina controle, planejamento e boa previsibilidade.";

            if (score >= 70)
                return "Você tem uma boa organização financeira, mas ainda existem pontos que podem melhorar sua segurança e consistência.";

            if (score >= 50)
                return "Sua vida financeira possui uma base em construção. O próximo passo é melhorar previsibilidade, metas e margem de segurança.";

            return "Seu diagnóstico indica pontos importantes de atenção. Comece organizando recorrentes, metas e reserva de emergência.";
        }

        private string GetMainLessonSlug(FinancialHealthAnalyzeRequestDto dto)
        {
            if (!dto.HasEmergencyReserve) return "reserva-de-emergencia";

            if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
                return "gastos-fixos-recorrentes";

            if (dto.GoalsCount == 0) return "planejamento-de-metas";

            if (dto.MonthlyDebits > dto.MonthlyCredits && dto.MonthlyDebits > 0)
                return "orcamento-mensal";

            return "fundamentos-do-dinheiro";
        }

        private string GetMainLessonTitle(string slug)
        {
            return slug switch
            {
                "reserva-de-emergencia" => "Reserva de emergência",
                "gastos-fixos-recorrentes" => "Gastos fixos e recorrentes",
                "planejamento-de-metas" => "Planejamento de metas",
                "orcamento-mensal" => "Orçamento mensal",
                _ => "Fundamentos do dinheiro"
            };
        }

        private string GetLevel(int score)
        {
            if (score >= 85) return "Excelente organização";
            if (score >= 70) return "Boa organização";
            if (score >= 50) return "Em desenvolvimento";
            return "Precisa de atenção";
        }

        private string GetPillarStatus(int score)
        {
            if (score >= 80) return "Forte";
            if (score >= 60) return "Bom";
            if (score >= 40) return "Atenção";
            return "Crítico";
        }

        private int ClampScore(int value)
        {
            if (value < 0) return 0;
            if (value > 100) return 100;
            return value;
        }
    }
}