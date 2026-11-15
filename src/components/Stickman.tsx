import { cn } from "@/utils/cn";

type Props = {
  pose?: "run" | "idle" | "wave" | "jump";
  className?: string;
  stroke?: number;
};

export default function Stickman({ pose = "idle", className, stroke = 6 }: Props) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("stick overflow-visible", pose, className)}
      aria-hidden
    >
      <g className="sm-body">
        <circle cx="50" cy="18" r="11" />
        <line x1="50" y1="30" x2="50" y2="72" />
        <g className="sm-arm-l" style={{ transformOrigin: "50px 38px" }}>
          <polyline points="50,38 36,52 28,66" />
        </g>
        <g className="sm-arm-r" style={{ transformOrigin: "50px 38px" }}>
          <polyline points="50,38 64,52 72,66" />
        </g>
        <g className="sm-leg-l" style={{ transformOrigin: "50px 72px" }}>
          <polyline points="50,72 41,92 34,114" />
        </g>
        <g className="sm-leg-r" style={{ transformOrigin: "50px 72px" }}>
          <polyline points="50,72 59,92 66,114" />
        </g>
      </g>
    </svg>
  );
}
