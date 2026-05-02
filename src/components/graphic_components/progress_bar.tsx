import { Progress } from "reactstrap";

interface ProgressBarProps {
  percentage: number;
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <section className="mt-4">
      <h6 className="mb-2">Progresso - {percentage}%</h6>
      <Progress
        value={percentage}
        className="progress-bar-custom"
        style={{ height: "10px", borderRadius: "10px" }}
      />
    </section>
  );
}
