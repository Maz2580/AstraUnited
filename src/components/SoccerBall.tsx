import { useId } from "react";

type SoccerBallProps = {
  className?: string;
  label?: string;
};

// Generated truncated-icosahedron approximation (see Round 4.5 spec §1):
// one regular centre pentagon + five radially-squashed rim pentagons +
// curved quadratic seams. Numbers come from the approved prototype generator.
const CENTER_PENTAGON = "M100.0 68.0L130.4 90.1L118.8 125.9L81.2 125.9L69.6 90.1Z";
const RIM_PENTAGONS = [
  "M100.0 26.5L83.0 19.2L89.5 7.5L110.5 7.5L117.0 19.2Z",
  "M169.9 77.3L171.6 58.9L184.7 61.4L191.2 81.4L182.0 91.2Z",
  "M143.2 159.5L161.2 155.4L162.9 168.7L145.9 181.0L133.7 175.3Z",
  "M56.8 159.5L66.3 175.3L54.1 181.0L37.1 168.7L38.8 155.4Z",
  "M30.1 77.3L18.0 91.2L8.8 81.4L15.3 61.4L28.4 58.9Z"
];
const SEAMS = [
  "M100.0 68.0Q104.3 51.2 100.0 34.0",
  "M130.4 90.1Q147.7 89.0 162.8 79.6",
  "M118.8 125.9Q125.2 142.0 138.8 153.4",
  "M81.2 125.9Q67.9 137.0 61.2 153.4",
  "M69.6 90.1Q54.9 80.9 37.2 79.6"
];

/**
 * Realistic vector football (Round 4.5): white sphere radial gradient,
 * black pentagons, curved seams. This is the TEXTURE layer only — it is
 * meant to rotate. Pair it with a non-rotating <BallShade /> sibling so the
 * fixed light makes the flat circle read as a 3D sphere (the anti-wheel
 * trick). The ball is full-colour; it no longer recolours via stroke.
 */
export function SoccerBall({ className = "", label = "Astra football" }: SoccerBallProps) {
  // The ball renders twice on the homepage (rail + hero handoff); useId keeps
  // the gradient ids unique so the two SVGs don't silently share one def.
  const id = useId();
  const sphereId = `ball-sphere-${id}`;
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={sphereId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#f0f4f6" />
          <stop offset="88%" stopColor="#cfd8de" />
          <stop offset="100%" stopColor="#aab6c0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${sphereId})`} />
      <g stroke="#3a4750" strokeWidth="2.4" fill="none">
        {SEAMS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={CENTER_PENTAGON} fill="#10181d" />
      <g fill="#10181d">
        {RIM_PENTAGONS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="100" cy="100" r="95" fill="none" stroke="#8d9aa6" strokeWidth="2" />
    </svg>
  );
}

/**
 * Fixed lighting overlay for the ball: radial highlight up-left, soft shade
 * down-right. Must be a NON-ROTATING sibling of the rotating texture —
 * the stationary light over a rolling texture is what kills the wheel look.
 * Deliberately NO inset box-shadow ring (it created a "hollow" edge).
 */
export function BallShade({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-full ${className}`}
      style={{
        background:
          "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 40%), radial-gradient(circle at 72% 80%, rgba(2,10,18,0.42) 0%, rgba(2,10,18,0) 55%)"
      }}
    />
  );
}
