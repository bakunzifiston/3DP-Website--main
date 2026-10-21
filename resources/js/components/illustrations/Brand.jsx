// Brand motif visuals built from the logo's three ascending bars.

// Audience marker: the number of highlighted bars grows with organisation size.
// kind: 'individuals' | 'startups' | 'smes' | 'enterprises' | 'public'
export function AudienceMark({ kind, className = 'h-12 w-12' }) {
  const level = { individuals: 1, startups: 1, smes: 2, enterprises: 3, public: 3 }[kind] ?? 1;
  const bars = [
    { x: 6, h: 16 },
    { x: 20, h: 26 },
    { x: 34, h: 36 },
  ];
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="8" fill="var(--navy-50)" />
      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={42 - b.h}
          width="9"
          height={b.h}
          rx="1.5"
          fill={i < level ? (i === level - 1 ? 'var(--gold-500)' : 'var(--navy-800)') : 'var(--navy-100)'}
        />
      ))}
    </svg>
  );
}

// About page visual: scattered points (questions) converge through three bars into a single direction.
export function AboutIllustration({ className = '' }) {
  const dots = [
    [40, 60],
    [70, 120],
    [34, 170],
    [92, 210],
    [60, 260],
    [110, 80],
    [120, 160],
  ];
  return (
    <svg
      className={`h-auto w-full ${className}`}
      viewBox="0 0 420 320"
      fill="none"
      role="img"
      aria-label="Illustration: scattered data points converging into the three 3DP bars and a clear direction forward"
    >
      <rect x="0.5" y="0.5" width="419" height="319" rx="12" fill="var(--surface)" stroke="var(--line)" />
      <g stroke="var(--navy-100)">
        {[80, 160, 240].map((y) => (
          <path key={y} d={`M0 ${y}h420`} />
        ))}
      </g>
      {dots.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x} ${y} C ${x + 60} ${y}, 150 200, 186 200`} stroke="var(--line-strong)" strokeWidth="1.4" />
          <circle cx={x} cy={y} r="5" fill="var(--navy-600)" opacity="0.55" />
        </g>
      ))}
      <rect x="186" y="170" width="26" height="60" rx="2" fill="var(--navy-800)" />
      <rect x="220" y="140" width="26" height="90" rx="2" fill="var(--navy-800)" />
      <rect x="254" y="100" width="26" height="130" rx="2" fill="var(--navy-800)" />
      <path d="M290 100 L380 56" stroke="var(--gold-600)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M366 52l15 4-6 14" stroke="var(--gold-600)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="186" y="262" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, fill: 'var(--navy-800)' }}>
        Data → Insight → Decision
      </text>
    </svg>
  );
}
