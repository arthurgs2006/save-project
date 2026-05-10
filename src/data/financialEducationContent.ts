export type EducationLevel = "Básico" | "Intermediário" | "Avançado";

export type LessonSection = {
    title: string;
    content: string[];
};

export type LessonExample = {
    title: string;
    description: string;
    items: string[];
};

export type FinancialEducationLesson = {
    id: number;
    slug: string;
    title: string;
    category: string;
    level: EducationLevel;
    readingTime: string;
    icon: string;
    color: string;
    summary: string;
    description: string;
    practicalUse: string;
    tags: string[];
    sections: LessonSection[];
    example: LessonExample;
    commonMistakes: string[];
    checklist: string[];
    nextLessons: string[];
};

export const financialEducationLessons: FinancialEducationLesson[] = [
    {
        id: 1,
        slug: "fundamentos-do-dinheiro",
        title: "Fundamentos do dinheiro",
        category: "Fundamentos",
        level: "Básico",
        readingTime: "6 min",
        icon: "bi-wallet2",
        color: "#38bdf8",
        summary: "Entenda renda, gasto, saldo, patrimônio e fluxo financeiro.",
        description:
            "Antes de controlar melhor o dinheiro, você precisa entender a diferença entre o que entra, o que sai, o que sobra e o que realmente constrói patrimônio.",
        practicalUse:
            "Ajuda a interpretar a Home, o saldo projetado, os extratos e o resultado mensal.",
        tags: ["saldo", "renda", "gastos", "patrimônio"],
        sections: [
            {
                title: "O que é dinheiro dentro da sua vida financeira",
                content: [
                    "Dinheiro não é só o valor que aparece no saldo. Ele representa entrada, saída, escolhas, compromissos e segurança.",
                    "Quando você olha apenas para o saldo atual, pode ter uma falsa sensação de controle. O saldo mostra o agora, mas não mostra o que ainda vai sair, o que precisa ser reservado e o que está comprometido.",
                    "Por isso, a base da organização financeira é separar quatro ideias: renda, gasto, saldo e patrimônio."
                ],
            },
            {
                title: "Renda, gasto, saldo e patrimônio",
                content: [
                    "Renda é tudo que entra: salário, freelas, reembolsos, rendimentos, benefícios ou qualquer outro dinheiro recebido.",
                    "Gasto é tudo que sai: contas fixas, compras, assinaturas, saques, lazer, alimentação, transporte e despesas inesperadas.",
                    "Saldo é o dinheiro disponível em determinado momento. Ele pode mudar rápido se você ainda tiver contas futuras para pagar.",
                    "Patrimônio é o que você constrói ao longo do tempo: dinheiro guardado, investimentos, bens, reserva e metas acumuladas."
                ],
            },
            {
                title: "Por que isso importa",
                content: [
                    "Uma pessoa pode ter saldo positivo hoje e ainda assim estar financeiramente desorganizada se seus gastos futuros forem maiores que suas entradas.",
                    "Da mesma forma, uma pessoa pode ter renda baixa, mas estar evoluindo bem se consegue guardar uma parte, evitar dívidas ruins e criar previsibilidade.",
                    "O objetivo do controle financeiro não é apenas saber quanto você tem, mas entender para onde seu dinheiro está indo e o que ele está construindo."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Imagine que você tem R$ 1.200 de saldo, mas ainda terá R$ 900 em contas recorrentes nos próximos dias.",
            items: [
                "Saldo atual: R$ 1.200",
                "Gastos recorrentes previstos: R$ 900",
                "Saldo realmente livre: R$ 300",
                "Conclusão: olhar só para R$ 1.200 pode fazer você gastar mais do que deveria."
            ],
        },
        commonMistakes: [
            "Achar que saldo disponível é dinheiro livre para gastar.",
            "Misturar gastos fixos com gastos ocasionais sem diferenciar impacto.",
            "Não separar dinheiro para metas, reserva ou compromissos futuros.",
            "Controlar apenas o que já aconteceu e ignorar o que está previsto."
        ],
        checklist: [
            "Sei quanto entra no mês?",
            "Sei quanto sai em média?",
            "Sei quais gastos ainda estão previstos?",
            "Sei quanto do saldo está realmente livre?",
            "Tenho alguma parte do dinheiro construindo patrimônio?"
        ],
        nextLessons: ["orcamento-mensal", "gastos-fixos-recorrentes"],
    },
    {
        id: 2,
        slug: "orcamento-mensal",
        title: "Orçamento mensal",
        category: "Controle financeiro",
        level: "Básico",
        readingTime: "8 min",
        icon: "bi-calendar-check",
        color: "#22c55e",
        summary: "Aprenda a organizar entradas, saídas e previsões do mês.",
        description:
            "Um orçamento não serve só para limitar gastos. Ele mostra para onde o dinheiro está indo e ajuda a tomar decisões antes que o mês fique apertado.",
        practicalUse:
            "Conecta diretamente com depósitos, saques, recorrentes e o gráfico da Home.",
        tags: ["orçamento", "mês", "controle", "previsão"],
        sections: [
            {
                title: "O que é um orçamento mensal",
                content: [
                    "Orçamento mensal é o plano do seu dinheiro dentro de um mês. Ele compara o que entra, o que sai e o que deveria sobrar.",
                    "Ele não existe para impedir você de gastar. Ele existe para mostrar se seus gastos fazem sentido com sua renda, seus objetivos e sua realidade.",
                    "Um bom orçamento precisa considerar gastos já realizados e também gastos previstos."
                ],
            },
            {
                title: "Entradas, saídas e previsão",
                content: [
                    "Entradas são os valores que aumentam seu saldo. Saídas são os valores que reduzem seu saldo.",
                    "A previsão é a parte mais importante: ela mostra o que provavelmente vai acontecer se você mantiver o comportamento atual.",
                    "Por isso, gastos recorrentes são tão importantes. Eles não aparecem uma única vez. Eles voltam e afetam vários meses."
                ],
            },
            {
                title: "Como analisar um mês",
                content: [
                    "Primeiro, veja o total de entradas. Depois, veja o total de saídas fixas e recorrentes. Em seguida, analise os gastos variáveis.",
                    "Se as saídas fixas já consomem grande parte da renda, o mês fica menos flexível. Qualquer gasto extra pode causar aperto.",
                    "Se as entradas superam as saídas com folga, existe espaço para metas, reserva e investimentos."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Uma pessoa recebe R$ 2.500 por mês e tem R$ 1.600 em gastos fixos.",
            items: [
                "Renda mensal: R$ 2.500",
                "Gastos fixos: R$ 1.600",
                "Sobra antes dos gastos variáveis: R$ 900",
                "Se gastar R$ 700 com lazer, comida fora e compras, sobram R$ 200.",
                "Conclusão: o orçamento mostra limite antes do problema acontecer."
            ],
        },
        commonMistakes: [
            "Montar orçamento só depois que o dinheiro acabou.",
            "Ignorar gastos pequenos porque parecem irrelevantes.",
            "Não separar gastos fixos, variáveis e metas.",
            "Achar que orçamento é restrição, quando na verdade é clareza."
        ],
        checklist: [
            "Conheço minha renda mensal?",
            "Cadastrei meus gastos recorrentes?",
            "Sei quanto sobra depois dos fixos?",
            "Tenho limite para gastos variáveis?",
            "Revisei o mês antes de tomar decisões grandes?"
        ],
        nextLessons: ["gastos-fixos-recorrentes", "planejamento-de-metas"],
    },
    {
        id: 3,
        slug: "gastos-fixos-recorrentes",
        title: "Gastos fixos e recorrentes",
        category: "Recorrentes",
        level: "Intermediário",
        readingTime: "7 min",
        icon: "bi-repeat",
        color: "#f97316",
        summary: "Entenda como contas fixas e assinaturas pesam no mês.",
        description:
            "Gastos recorrentes parecem pequenos isoladamente, mas somados podem comprometer grande parte da renda.",
        practicalUse:
            "Ajuda a interpretar a tela de Recorrentes e o campo de recorrentes/mês da Home.",
        tags: ["recorrentes", "assinaturas", "custos fixos"],
        sections: [
            {
                title: "O que são gastos recorrentes",
                content: [
                    "Gastos recorrentes são despesas que se repetem com frequência: mensal, semanal, diária ou anual.",
                    "Eles incluem aluguel, internet, mensalidades, assinaturas, academia, transporte fixo, parcelas e serviços.",
                    "O perigo dos recorrentes é que eles parecem previsíveis, mas quando são ignorados, tomam conta do orçamento."
                ],
            },
            {
                title: "O peso acumulado",
                content: [
                    "Um gasto de R$ 29,90 pode parecer pequeno. Mas cinco assinaturas desse tipo passam de R$ 150 por mês.",
                    "O problema não é apenas o valor individual, e sim o total acumulado que se repete todo mês.",
                    "Gastos recorrentes reduzem sua liberdade financeira porque comprometem dinheiro antes mesmo de você decidir o que fazer com ele."
                ],
            },
            {
                title: "Como revisar recorrentes",
                content: [
                    "A revisão deve separar o que é essencial, o que é útil e o que virou hábito automático.",
                    "Essencial é o que você realmente precisa. Útil é o que faz sentido, mas pode ser ajustado. Automático é o que continua sendo pago sem reflexão.",
                    "A meta não é cortar tudo. A meta é garantir que cada recorrente ainda vale o espaço que ocupa no orçamento."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Imagine que você tem várias assinaturas pequenas.",
            items: [
                "Streaming: R$ 39,90",
                "Música: R$ 21,90",
                "Academia: R$ 120,00",
                "Aplicativo: R$ 19,90",
                "Total mensal: R$ 201,70",
                "Total anual aproximado: R$ 2.420,40"
            ],
        },
        commonMistakes: [
            "Cadastrar apenas gastos grandes e ignorar os pequenos.",
            "Não revisar assinaturas antigas.",
            "Confundir gasto recorrente com gasto eventual.",
            "Olhar só o valor mensal e ignorar o custo anual."
        ],
        checklist: [
            "Cadastrei todos os custos fixos?",
            "Incluí assinaturas pequenas?",
            "Comparei entradas recorrentes com débitos recorrentes?",
            "Revisei o que ainda faz sentido?",
            "Sei quanto meus recorrentes custam por ano?"
        ],
        nextLessons: ["orcamento-mensal", "margem-de-seguranca"],
    },
    {
        id: 4,
        slug: "reserva-de-emergencia",
        title: "Reserva de emergência",
        category: "Segurança financeira",
        level: "Básico",
        readingTime: "9 min",
        icon: "bi-shield-check",
        color: "#14b8a6",
        summary: "Saiba por que uma reserva protege sua vida financeira.",
        description:
            "Reserva de emergência é o dinheiro separado para imprevistos reais.",
        practicalUse:
            "Conecta com metas, depósitos e planejamento de saldo.",
        tags: ["reserva", "emergência", "segurança"],
        sections: [
            {
                title: "O que é reserva de emergência",
                content: [
                    "Reserva de emergência é um valor separado para situações inesperadas e importantes.",
                    "Ela não é dinheiro para compras por impulso, lazer ou oportunidades aleatórias. É uma proteção.",
                    "A reserva evita que um problema vire dívida."
                ],
            },
            {
                title: "Quanto guardar",
                content: [
                    "Uma referência comum é guardar alguns meses do seu custo de vida essencial.",
                    "Quem tem renda instável pode precisar de uma reserva maior. Quem tem renda estável pode começar com uma meta menor e evoluir aos poucos.",
                    "O mais importante é começar. Mesmo uma reserva pequena já reduz vulnerabilidade."
                ],
            },
            {
                title: "Onde deixar",
                content: [
                    "Reserva precisa ter segurança e liquidez. Isso significa que o dinheiro deve estar acessível quando necessário.",
                    "Não faz sentido colocar reserva em algo muito arriscado ou difícil de resgatar.",
                    "Antes de buscar alta rentabilidade, a reserva precisa cumprir seu papel principal: estar disponível."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Se seus gastos essenciais são R$ 1.500 por mês, uma reserva inicial pode mirar primeiro em um mês.",
            items: [
                "Primeira etapa: R$ 1.500",
                "Segunda etapa: R$ 3.000",
                "Terceira etapa: R$ 4.500 ou mais",
                "Conclusão: dividir em etapas torna a meta menos pesada."
            ],
        },
        commonMistakes: [
            "Usar reserva para qualquer vontade.",
            "Tentar investir a reserva em algo arriscado.",
            "Achar que só vale começar se puder guardar muito.",
            "Misturar reserva com dinheiro de gastos do mês."
        ],
        checklist: [
            "Tenho uma meta de reserva?",
            "Sei meu custo essencial mensal?",
            "A reserva está separada do dinheiro de uso diário?",
            "Consigo acessar esse dinheiro em emergência?",
            "Estou aumentando a reserva com consistência?"
        ],
        nextLessons: ["planejamento-de-metas", "risco-liquidez-retorno"],
    },
    {
        id: 5,
        slug: "planejamento-de-metas",
        title: "Planejamento de metas",
        category: "Metas",
        level: "Intermediário",
        readingTime: "8 min",
        icon: "bi-bullseye",
        color: "#a855f7",
        summary: "Aprenda a transformar objetivos em valores mensais possíveis.",
        description:
            "Uma meta financeira precisa de valor alvo, prazo, prioridade e aporte.",
        practicalUse:
            "Explica progresso, valor faltante, aporte mensal e prazo das metas.",
        tags: ["metas", "objetivos", "aporte", "prazo"],
        sections: [
            {
                title: "Meta não é só desejo",
                content: [
                    "Uma meta financeira precisa sair da ideia e virar plano.",
                    "Para isso, ela precisa ter nome, valor alvo, valor atual, prazo e aporte mensal.",
                    "Sem esses elementos, a meta fica vaga e difícil de acompanhar."
                ],
            },
            {
                title: "Aporte mensal",
                content: [
                    "Aporte mensal é quanto você precisa guardar por mês para chegar no objetivo.",
                    "Se o aporte necessário for alto demais, a meta não está errada. Talvez o prazo, o valor alvo ou a prioridade precisem ser ajustados.",
                    "Metas boas são ambiciosas, mas possíveis."
                ],
            },
            {
                title: "Prioridade",
                content: [
                    "Nem toda meta tem a mesma urgência.",
                    "Reserva de emergência, dívidas caras e compromissos importantes normalmente vêm antes de metas de consumo.",
                    "Dar prioridade ajuda a decidir para onde vai o próximo depósito."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Você quer guardar R$ 6.000 em 12 meses e já tem R$ 1.200.",
            items: [
                "Valor alvo: R$ 6.000",
                "Valor atual: R$ 1.200",
                "Falta: R$ 4.800",
                "Prazo: 12 meses",
                "Aporte necessário: R$ 400 por mês"
            ],
        },
        commonMistakes: [
            "Criar meta sem prazo.",
            "Definir valor alto sem calcular aporte.",
            "Ter muitas metas ao mesmo tempo.",
            "Não revisar a meta quando a renda muda."
        ],
        checklist: [
            "Minha meta tem valor alvo?",
            "Minha meta tem prazo?",
            "Sei quanto preciso guardar por mês?",
            "A prioridade dessa meta faz sentido?",
            "Estou acompanhando o progresso?"
        ],
        nextLessons: ["reserva-de-emergencia", "orcamento-mensal"],
    },
    {
        id: 6,
        slug: "margem-de-seguranca",
        title: "Margem de segurança",
        category: "Saques",
        level: "Intermediário",
        readingTime: "6 min",
        icon: "bi-exclamation-triangle",
        color: "#ef4444",
        summary: "Entenda quanto do saldo pode ser usado sem comprometer o mês.",
        description:
            "A margem de segurança mostra quanto dinheiro sobra depois dos compromissos principais.",
        practicalUse:
            "Conecta com a tela de Saque e alertas sobre uso alto do saldo.",
        tags: ["saque", "segurança", "saldo", "risco"],
        sections: [
            {
                title: "O que é margem de segurança",
                content: [
                    "Margem de segurança é a parte do saldo que sobra depois de considerar compromissos importantes.",
                    "Ela serve para impedir que uma decisão aparentemente pequena deixe o mês vulnerável.",
                    "Quanto menor a margem, maior o risco de depender de crédito ou atrasar compromissos."
                ],
            },
            {
                title: "Saque não é só saída",
                content: [
                    "Um saque reduz o saldo atual e também reduz sua flexibilidade.",
                    "Se o saque consome uma parte grande do saldo, qualquer imprevisto fica mais difícil de lidar.",
                    "Por isso, a análise do saque deve considerar percentual do saldo, e não apenas o valor absoluto."
                ],
            },
            {
                title: "Como interpretar percentuais",
                content: [
                    "Um saque pequeno em valor pode ser grande em impacto se o saldo for baixo.",
                    "Usar 10% do saldo pode ser tranquilo. Usar 60% pode ser arriscado, dependendo do mês.",
                    "O ideal é analisar o saque junto com recorrentes, metas e próximos compromissos."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Você tem R$ 800 de saldo e quer sacar R$ 400.",
            items: [
                "Saldo atual: R$ 800",
                "Saque: R$ 400",
                "Uso do saldo: 50%",
                "Saldo restante: R$ 400",
                "Conclusão: o saque pode ser possível, mas reduz bastante sua margem."
            ],
        },
        commonMistakes: [
            "Olhar apenas se tem saldo suficiente.",
            "Ignorar contas que ainda vão vencer.",
            "Fazer saques grandes sem revisar o mês.",
            "Não considerar gastos recorrentes antes de sacar."
        ],
        checklist: [
            "Esse saque é necessário?",
            "Quanto do saldo ele consome?",
            "Tenho contas próximas?",
            "Tenho reserva ou margem depois do saque?",
            "Esse saque atrapalha alguma meta?"
        ],
        nextLessons: ["orcamento-mensal", "gastos-fixos-recorrentes"],
    },
    {
        id: 7,
        slug: "dividas-cartao-juros",
        title: "Dívidas, cartão e juros",
        category: "Crédito",
        level: "Avançado",
        readingTime: "10 min",
        icon: "bi-credit-card-2-front",
        color: "#f59e0b",
        summary: "Entenda como juros e parcelamentos podem virar bola de neve.",
        description:
            "Cartão de crédito pode ser ferramenta ou armadilha dependendo do uso.",
        practicalUse:
            "Conecta com futuras telas de cartão, bancos e recomendações financeiras.",
        tags: ["cartão", "juros", "dívidas", "parcelamento"],
        sections: [
            {
                title: "Crédito não é renda",
                content: [
                    "Limite de cartão não é dinheiro extra. É dinheiro emprestado que precisará ser pago depois.",
                    "O erro mais comum é tratar limite como se fosse aumento de renda.",
                    "Quando isso acontece, o orçamento parece confortável no presente, mas fica pressionado no futuro."
                ],
            },
            {
                title: "Juros e efeito bola de neve",
                content: [
                    "Juros fazem a dívida crescer com o tempo.",
                    "Quando a pessoa paga apenas parte da fatura ou entra no rotativo, a dívida pode aumentar rapidamente.",
                    "O problema não é apenas dever, mas dever em uma modalidade cara."
                ],
            },
            {
                title: "Parcelamento",
                content: [
                    "Parcelar pode ajudar em compras maiores, mas também compromete renda futura.",
                    "Muitas parcelas pequenas somadas podem virar um gasto fixo pesado.",
                    "Antes de parcelar, o ideal é perguntar: essa parcela cabe no orçamento dos próximos meses?"
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Você parcela três compras pequenas ao mesmo tempo.",
            items: [
                "Parcela 1: R$ 80",
                "Parcela 2: R$ 120",
                "Parcela 3: R$ 95",
                "Total mensal comprometido: R$ 295",
                "Conclusão: compras pequenas podem virar uma obrigação fixa relevante."
            ],
        },
        commonMistakes: [
            "Confundir limite com renda.",
            "Parcelar sem somar parcelas existentes.",
            "Pagar só o mínimo da fatura.",
            "Ignorar juros por olhar só o valor da parcela."
        ],
        checklist: [
            "Sei quanto já tenho parcelado?",
            "A fatura cabe no orçamento?",
            "Estou pagando juros?",
            "Essa compra é necessária agora?",
            "Tenho plano para quitar dívidas caras?"
        ],
        nextLessons: ["orcamento-mensal", "margem-de-seguranca"],
    },
    {
        id: 8,
        slug: "risco-liquidez-retorno",
        title: "Risco, liquidez e retorno",
        category: "Investimentos",
        level: "Intermediário",
        readingTime: "9 min",
        icon: "bi-graph-up-arrow",
        color: "#0ea5e9",
        summary: "Aprenda os três pilares antes de comparar investimentos.",
        description:
            "Todo investimento envolve relação entre risco, liquidez e retorno.",
        practicalUse:
            "Conecta com a página de Investimentos e simulações por perfil.",
        tags: ["investimentos", "risco", "liquidez", "retorno"],
        sections: [
            {
                title: "Os três pilares",
                content: [
                    "Risco é a chance de o resultado ser diferente do esperado.",
                    "Liquidez é a facilidade de transformar o investimento em dinheiro disponível.",
                    "Retorno é o ganho esperado ou realizado."
                ],
            },
            {
                title: "Não existe melhor investimento isolado",
                content: [
                    "Um investimento pode ser bom para uma reserva e ruim para longo prazo.",
                    "Outro pode ter bom retorno, mas alta oscilação.",
                    "A escolha depende do objetivo, prazo, tolerância a risco e necessidade de acesso ao dinheiro."
                ],
            },
            {
                title: "Rentabilidade não é tudo",
                content: [
                    "Olhar só para retorno pode levar a decisões ruins.",
                    "Para dinheiro de emergência, liquidez e segurança importam mais.",
                    "Para longo prazo, pode fazer sentido aceitar mais oscilação, desde que a pessoa entenda o risco."
                ],
            },
        ],
        example: {
            title: "Exemplo prático",
            description:
                "Você tem R$ 2.000 guardados para emergência.",
            items: [
                "Objetivo: emergência",
                "Prioridade: segurança e liquidez",
                "Menor prioridade: maior retorno possível",
                "Conclusão: o investimento precisa combinar com o objetivo."
            ],
        },
        commonMistakes: [
            "Escolher investimento só pela rentabilidade.",
            "Colocar reserva em produto sem liquidez.",
            "Assumir risco sem entender prazo.",
            "Comparar investimentos com objetivos diferentes."
        ],
        checklist: [
            "Qual é o objetivo desse dinheiro?",
            "Quando posso precisar dele?",
            "Posso aceitar oscilação?",
            "Entendo o risco?",
            "A liquidez combina com meu objetivo?"
        ],
        nextLessons: ["reserva-de-emergencia", "planejamento-de-metas"],
    },
];

export function getLessonBySlug(slug?: string) {
    return financialEducationLessons.find((lesson) => lesson.slug === slug);
}

export function getRecommendedLessons(slugs: string[]) {
    return financialEducationLessons.filter((lesson) => slugs.includes(lesson.slug));
}