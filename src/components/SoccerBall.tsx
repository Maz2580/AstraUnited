type SoccerBallProps = {
  className?: string;
  label?: string;
  /** Stroke colour for the line ball. Defaults to currentColor so the parent text colour drives it. */
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Refined line football based on Lucide lab "soccer-ball" (ISC). Stroke-only so
 * it reads as a clean designer mark and recolours via `stroke`/text colour.
 */
export function SoccerBall({
  className = "",
  label = "Astra football",
  stroke = "currentColor",
  strokeWidth = 1.6
}: SoccerBallProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M11.9 6.7s-3 1.3-5 3.6c0 0 0 3.6 1.9 5.9 0 0 3.1.7 6.2 0 0 0 1.9-2.3 1.9-5.9 0 .1-2-2.3-5-3.6" />
      <path d="M11.9 6.7V2" />
      <path d="M16.9 10.4s3-1.4 4.5-1.6" />
      <path d="M15 16.3s1.9 2.7 2.9 3.7" />
      <path d="M8.8 16.3S6.9 19 6 20" />
      <path d="M2.6 8.7C4 9 7 10.4 7 10.4" />
    </svg>
  );
}
