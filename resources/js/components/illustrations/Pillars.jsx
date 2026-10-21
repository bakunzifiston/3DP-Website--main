// Spot illustrations for the three service pillars: Train, Build, Advise.
// Geometric, single-weight line work on a light panel, using brand tokens.

const stroke = { stroke: 'var(--navy-800)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Frame({ label, className, children }) {
  return (
    <svg className={`h-auto w-full ${className}`} viewBox="0 0 320 220" fill="none" role="img" aria-label={label}>
      <rect x="0.5" y="0.5" width="319" height="219" rx="10" fill="var(--navy-50)" stroke="var(--line)" />
      <g opacity="0.6" stroke="var(--navy-100)">
        {[44, 88, 132, 176].map((y) => (
          <path key={y} d={`M0 ${y}h320`} />
        ))}
      </g>
      {children}
    </svg>
  );
}

export function TrainIllustration({ className = '' }) {
  return (
    <Frame className={className} label="Illustration: a trainer presenting a chart to a group of learners">
      {/* Board */}
      <rect x="92" y="30" width="136" height="88" rx="6" fill="var(--surface)" {...stroke} />
      <path d="M160 118v18M140 136h40" {...stroke} />
      <rect x="108" y="82" width="14" height="22" rx="1.5" fill="var(--navy-700)" />
      <rect x="128" y="68" width="14" height="36" rx="1.5" fill="var(--navy-700)" />
      <rect x="148" y="54" width="14" height="50" rx="1.5" fill="var(--navy-700)" />
      <path d="M176 92l14-12 12 6 14-22" stroke="var(--gold-600)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="216" cy="64" r="3.5" fill="var(--gold-500)" />
      {/* Learners */}
      {[70, 128, 192, 250].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="160" r="11" fill={i === 1 ? 'var(--gold-500)' : 'var(--surface)'} {...stroke} />
          <path d={`M${x - 20} 198a20 20 0 0140 0`} fill="var(--surface)" {...stroke} />
        </g>
      ))}
    </Frame>
  );
}

export function BuildIllustration({ className = '' }) {
  return (
    <Frame className={className} label="Illustration: data stored in a database flowing through a processing block into a dashboard">
      {/* Database */}
      <ellipse cx="62" cy="80" rx="30" ry="9" fill="var(--surface)" {...stroke} />
      <path d="M32 80v58c0 5 13.4 9 30 9s30-4 30-9V80M32 109c0 5 13.4 9 30 9s30-4 30-9" {...stroke} />
      {/* Flow */}
      <path d="M100 112h28M196 112h22" stroke="var(--gold-600)" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      {/* Processing block */}
      <rect x="130" y="80" width="64" height="64" rx="8" fill="var(--navy-800)" />
      <rect x="144" y="94" width="16" height="16" rx="2" fill="var(--gold-500)" />
      <rect x="164" y="94" width="16" height="16" rx="2" stroke="#fff" strokeWidth="1.6" />
      <rect x="144" y="114" width="16" height="16" rx="2" stroke="#fff" strokeWidth="1.6" />
      <rect x="164" y="114" width="16" height="16" rx="2" stroke="#fff" strokeWidth="1.6" />
      {/* Dashboard */}
      <rect x="220" y="56" width="80" height="110" rx="6" fill="var(--surface)" {...stroke} />
      <path d="M220 74h80" {...stroke} />
      <circle cx="260" cy="104" r="16" stroke="var(--navy-100)" strokeWidth="7" />
      <path d="M260 88a16 16 0 0115.2 21" stroke="var(--teal-600)" strokeWidth="7" />
      <path d="M232 138h24M232 150h44" stroke="var(--line-strong)" strokeWidth="5" strokeLinecap="round" />
    </Frame>
  );
}

export function AdviseIllustration({ className = '' }) {
  return (
    <Frame className={className} label="Illustration: a strategic roadmap with milestones protected by a data governance shield">
      {/* Roadmap */}
      <path d="M30 176c40 0 40-48 84-48s46-48 92-48" stroke="var(--navy-700)" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
      {[
        [30, 176],
        [114, 128],
        [206, 80],
      ].map(([x, y], i) => (
        <circle key={x} cx={x} cy={y} r="8" fill={i === 2 ? 'var(--gold-500)' : 'var(--surface)'} {...stroke} />
      ))}
      <path d="M206 72V40l22 8-22 8" fill="var(--gold-500)" {...stroke} />
      {/* Shield */}
      <path d="M258 96l34 14v28c0 22-14 38-34 46-20-8-34-24-34-46v-28z" fill="var(--surface)" {...stroke} />
      <path d="M244 140l10 10 20-22" stroke="var(--teal-600)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function PillarIllustration({ pillar, className = '' }) {
  if (pillar === 'train') return <TrainIllustration className={className} />;
  if (pillar === 'build') return <BuildIllustration className={className} />;
  if (pillar === 'advise') return <AdviseIllustration className={className} />;
  return null;
}
