import { useNavigate } from "react-router-dom";
import type { FinancialScoreResponse } from "../../services/financialHealthApi";

import "./SaveScoreCard.scss";

interface Props {
    score: FinancialScoreResponse | null;
    compact?: boolean;
}

export default function SaveScoreCard({ score, compact = false }: Props) {
    const navigate = useNavigate();

    if (!score) return null;

    const mainAction = score.recommendedActions?.[0];

    function getScoreTone() {
        if (score.score >= 85) return "excellent";
        if (score.score >= 70) return "good";
        if (score.score >= 50) return "medium";
        return "danger";
    }

    function handleMainAction() {
        if (mainAction?.route) {
            navigate(mainAction.route);
            return;
        }

        if (score.mainLessonSlug) {
            navigate(`/financial-education/${score.mainLessonSlug}`);
            return;
        }

        navigate("/financial-education");
    }

    function openDiagnosis() {
        navigate("/financial-health");
    }

    return (
        <section className={`save-score-card ${getScoreTone()} ${compact ? "compact" : ""}`}>
            <div className="save-score-main">
                <div className="save-score-ring">
                    <svg viewBox="0 0 120 120">
                        <circle className="save-score-ring-bg" cx="60" cy="60" r="52" />
                        <circle
                            className="save-score-ring-progress"
                            cx="60"
                            cy="60"
                            r="52"
                            strokeDasharray={`${(score.score / 100) * 326.7} 326.7`}
                        />
                    </svg>

                    <div className="save-score-number">
                        <strong>{score.score}</strong>
                        <span>/100</span>
                    </div>
                </div>

                <div className="save-score-copy">
                    <span className="save-score-kicker">SaveScore</span>
                    <h3>{score.level}</h3>
                    <p>{score.summary}</p>

                    <div className="save-score-actions">
                        <button type="button" className="save-score-main-btn" onClick={openDiagnosis}>
                            Ver diagnóstico
                            <i className="bi bi-arrow-right"></i>
                        </button>

                        {mainAction && (
                            <button
                                type="button"
                                className="save-score-secondary-btn"
                                onClick={handleMainAction}
                            >
                                {mainAction.actionLabel || "Melhorar score"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {!compact && (
                <>
                    <div className="save-score-pillars">
                        {score.pillars.map((pillar) => (
                            <div className="save-score-pillar" key={pillar.name}>
                                <div
                                    className="save-score-pillar-icon"
                                    style={{ backgroundColor: pillar.color }}
                                >
                                    <i className={`bi ${pillar.icon}`}></i>
                                </div>

                                <div>
                                    <div className="save-score-pillar-header">
                                        <strong>{pillar.name}</strong>
                                        <span>{pillar.score}</span>
                                    </div>

                                    <div className="save-score-pillar-track">
                                        <div
                                            style={{
                                                width: `${pillar.score}%`,
                                                backgroundColor: pillar.color,
                                            }}
                                        />
                                    </div>

                                    <small>{pillar.status}</small>
                                </div>
                            </div>
                        ))}
                    </div>

                    {score.warnings?.length > 0 && (
                        <div className="save-score-alerts">
                            {score.warnings.slice(0, 2).map((warning) => (
                                <div className={`save-score-alert ${warning.type}`} key={warning.title}>
                                    <i className={`bi ${warning.icon}`}></i>

                                    <div>
                                        <strong>{warning.title}</strong>
                                        <p>{warning.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}