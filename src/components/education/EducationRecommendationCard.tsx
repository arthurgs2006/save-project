import { useNavigate } from "react-router-dom";
import type { EducationRecommendation } from "../../services/educationApi";

import "./EducationRecommendationCard.scss";

interface Props {
    recommendation: EducationRecommendation | null;
    compact?: boolean;
}

export default function EducationRecommendationCard({
    recommendation,
    compact = false,
}: Props) {
    const navigate = useNavigate();

    if (!recommendation) return null;

    function openLesson() {
        if (!recommendation?.recommendedLessonSlug) return;

        navigate(`/financial-education/${recommendation.recommendedLessonSlug}`);
    }

    return (
        <section
            className={`education-recommendation-card ${recommendation.riskLevel} ${
                compact ? "compact" : ""
            }`}
        >
            <div className="education-recommendation-top">
                <div
                    className="education-recommendation-icon"
                    style={{ backgroundColor: recommendation.color }}
                >
                    <i className={`bi ${recommendation.icon}`}></i>
                </div>

                <div>
                    <span>Educação financeira</span>
                    <h3>{recommendation.title}</h3>
                </div>
            </div>

            <p>{recommendation.message}</p>

            {recommendation.highlights?.length > 0 && !compact && (
                <div className="education-recommendation-highlights">
                    {recommendation.highlights.map((item) => (
                        <div key={item}>
                            <i className="bi bi-check2-circle"></i>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            )}

            <button type="button" onClick={openLesson}>
                {recommendation.actionLabel || "Aprender mais"}
                <i className="bi bi-arrow-right"></i>
            </button>
        </section>
    );
}