import { BENEFITS_API_URL } from "../config";

export type EducationRiskLevel =
    | "info"
    | "low"
    | "moderate"
    | "high"
    | "positive";

export interface EducationRecommendation {
    userId: string;
    context: string;

    riskLevel: EducationRiskLevel;
    title: string;
    message: string;

    recommendedLessonSlug: string;
    recommendedLessonTitle: string;
    actionLabel: string;

    icon: string;
    color: string;

    highlights: string[];
}

export interface EducationRecommendationParams {
    amount?: number;
    currentBalance?: number;

    income?: number;
    balance?: number;

    recurringCredits?: number;
    recurringDebits?: number;

    hasGoals?: boolean;
    hasEmergencyReserve?: boolean;

    goalTargetAmount?: number;
    goalCurrentAmount?: number;
    monthlyContribution?: number;
}

function buildQuery(params: EducationRecommendationParams) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const query = searchParams.toString();

    return query ? `?${query}` : "";
}

export async function getEducationRecommendation(
    userId: string | number,
    context: string,
    params: EducationRecommendationParams = {}
): Promise<EducationRecommendation | null> {
    try {
        const query = buildQuery(params);

        const url = `${BENEFITS_API_URL}/education/recommendations/user/${userId}/context/${context}${query}`;

        console.log("URL EDUCAÇÃO FINANCEIRA:", url);

        const response = await fetch(url);
        const raw = await response.text();

        if (!response.ok) {
            console.error("Erro ao buscar recomendação educativa:", {
                url,
                status: response.status,
                body: raw,
            });

            return null;
        }

        return JSON.parse(raw);
    } catch (error) {
        console.warn("Não foi possível carregar recomendação educativa.", error);
        return null;
    }
}