using SaveApp.Api.DTOs.Education;

namespace SaveApp.Api.Services
{
    public class EducationService
    {
        private readonly List<EducationLessonDto> _lessons = new()
        {
            new EducationLessonDto
            {
                Id = 1,
                Slug = "fundamentos-do-dinheiro",
                Title = "Fundamentos do dinheiro",
                Category = "Fundamentos",
                Level = "Básico",
                ReadingTime = "6 min",
                Icon = "bi-wallet2",
                Color = "#38bdf8",
                Summary = "Entenda renda, gasto, saldo, patrimônio e fluxo financeiro.",
                Description = "Antes de controlar melhor o dinheiro, é importante entender a diferença entre o que entra, o que sai, o que sobra e o que realmente constrói patrimônio.",
                PracticalUse = "Ajuda a interpretar a Home, o saldo projetado, os extratos e o resultado mensal.",
                Tags = new List<string> { "saldo", "renda", "gastos", "patrimônio" }
            },
            new EducationLessonDto
            {
                Id = 2,
                Slug = "orcamento-mensal",
                Title = "Orçamento mensal",
                Category = "Controle financeiro",
                Level = "Básico",
                ReadingTime = "8 min",
                Icon = "bi-calendar-check",
                Color = "#22c55e",
                Summary = "Aprenda a organizar entradas, saídas e previsões do mês.",
                Description = "Um orçamento mostra para onde o dinheiro está indo e ajuda a tomar decisões antes que o mês fique apertado.",
                PracticalUse = "Conecta diretamente com depósitos, saques, recorrentes e o gráfico da Home.",
                Tags = new List<string> { "orçamento", "mês", "controle", "previsão" }
            },
            new EducationLessonDto
            {
                Id = 3,
                Slug = "gastos-fixos-recorrentes",
                Title = "Gastos fixos e recorrentes",
                Category = "Recorrentes",
                Level = "Intermediário",
                ReadingTime = "7 min",
                Icon = "bi-repeat",
                Color = "#f97316",
                Summary = "Entenda como contas fixas e assinaturas pesam no mês.",
                Description = "Gastos recorrentes parecem pequenos isoladamente, mas somados podem comprometer grande parte da renda.",
                PracticalUse = "Ajuda a interpretar a tela de Recorrentes e o campo de recorrentes/mês da Home.",
                Tags = new List<string> { "recorrentes", "assinaturas", "custos fixos" }
            },
            new EducationLessonDto
            {
                Id = 4,
                Slug = "reserva-de-emergencia",
                Title = "Reserva de emergência",
                Category = "Segurança financeira",
                Level = "Básico",
                ReadingTime = "9 min",
                Icon = "bi-shield-check",
                Color = "#14b8a6",
                Summary = "Saiba por que uma reserva protege sua vida financeira.",
                Description = "Reserva de emergência é o dinheiro separado para imprevistos reais.",
                PracticalUse = "Conecta com metas, depósitos e planejamento de saldo.",
                Tags = new List<string> { "reserva", "emergência", "segurança" }
            },
            new EducationLessonDto
            {
                Id = 5,
                Slug = "planejamento-de-metas",
                Title = "Planejamento de metas",
                Category = "Metas",
                Level = "Intermediário",
                ReadingTime = "8 min",
                Icon = "bi-bullseye",
                Color = "#a855f7",
                Summary = "Aprenda a transformar objetivos em valores mensais possíveis.",
                Description = "Uma meta financeira precisa de valor alvo, prazo, prioridade e aporte.",
                PracticalUse = "Explica progresso, valor faltante, aporte mensal e prazo das metas.",
                Tags = new List<string> { "metas", "objetivos", "aporte", "prazo" }
            },
            new EducationLessonDto
            {
                Id = 6,
                Slug = "margem-de-seguranca",
                Title = "Margem de segurança",
                Category = "Saques",
                Level = "Intermediário",
                ReadingTime = "6 min",
                Icon = "bi-exclamation-triangle",
                Color = "#ef4444",
                Summary = "Entenda quanto do saldo pode ser usado sem comprometer o mês.",
                Description = "A margem de segurança mostra quanto dinheiro sobra depois dos compromissos principais.",
                PracticalUse = "Conecta com a tela de Saque e alertas sobre uso alto do saldo.",
                Tags = new List<string> { "saque", "segurança", "saldo", "risco" }
            },
            new EducationLessonDto
            {
                Id = 7,
                Slug = "dividas-cartao-juros",
                Title = "Dívidas, cartão e juros",
                Category = "Crédito",
                Level = "Avançado",
                ReadingTime = "10 min",
                Icon = "bi-credit-card-2-front",
                Color = "#f59e0b",
                Summary = "Entenda como juros e parcelamentos podem virar bola de neve.",
                Description = "Cartão de crédito pode ser ferramenta ou armadilha dependendo do uso.",
                PracticalUse = "Conecta com telas de cartão, bancos e recomendações financeiras.",
                Tags = new List<string> { "cartão", "juros", "dívidas", "parcelamento" }
            },
            new EducationLessonDto
            {
                Id = 8,
                Slug = "risco-liquidez-retorno",
                Title = "Risco, liquidez e retorno",
                Category = "Investimentos",
                Level = "Intermediário",
                ReadingTime = "9 min",
                Icon = "bi-graph-up-arrow",
                Color = "#0ea5e9",
                Summary = "Aprenda os três pilares antes de comparar investimentos.",
                Description = "Todo investimento envolve relação entre risco, liquidez e retorno.",
                PracticalUse = "Conecta com a página de Investimentos e simulações por perfil.",
                Tags = new List<string> { "investimentos", "risco", "liquidez", "retorno" }
            }
        };

        public List<EducationLessonDto> GetLessons()
        {
            return _lessons
                .OrderBy(x => x.Id)
                .ToList();
        }

        public EducationLessonDto GetLessonBySlug(string slug)
        {
            var lesson = _lessons.FirstOrDefault(x =>
                x.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));

            if (lesson == null)
                throw new Exception("Aula não encontrada.");

            return lesson;
        }

        public EducationRecommendationDto GetRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            var normalizedContext = Normalize(context);

            return normalizedContext switch
            {
                "withdraw" => BuildWithdrawRecommendation(userId, normalizedContext, query),
                "deposit" => BuildDepositRecommendation(userId, normalizedContext, query),
                "goals" => BuildGoalsRecommendation(userId, normalizedContext, query),
                "recurring" => BuildRecurringRecommendation(userId, normalizedContext, query),
                "investments" => BuildInvestmentsRecommendation(userId, normalizedContext),
                "cards-banks" => BuildCardsBanksRecommendation(userId, normalizedContext),
                "home" => BuildHomeRecommendation(userId, normalizedContext, query),
                _ => BuildDefaultRecommendation(userId, normalizedContext)
            };
        }

        private EducationRecommendationDto BuildWithdrawRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            var amount = query.Amount ?? 0;
            var currentBalance = query.CurrentBalance ?? 0;

            var ratio = currentBalance > 0 ? amount / currentBalance : 0;

            if (currentBalance <= 0)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "high",
                    "Saldo insuficiente para análise segura",
                    "Antes de sacar, é importante entender sua margem de segurança. Sem saldo disponível, qualquer saída pode aumentar o risco financeiro.",
                    "margem-de-seguranca",
                    new List<string>
                    {
                        "Saldo atual zerado ou inválido.",
                        "Evite saques sem revisar entradas e compromissos próximos."
                    }
                );
            }

            if (ratio >= 0.5m)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "high",
                    "Esse saque consome uma parte alta do saldo",
                    $"Esse saque representa aproximadamente {FormatPercent(ratio)} do seu saldo atual. Isso pode reduzir bastante sua margem de segurança no mês.",
                    "margem-de-seguranca",
                    new List<string>
                    {
                        $"Impacto sobre o saldo: {FormatPercent(ratio)}.",
                        "Revise contas próximas antes de confirmar.",
                        "Considere reduzir o valor ou adiar o saque."
                    }
                );
            }

            if (ratio >= 0.25m)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "moderate",
                    "Atenção à margem de segurança",
                    $"Esse saque representa aproximadamente {FormatPercent(ratio)} do seu saldo. O valor é possível, mas pode diminuir sua flexibilidade financeira.",
                    "margem-de-seguranca",
                    new List<string>
                    {
                        $"Uso do saldo: {FormatPercent(ratio)}.",
                        "Verifique se ainda existem recorrentes ou contas no mês.",
                        "Mantenha uma reserva mínima para imprevistos."
                    }
                );
            }

            return BuildRecommendation(
                userId,
                context,
                "low",
                "Saque com impacto controlado",
                $"Esse saque representa aproximadamente {FormatPercent(ratio)} do seu saldo. Mesmo assim, vale acompanhar o orçamento do mês.",
                "orcamento-mensal",
                new List<string>
                {
                    $"Uso do saldo: {FormatPercent(ratio)}.",
                    "Continue acompanhando entradas e saídas.",
                    "Registre a saída para manter seu histórico confiável."
                }
            );
        }

        private EducationRecommendationDto BuildDepositRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            if (query.HasGoals == true)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "positive",
                    "Depósito pode acelerar suas metas",
                    "Direcionar parte do depósito para uma meta ajuda a transformar dinheiro disponível em progresso real.",
                    "planejamento-de-metas",
                    new List<string>
                    {
                        "Você possui metas cadastradas.",
                        "Depósitos frequentes aumentam consistência.",
                        "Metas com aporte definido são mais fáceis de acompanhar."
                    }
                );
            }

            if (query.HasEmergencyReserve == false)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "moderate",
                    "Considere criar uma reserva de emergência",
                    "Antes de usar todo depósito no saldo livre, pode ser interessante separar parte para proteção financeira.",
                    "reserva-de-emergencia",
                    new List<string>
                    {
                        "Reserva reduz dependência de crédito.",
                        "Mesmo valores pequenos já ajudam.",
                        "Comece com uma primeira meta alcançável."
                    }
                );
            }

            return BuildRecommendation(
                userId,
                context,
                "info",
                "Depósito registrado com mais clareza",
                "Depósitos aumentam seu saldo, mas o mais importante é decidir se esse dinheiro será usado, guardado ou direcionado para uma meta.",
                "fundamentos-do-dinheiro",
                new List<string>
                {
                    "Saldo não é sempre dinheiro livre.",
                    "Separe dinheiro para objetivos importantes.",
                    "Use o histórico para entender sua evolução."
                }
            );
        }

        private EducationRecommendationDto BuildGoalsRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            var target = query.GoalTargetAmount ?? 0;
            var current = query.GoalCurrentAmount ?? 0;
            var monthly = query.MonthlyContribution ?? 0;

            var progress = target > 0 ? current / target : 0;

            if (target > 0 && progress >= 1)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "positive",
                    "Meta praticamente concluída",
                    "Quando uma meta é alcançada, o próximo passo é decidir se o dinheiro será mantido, usado ou transferido para outro objetivo.",
                    "planejamento-de-metas",
                    new List<string>
                    {
                        $"Progresso estimado: {FormatPercent(progress)}.",
                        "Revise o objetivo após concluir.",
                        "Considere iniciar uma nova etapa."
                    }
                );
            }

            if (target > 0 && monthly <= 0)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "moderate",
                    "Sua meta precisa de um plano de aporte",
                    "Uma meta sem aporte mensal pode demorar mais do que o esperado. Definir um valor recorrente ajuda a transformar intenção em plano.",
                    "planejamento-de-metas",
                    new List<string>
                    {
                        "Defina um aporte mensal realista.",
                        "Ajuste prazo ou valor alvo se necessário.",
                        "Priorize metas importantes."
                    }
                );
            }

            return BuildRecommendation(
                userId,
                context,
                "info",
                "Planeje metas com prazo e aporte",
                "Metas funcionam melhor quando possuem valor alvo, prazo e contribuição mensal definida.",
                "planejamento-de-metas",
                new List<string>
                {
                    "Valor alvo mostra o destino.",
                    "Prazo mostra o ritmo.",
                    "Aporte mensal mostra o plano."
                }
            );
        }

        private EducationRecommendationDto BuildRecurringRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            var credits = query.RecurringCredits ?? 0;
            var debits = query.RecurringDebits ?? 0;
            var balance = credits - debits;

            if (debits > credits && debits > 0)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "high",
                    "Seus recorrentes podem pressionar o mês",
                    "Quando débitos recorrentes superam entradas recorrentes, parte do saldo já começa comprometida antes dos gastos variáveis.",
                    "gastos-fixos-recorrentes",
                    new List<string>
                    {
                        $"Entradas recorrentes: {FormatMoney(credits)}.",
                        $"Débitos recorrentes: {FormatMoney(debits)}.",
                        $"Diferença mensal: {FormatMoney(balance)}."
                    }
                );
            }

            if (debits > 0)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "moderate",
                    "Acompanhe o peso dos custos fixos",
                    "Gastos recorrentes são previsíveis, mas precisam ser revisados para não crescerem de forma silenciosa.",
                    "gastos-fixos-recorrentes",
                    new List<string>
                    {
                        $"Débitos recorrentes: {FormatMoney(debits)}.",
                        "Revise assinaturas esquecidas.",
                        "Compare custo mensal e anual."
                    }
                );
            }

            return BuildRecommendation(
                userId,
                context,
                "info",
                "Use recorrentes para prever o mês",
                "Cadastrar entradas e saídas recorrentes ajuda o app a mostrar previsões mais próximas da realidade.",
                "orcamento-mensal",
                new List<string>
                {
                    "Cadastre contas fixas.",
                    "Cadastre entradas previsíveis.",
                    "Use a previsão mensal para tomar decisões."
                }
            );
        }

        private EducationRecommendationDto BuildInvestmentsRecommendation(
            string userId,
            string context)
        {
            return BuildRecommendation(
                userId,
                context,
                "info",
                "Antes do retorno, entenda o risco",
                "Investimentos devem ser analisados por risco, liquidez e prazo. Rentabilidade sozinha não conta a história completa.",
                "risco-liquidez-retorno",
                new List<string>
                {
                    "Risco mostra a chance de oscilação.",
                    "Liquidez mostra facilidade de resgate.",
                    "Retorno precisa combinar com objetivo e prazo."
                }
            );
        }

        private EducationRecommendationDto BuildCardsBanksRecommendation(
            string userId,
            string context)
        {
            return BuildRecommendation(
                userId,
                context,
                "moderate",
                "Compare cartões além dos benefícios",
                "Cartões e contas devem ser avaliados por taxas, limite, juros, benefícios e impacto no orçamento.",
                "dividas-cartao-juros",
                new List<string>
                {
                    "Limite não é renda extra.",
                    "Benefício não compensa juros altos.",
                    "Compare tarifas e condições."
                }
            );
        }

        private EducationRecommendationDto BuildHomeRecommendation(
            string userId,
            string context,
            EducationContextRequestDto query)
        {
            var balance = query.Balance ?? 0;
            var recurringCredits = query.RecurringCredits ?? 0;
            var recurringDebits = query.RecurringDebits ?? 0;
            var recurringResult = recurringCredits - recurringDebits;

            if (recurringResult < 0)
            {
                return BuildRecommendation(
                    userId,
                    context,
                    "moderate",
                    "Seu saldo projetado sente o peso dos recorrentes",
                    "Se os débitos recorrentes superam entradas fixas, o saldo pode cair mesmo antes dos gastos variáveis.",
                    "gastos-fixos-recorrentes",
                    new List<string>
                    {
                        $"Saldo atual: {FormatMoney(balance)}.",
                        $"Resultado recorrente: {FormatMoney(recurringResult)}.",
                        "Revise custos fixos e assinaturas."
                    }
                );
            }

            return BuildRecommendation(
                userId,
                context,
                "info",
                "Entenda sua visão mensal",
                "A Home combina saldo, movimentações e recorrentes para mostrar uma visão mais clara do mês.",
                "orcamento-mensal",
                new List<string>
                {
                    $"Saldo atual: {FormatMoney(balance)}.",
                    $"Resultado recorrente: {FormatMoney(recurringResult)}.",
                    "Use a previsão para decidir antes de gastar."
                }
            );
        }

        private EducationRecommendationDto BuildDefaultRecommendation(
            string userId,
            string context)
        {
            return BuildRecommendation(
                userId,
                context,
                "info",
                "Aprenda a interpretar seus dados",
                "A educação financeira do SaveApp conecta suas ações no app com decisões melhores sobre dinheiro.",
                "fundamentos-do-dinheiro",
                new List<string>
                {
                    "Entenda entradas e saídas.",
                    "Acompanhe saldo e compromissos.",
                    "Use metas para construir progresso."
                }
            );
        }

        private EducationRecommendationDto BuildRecommendation(
            string userId,
            string context,
            string riskLevel,
            string title,
            string message,
            string lessonSlug,
            List<string> highlights)
        {
            var lesson = _lessons.FirstOrDefault(x => x.Slug == lessonSlug);

            return new EducationRecommendationDto
            {
                UserId = userId,
                Context = context,
                RiskLevel = riskLevel,
                Title = title,
                Message = message,
                RecommendedLessonSlug = lessonSlug,
                RecommendedLessonTitle = lesson?.Title ?? "Educação financeira",
                ActionLabel = lesson != null
                    ? $"Aprender sobre {lesson.Title.ToLower()}"
                    : "Aprender mais",
                Icon = lesson?.Icon ?? "bi-journal-text",
                Color = lesson?.Color ?? "#38bdf8",
                Highlights = highlights
            };
        }

        private string Normalize(string value)
        {
            return (value ?? "")
                .Trim()
                .ToLower()
                .Replace("_", "-");
        }

        private string FormatPercent(decimal value)
        {
            return value.ToString("P0");
        }

        private string FormatMoney(decimal value)
        {
            return value.ToString("C");
        }
    }
}