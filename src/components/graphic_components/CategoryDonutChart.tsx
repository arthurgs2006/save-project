interface CategorySlice {
    label: string;
    value: number;
}

const COLORS = ["#4477ff", "#7ea8ff", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#fb923c", "#60a5fa"];

export default function CategoryDonutChart({
    items,
    monthLabel,
}: {
    items: CategorySlice[];
    monthLabel: string;
}) {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    if (total <= 0) {
        return (
            <div className="category-donut-empty">
                <i className="bi bi-pie-chart"></i>
                <p>Nenhum gasto registrado em {monthLabel}.</p>
                <small>Seus gastos por categoria vão aparecer aqui.</small>
            </div>
        );
    }

    const sorted = [...items].sort((a, b) => b.value - a.value);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    let offsetAcc = 0;
    const segments = sorted.map((item, index) => {
        const fraction = item.value / total;
        const dash = fraction * circumference;
        const segment = {
            ...item,
            color: COLORS[index % COLORS.length],
            dash,
            offset: offsetAcc,
            percent: fraction * 100,
        };
        offsetAcc += dash;
        return segment;
    });

    return (
        <div className="category-donut">
            <div className="category-donut-chart">
                <svg viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
                    {segments.map((segment) => (
                        <circle
                            key={segment.label}
                            cx="70" cy="70" r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="16"
                            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                            strokeDashoffset={-segment.offset}
                            transform="rotate(-90 70 70)"
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
                <div className="category-donut-center">
                    <span>Gastos</span>
                    <strong>
                        {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </strong>
                    <small>{monthLabel}</small>
                </div>
            </div>

            <ul className="category-donut-legend">
                {segments.map((segment) => (
                    <li key={segment.label}>
                        <span className="category-donut-dot" style={{ backgroundColor: segment.color }} />
                        <span className="category-donut-name">{segment.label}</span>
                        <span className="category-donut-percent">{segment.percent.toFixed(0)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
