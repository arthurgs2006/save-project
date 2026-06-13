using SaveApp.Api.DTOs.FinancialHealth;

namespace SaveApp.Api.Services
{
    public class FinancialHealthService
    {
        public FinancialScoreResponseDto Analyze(FinancialHealthAnalyzeRequestDto dto)
        {
            var totalExpenses = GetTotalMonthlyExpenses(dto);
            var effectiveIncome = GetEffectiveIncome(dto);
            var savingsRate = GetSavingsRate(dto, effectiveIncome, totalExpenses);
            var reserveMonths = GetReserveMonths(dto, totalExpenses);
            var debtRatio = GetDebtRatio(dto, effectiveIncome);

            var organizationScore = CalculateOrganization(dto);
            var securityScore = CalculateSecurity(dto, debtRatio);
            var liquidityScore = CalculateLiquidity(dto, reserveMonths);
            var consistencyScore = CalculateConsistency(dto, savingsRate);
            var planningScore = CalculatePlanning(dto);
            var educationScore = CalculateEducation(dto);

            var finalScore = ClampScore(
                (int)Math.Round(
                    organizationScore * 0.15m +
                    securityScore * 0.20m +
                    liquidityScore * 0.17m +
                    consistencyScore * 0.15m +
                    planningScore * 0.20m +
                    educationScore * 0.13m
                )
            );

            var response = new FinancialScoreResponseDto
            {
                UserId = dto.UserId,
                Score = finalScore,
                Level = GetLevel(finalScore),
                Summary = BuildSummary(finalScore, dto, savingsRate, reserveMonths),
                MainLessonSlug = GetMainLessonSlug(dto, savingsRate, reserveMonths, debtRatio),
                MainLessonTitle = GetMainLessonTitle(GetMainLessonSlug(dto, savingsRate, reserveMonths, debtRatio)),
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
                        "Mede sua margem contra imprevistos, saldo e peso dos compromissos fixos.",
                        "bi-shield-check",
                        "#14b8a6"
                    ),
                    BuildPillar(
                        "Liquidez",
                        liquidityScore,
                        "Mede por quantos meses seu saldo atual cobriria suas despesas.",
                        "bi-droplet-half",
                        "#0ea5e9"
                    ),
                    BuildPillar(
                        "Consistência",
                        consistencyScore,
                        "Mede equilíbrio entre entradas, saídas e sua taxa de poupança.",
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

            response.Strengths = BuildStrengths(dto, savingsRate, reserveMonths, debtRatio);
            response.Warnings = BuildWarnings(dto, savingsRate, reserveMonths, debtRatio);
            response.RecommendedActions = BuildRecommendedActions(dto, savingsRate, reserveMonths, debtRatio);

            return response;
        }

        // ─────────────────────────────────────────────
        // Derived metrics
        // ─────────────────────────────────────────────

        private decimal GetTotalMonthlyExpenses(FinancialHealthAnalyzeRequestDto dto)
        {
            return dto.MonthlyDebits + dto.MonthlyRecurringDebits;
        }

        private decimal GetEffectiveIncome(FinancialHealthAnalyzeRequestDto dto)
        {
            if (dto.MonthlyIncome > 0) return dto.MonthlyIncome;
            if (dto.MonthlyRecurringCredits > 0) return dto.MonthlyRecurringCredits;
            return dto.MonthlyCredits;
        }

        private decimal GetSavingsRate(FinancialHealthAnalyzeRequestDto dto, decimal effectiveIncome, decimal totalExpenses)
        {
            if (effectiveIncome <= 0) return 0;
            return (effectiveIncome - totalExpenses) / effectiveIncome;
        }

        private decimal GetReserveMonths(FinancialHealthAnalyzeRequestDto dto, decimal totalExpenses)
        {
            if (totalExpenses > 0) return dto.Balance / totalExpenses;
            return dto.Balance > 0 ? 99m : 0m;
        }

        private decimal GetDebtRatio(FinancialHealthAnalyzeRequestDto dto, decimal effectiveIncome)
        {
            if (effectiveIncome <= 0) return 0;
            return dto.MonthlyRecurringDebits / effectiveIncome;
        }

        // ─────────────────────────────────────────────
        // Pillar calculations
        // ─────────────────────────────────────────────

        private int CalculateOrganization(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 20;

            if (dto.TransactionsCount > 0) score += 15;
            if (dto.TransactionsCount >= 5) score += 10;
            if (dto.TransactionsCount >= 15) score += 10;
            if (dto.TransactionsCount >= 30) score += 10;

            if (dto.MonthlyRecurringCredits > 0 || dto.MonthlyRecurringDebits > 0) score += 15;
            if (dto.MonthlyRecurringCredits > 0 && dto.MonthlyRecurringDebits > 0) score += 10;

            if (dto.GoalsCount > 0) score += 10;

            return ClampScore(score);
        }

        private int CalculateSecurity(FinancialHealthAnalyzeRequestDto dto, decimal debtRatio)
        {
            var score = 25;

            if (dto.Balance > 0) score += 15;
            if (dto.Balance > GetTotalMonthlyExpenses(dto) && GetTotalMonthlyExpenses(dto) > 0) score += 10;

            if (dto.HasEmergencyReserve) score += 20;

            if (debtRatio >= 0.7m) score -= 25;
            else if (debtRatio >= 0.5m) score -= 12;
            else if (debtRatio <= 0.3m && debtRatio > 0) score += 10;
            else if (debtRatio <= 0.15m && debtRatio > 0) score += 5;

            if (dto.MonthlyDebits > dto.MonthlyCredits && dto.MonthlyDebits > 0) score -= 10;

            return ClampScore(score);
        }

        private int CalculateLiquidity(FinancialHealthAnalyzeRequestDto dto, decimal reserveMonths)
        {
            if (dto.Balance <= 0) return ClampScore(5);

            if (reserveMonths >= 6) return ClampScore(100);
            if (reserveMonths >= 3) return ClampScore(85);
            if (reserveMonths >= 1.5m) return ClampScore(65);
            if (reserveMonths >= 0.75m) return ClampScore(48);
            if (reserveMonths > 0) return ClampScore(30);

            return ClampScore(60);
        }

        private int CalculateConsistency(FinancialHealthAnalyzeRequestDto dto, decimal savingsRate)
        {
            var score = 30;

            if (dto.MonthlyCredits > 0) score += 10;

            if (savingsRate >= 0.3m) score += 30;
            else if (savingsRate >= 0.15m) score += 22;
            else if (savingsRate >= 0.05m) score += 14;
            else if (savingsRate >= 0m) score += 6;
            else if (savingsRate >= -0.2m) score -= 12;
            else score -= 25;

            if (dto.GoalsCurrentTotal > 0) score += 8;
            if (dto.CompletedGoalsCount > 0) score += 8;

            return ClampScore(score);
        }

        private int CalculatePlanning(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 20;

            if (dto.GoalsCount > 0) score += 15;
            if (dto.GoalsCount >= 2) score += 10;
            if (dto.ActiveGoalsCount > 0) score += 10;

            if (dto.GoalsTargetTotal > 0)
            {
                var progress = dto.GoalsCurrentTotal / dto.GoalsTargetTotal;

                if (progress >= 0.75m) score += 25;
                else if (progress >= 0.4m) score += 18;
                else if (progress >= 0.15m) score += 10;
                else if (progress > 0) score += 5;
            }

            if (dto.CompletedGoalsCount > 0) score += 5;

            if (dto.MonthlyRecurringCredits > 0 || dto.MonthlyRecurringDebits > 0) score += 10;

            return ClampScore(score);
        }

        private int CalculateEducation(FinancialHealthAnalyzeRequestDto dto)
        {
            var score = 20;

            if (dto.LessonsOpened > 0) score += 15;
            if (dto.LessonsOpened >= 3) score += 10;
            if (dto.LessonsOpened >= 6) score += 10;

            if (dto.LessonsCompleted > 0) score += 20;
            if (dto.LessonsCompleted >= 3) score += 15;
            if (dto.LessonsCompleted >= 6) score += 10;

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

        // ─────────────────────────────────────────────
        // Strengths
        // ─────────────────────────────────────────────

        private List<FinancialScoreInsightDto> BuildStrengths(
            FinancialHealthAnalyzeRequestDto dto,
            decimal savingsRate,
            decimal reserveMonths,
            decimal debtRatio)
        {
            var strengths = new List<FinancialScoreInsightDto>();

            if (dto.Balance > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-wallet2",
                    Title = "Seu saldo atual está positivo",
                    Message = $"Você tem R$ {dto.Balance:N2} disponíveis. Manter o saldo positivo é a base de qualquer planejamento."
                });
            }

            if (dto.TransactionsCount > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-receipt",
                    Title = "Você já registra suas movimentações",
                    Message = $"Você tem {dto.TransactionsCount} movimentação(ões) registrada(s). Isso já melhora a precisão do seu diagnóstico."
                });
            }

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

            if (dto.ActiveGoalsCount >= 2)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-bullseye",
                    Title = "Você está com várias metas ativas",
                    Message = "Acompanhar mais de uma meta ao mesmo tempo mostra organização e visão de futuro."
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

            if (savingsRate >= 0.2m)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-piggy-bank",
                    Title = "Boa taxa de poupança",
                    Message = $"Você está guardando cerca de {Math.Round(savingsRate * 100)}% da sua renda mensal. Continue assim."
                });
            }

            if (reserveMonths >= 3)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-droplet-half",
                    Title = "Boa cobertura de reserva",
                    Message = "Seu saldo atual cobriria vários meses de despesas em caso de imprevisto."
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

            if (debtRatio > 0 && debtRatio <= 0.3m)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-credit-card",
                    Title = "Compromissos fixos sob controle",
                    Message = "Seus débitos recorrentes representam uma fatia saudável da sua renda."
                });
            }

            if (dto.TransactionsCount >= 15)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-clock-history",
                    Title = "Histórico financeiro consistente",
                    Message = "Você já tem um bom volume de movimentações registradas, o que melhora a precisão do seu diagnóstico."
                });
            }

            if (dto.LessonsCompleted >= 3)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-mortarboard-fill",
                    Title = "Você está evoluindo na educação financeira",
                    Message = "Concluir aulas amplia seu repertório para tomar decisões financeiras melhores."
                });
            }
            else if (dto.LessonsOpened > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-book",
                    Title = "Você já explorou a área de educação financeira",
                    Message = "Continue concluindo as aulas abertas para aprofundar seu aprendizado."
                });
            }

            if (dto.MonthlyRecurringCredits > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-arrow-down-circle",
                    Title = "Renda recorrente cadastrada",
                    Message = "Ter sua renda registrada como recorrente ajuda a prever seu saldo dos próximos meses com mais precisão."
                });
            }

            if (dto.ActiveGoalsCount > 0)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-flag",
                    Title = "Você tem metas ativas em andamento",
                    Message = "Manter metas ativas ajuda a transformar sua organização financeira em resultados concretos."
                });
            }

            if (reserveMonths >= 1 && reserveMonths < 3)
            {
                strengths.Add(new FinancialScoreInsightDto
                {
                    Type = "success",
                    Icon = "bi-droplet-half",
                    Title = "Você já tem uma reserva inicial",
                    Message = "Seu saldo cobre pelo menos um mês de despesas. Continuar aumentando essa reserva traz ainda mais segurança."
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

        // ─────────────────────────────────────────────
        // Warnings
        // ─────────────────────────────────────────────

        private List<FinancialScoreInsightDto> BuildWarnings(
            FinancialHealthAnalyzeRequestDto dto,
            decimal savingsRate,
            decimal reserveMonths,
            decimal debtRatio)
        {
            var warnings = new List<FinancialScoreInsightDto>();

            if (dto.TransactionsCount == 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-receipt",
                    Title = "Nenhuma movimentação registrada",
                    Message = "Registre seus depósitos e saques para um diagnóstico mais preciso e personalizado."
                });
            }

            if (savingsRate < 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "danger",
                    Icon = "bi-exclamation-triangle",
                    Title = "Você está gastando mais do que ganha",
                    Message = "Suas despesas mensais superam sua renda. Revisar gastos agora evita endividamento futuro."
                });
            }
            else if (savingsRate < 0.05m && (dto.MonthlyIncome > 0 || dto.MonthlyRecurringCredits > 0))
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-piggy-bank",
                    Title = "Margem de economia muito baixa",
                    Message = "Quase toda a sua renda está sendo consumida pelas despesas do mês. Buscar uma margem de poupança aumenta sua segurança."
                });
            }

            if (dto.Balance > 0 && reserveMonths < 1)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-droplet-half",
                    Title = "Reserva cobre menos de um mês",
                    Message = "Seu saldo atual cobriria menos de um mês de despesas. Aumentar essa reserva reduz riscos em imprevistos."
                });
            }

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

            if (debtRatio >= 0.5m)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "danger",
                    Icon = "bi-credit-card-2-front",
                    Title = "Compromissos fixos elevados",
                    Message = "Seus débitos recorrentes consomem boa parte da sua renda mensal, deixando pouca margem para imprevistos."
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
            else if (dto.GoalsCurrentTotal <= 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "warning",
                    Icon = "bi-bullseye",
                    Title = "Metas ainda sem aportes",
                    Message = "Você já cadastrou metas, mas ainda não registrou nenhum valor guardado para elas."
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

            if (dto.MonthlyRecurringCredits == 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-cash-coin",
                    Title = "Nenhuma renda recorrente cadastrada",
                    Message = "Cadastrar sua renda fixa como recorrente melhora a previsão do seu saldo nos próximos meses."
                });
            }

            if (dto.GoalsCount > 0 && dto.ActiveGoalsCount == 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-flag",
                    Title = "Nenhuma meta ativa no momento",
                    Message = "Você já tem metas cadastradas, mas nenhuma está ativa. Ative uma meta para manter o foco."
                });
            }

            if (dto.LessonsOpened == 0)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-mortarboard",
                    Title = "Você ainda não explorou a educação financeira",
                    Message = "A área de aulas tem conteúdos rápidos que ajudam a melhorar seu diagnóstico ao longo do tempo."
                });
            }

            if (reserveMonths >= 1 && reserveMonths < 3 && dto.HasEmergencyReserve)
            {
                warnings.Add(new FinancialScoreInsightDto
                {
                    Type = "info",
                    Icon = "bi-droplet-half",
                    Title = "Reserva ainda pode crescer",
                    Message = "Sua reserva cobre entre 1 e 3 meses de despesas. O ideal é chegar a 3-6 meses para mais segurança."
                });
            }

            return warnings;
        }

        // ─────────────────────────────────────────────
        // Recommended actions
        // ─────────────────────────────────────────────

        private List<FinancialRecommendedActionDto> BuildRecommendedActions(
            FinancialHealthAnalyzeRequestDto dto,
            decimal savingsRate,
            decimal reserveMonths,
            decimal debtRatio)
        {
            var actions = new List<FinancialRecommendedActionDto>();

            if (dto.TransactionsCount == 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Registrar sua primeira movimentação",
                    Description = "Registre um depósito ou saque para que seu diagnóstico passe a refletir sua realidade financeira.",
                    Route = "/expenses",
                    LessonSlug = "fundamentos-do-dinheiro",
                    ActionLabel = "Registrar movimentação",
                    Priority = "medium",
                    Icon = "bi-receipt"
                });
            }

            if (savingsRate < 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Reduzir despesas do mês",
                    Description = "Suas saídas estão maiores que suas entradas. Revise seus gastos para equilibrar o mês.",
                    Route = "/expenses",
                    LessonSlug = "margem-de-seguranca",
                    ActionLabel = "Revisar despesas",
                    Priority = "high",
                    Icon = "bi-graph-down-arrow"
                });
            }

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
            else if (reserveMonths < 1 && dto.Balance > 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Reforçar sua reserva",
                    Description = "Sua reserva ainda cobre menos de um mês de despesas. Aumente os aportes para ganhar margem.",
                    Route = "/goals",
                    LessonSlug = "risco-liquidez-retorno",
                    ActionLabel = "Reforçar reserva",
                    Priority = "high",
                    Icon = "bi-droplet-half"
                });
            }

            if (debtRatio >= 0.5m)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Renegociar dívidas e recorrentes",
                    Description = "Seus compromissos fixos estão pesando bastante na renda. Avalie renegociações e cortes.",
                    Route = "/registerDebt",
                    LessonSlug = "dividas-cartao-juros",
                    ActionLabel = "Ver recorrentes",
                    Priority = "high",
                    Icon = "bi-credit-card-2-front"
                });
            }
            else if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Revisar gastos recorrentes",
                    Description = "Seus custos fixos estão pesando no mês. Revise assinaturas, contas e compromissos.",
                    Route = "/registerDebt",
                    LessonSlug = "gastos-fixos-recorrentes",
                    ActionLabel = "Ver recorrentes",
                    Priority = "medium",
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
            else if (dto.GoalsCurrentTotal <= 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Fazer o primeiro aporte na meta",
                    Description = "Você já tem metas criadas. Registrar o primeiro aporte ajuda a manter o hábito de guardar dinheiro.",
                    Route = "/goals",
                    LessonSlug = "planejamento-de-metas",
                    ActionLabel = "Ver metas",
                    Priority = "medium",
                    Icon = "bi-bullseye"
                });
            }

            if (savingsRate >= 0 && savingsRate < 0.1m)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Aumentar sua margem de poupança",
                    Description = "Sua margem entre renda e despesas está estreita. Pequenos ajustes no orçamento já fazem diferença.",
                    Route = "/financial-education/orcamento-mensal",
                    LessonSlug = "orcamento-mensal",
                    ActionLabel = "Aprender sobre orçamento",
                    Priority = "medium",
                    Icon = "bi-calendar-check"
                });
            }

            if (dto.MonthlyCredits <= dto.MonthlyDebits && dto.MonthlyDebits > 0 && savingsRate >= 0)
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

            if (dto.LessonsCompleted == 0)
            {
                actions.Add(new FinancialRecommendedActionDto
                {
                    Title = "Comece pelos fundamentos",
                    Description = "Conheça os conceitos essenciais para organizar sua vida financeira do zero.",
                    Route = "/financial-education/fundamentos-do-dinheiro",
                    LessonSlug = "fundamentos-do-dinheiro",
                    ActionLabel = "Começar aula",
                    Priority = "low",
                    Icon = "bi-mortarboard-fill"
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

        // ─────────────────────────────────────────────
        // Summary / level / lesson helpers
        // ─────────────────────────────────────────────

        private string BuildSummary(int score, FinancialHealthAnalyzeRequestDto dto, decimal savingsRate, decimal reserveMonths)
        {
            if (score >= 90)
                return "Sua organização financeira está excepcional. Você combina controle, reserva sólida, metas e boa margem de poupança.";

            if (score >= 80)
                return "Sua organização financeira está muito forte. Você combina controle, planejamento e boa previsibilidade.";

            if (score >= 70)
                return "Você tem uma boa organização financeira, mas ainda existem pontos que podem melhorar sua segurança e consistência.";

            if (score >= 55)
                return "Sua vida financeira possui uma base em construção. O próximo passo é melhorar previsibilidade, metas e margem de segurança.";

            if (score >= 35)
            {
                if (savingsRate < 0)
                    return "Seu diagnóstico indica pontos importantes de atenção: suas despesas estão superando sua renda neste mês.";

                return "Seu diagnóstico indica pontos importantes de atenção. Comece organizando recorrentes, metas e reserva de emergência.";
            }

            return "Seu diagnóstico indica risco elevado. Priorize equilibrar entradas e saídas e construir uma reserva mínima de segurança.";
        }

        private string GetMainLessonSlug(FinancialHealthAnalyzeRequestDto dto, decimal savingsRate, decimal reserveMonths, decimal debtRatio)
        {
            if (savingsRate < 0) return "margem-de-seguranca";

            if (!dto.HasEmergencyReserve) return "reserva-de-emergencia";

            if (debtRatio >= 0.5m) return "dividas-cartao-juros";

            if (dto.MonthlyRecurringDebits > dto.MonthlyRecurringCredits && dto.MonthlyRecurringDebits > 0)
                return "gastos-fixos-recorrentes";

            if (reserveMonths < 1) return "risco-liquidez-retorno";

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
                "margem-de-seguranca" => "Margem de segurança",
                "dividas-cartao-juros" => "Dívidas, cartão e juros",
                "risco-liquidez-retorno" => "Risco, liquidez e retorno",
                _ => "Fundamentos do dinheiro"
            };
        }

        private string GetLevel(int score)
        {
            if (score >= 90) return "Excepcional";
            if (score >= 80) return "Excelente organização";
            if (score >= 70) return "Boa organização";
            if (score >= 58) return "Em desenvolvimento";
            if (score >= 42) return "Atenção necessária";
            if (score >= 25) return "Risco elevado";
            return "Crítico";
        }

        private string GetPillarStatus(int score)
        {
            if (score >= 85) return "Excelente";
            if (score >= 70) return "Forte";
            if (score >= 50) return "Bom";
            if (score >= 30) return "Atenção";
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
