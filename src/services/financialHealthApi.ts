import { BENEFITS_API_URL } from "../config";

export interface FinancialHealthAnalyzeRequest {
    userId: string | number;

    balance: number;
    monthlyIncome: number;

    monthlyRecurringCredits: number;
    monthlyRecurringDebits: number;

    monthlyCredits: number;
    monthlyDebits: number;

    transactionsCount: number;

    goalsCount: number;
    activeGoalsCount: number;
    completedGoalsCount: number;

    goalsTargetTotal: number;
    goalsCurrentTotal: number;

    hasEmergencyReserve: boolean;

    lessonsOpened: number;
    lessonsCompleted: number;
}

export interface FinancialScorePillar {
    name: string;
    score: number;
    status: string;
    description: string;
    icon: string;
    color: string;
}

export interface FinancialScoreInsight {
    type: "success" | "warning" | "danger" | "info" | string;
    title: string;
    message: string;
    icon: string;
}

export interface FinancialRecommendedAction {
    title: string;
    description: string;
    route: string;
    lessonSlug: string;
    actionLabel: string;
    priority: "high" | "medium" | "low" | string;
    icon: string;
}

export interface FinancialScoreResponse {
    userId: string;
    score: number;
    level: string;
    summary: string;

    pillars: FinancialScorePillar[];

    strengths: FinancialScoreInsight[];
    warnings: FinancialScoreInsight[];

    recommendedActions: FinancialRecommendedAction[];

    mainLessonSlug: string;
    mainLessonTitle: string;
}

export async function analyzeFinancialHealth(
    payload: FinancialHealthAnalyzeRequest
): Promise<FinancialScoreResponse | null> {
    try {
        const url = `${BENEFITS_API_URL}/financial-health/analyze`;

        console.log("URL FINANCIAL HEALTH:", url);
        console.log("PAYLOAD FINANCIAL HEALTH:", payload);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const raw = await response.text();

        if (!response.ok) {
            console.error("Erro ao analisar saúde financeira:", {
                url,
                status: response.status,
                body: raw,
                payload,
            });

            return null;
        }

        return JSON.parse(raw);
    } catch (error) {
        console.warn("Não foi possível carregar o diagnóstico financeiro.", error);
        return null;
    }
}