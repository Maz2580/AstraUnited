type SoccerBallProps = {
  className?: string;
  label?: string;
};

export function SoccerBall({ className = "", label = "Astra football" }: SoccerBallProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ballShade" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#edf2f4" />
          <stop offset="100%" stopColor="#aab4bc" />
        </radialGradient>
        <filter id="ballShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#001c2a" floodOpacity="0.28" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#ballShade)" filter="url(#ballShadow)" />
      <path
        d="M60 18 76 32 70 52H50L44 32Z"
        fill="#2e3036"
        stroke="#111820"
        strokeWidth="2"
      />
      <path d="M22 48 42 40 50 52 40 72 22 70Z" fill="#f8fbfd" stroke="#cfd7dd" strokeWidth="2" />
      <path d="M98 48 78 40 70 52 80 72 98 70Z" fill="#f8fbfd" stroke="#cfd7dd" strokeWidth="2" />
      <path d="M40 72 50 52H70L80 72 60 86Z" fill="#f8fbfd" stroke="#cfd7dd" strokeWidth="2" />
      <path d="M60 86 80 72 96 86 84 104 62 106Z" fill="#2e3036" stroke="#111820" strokeWidth="2" />
      <path d="M60 86 40 72 24 86 36 104 58 106Z" fill="#2e3036" stroke="#111820" strokeWidth="2" />
      <path d="M22 70 24 86M98 70 96 86M44 32 22 48M76 32 98 48" stroke="#dce3e8" strokeWidth="3" />
      <path
        d="M60 24 66 34H78L68 41 72 53 60 46 48 53 52 41 42 34H54Z"
        fill="#c81916"
        opacity="0.92"
      />
      <circle cx="60" cy="60" r="54" fill="none" stroke="#f8fbfd" strokeOpacity="0.64" strokeWidth="4" />
    </svg>
  );
}
