// Hero visual: raw data sources flow through a cleaning/modelling stage into an analytics
// dashboard, which produces a decision. Pure SVG using the brand tokens from index.css.
// Motion: the stages appear in data-flow order, then small "packets" keep travelling along the connectors.
import { useReducedMotion } from '../../lib/motion.jsx';

const css = `
.hdf-flow { stroke-dasharray: 5 7; animation: hdf-dash 1.6s linear infinite; }
.hdf-pulse { transform-box: fill-box; transform-origin: center; animation: hdf-pulse 2.8s ease-in-out infinite; }
.hdf-bar { transform-box: fill-box; transform-origin: bottom; animation: hdf-grow 0.9s cubic-bezier(.2,.7,.2,1) both; }
.hdf-line { stroke-dasharray: 260; stroke-dashoffset: 260; animation: hdf-draw 1.4s ease forwards 1.3s; }
.hdf-in { opacity: 0; transform-box: fill-box; animation: hdf-in 0.6s cubic-bezier(.2,.7,.2,1) forwards; }
.hdf-wire { opacity: 0; animation: hdf-fade 0.5s ease forwards; }
.hdf-pop { transform-box: fill-box; transform-origin: center; transform: scale(0); animation: hdf-pop 0.55s cubic-bezier(.3,1.4,.5,1) forwards; }
@keyframes hdf-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes hdf-fade { to { opacity: 1; } }
@keyframes hdf-pop { to { transform: scale(1); } }
@keyframes hdf-dash { to { stroke-dashoffset: -24; } }
@keyframes hdf-pulse { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: 0; transform: scale(1.35); } }
@keyframes hdf-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes hdf-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .hdf-flow, .hdf-pulse, .hdf-bar { animation: none; }
  .hdf-line { animation: none; stroke-dashoffset: 0; }
  .hdf-in, .hdf-wire { animation: none; opacity: 1; }
  .hdf-pop { animation: none; transform: none; }
}
`;

const label = { fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, fill: 'var(--navy-800)' };
const caption = { fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', fill: 'var(--ink-faint)' };

function SourceCard({ y, title, delay, children }) {
  return (
    <g className="hdf-in" style={{ animationDelay: delay }}>
      <rect x="12" y={y} width="140" height="62" rx="8" fill="var(--surface)" stroke="var(--line-strong)" />
      <g transform={`translate(26 ${y + 17})`}>{children}</g>
      <text x="62" y={y + 36} style={label}>
        {title}
      </text>
    </g>
  );
}

// Connector paths, shared by the dashed wires and the packets that travel along them.
const SOURCE_WIRES = [
  'M152 69 C 180 69, 172 190, 200 196',
  'M152 207 C 176 207, 178 214, 200 214',
  'M152 345 C 180 345, 172 236, 200 232',
];
const OUTPUT_WIRES = ['M318 214 C 340 214, 334 130, 352 128', 'M452 232 L 452 300'];

// A small dot that moves along a connector and fades at both ends, looping forever.
function Packet({ path, color, begin, dur = 2.2 }) {
  return (
    <circle r="3.2" fill={color} opacity="0">
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </circle>
  );
}

export default function HeroDataFlow({ className = '' }) {
  const reducedMotion = useReducedMotion();
  const bars = [
    { x: 382, h: 34 },
    { x: 404, h: 52 },
    { x: 426, h: 44 },
    { x: 448, h: 70 },
    { x: 470, h: 62 },
    { x: 492, h: 86 },
  ];
  return (
    <svg
      className={`h-auto w-full ${className}`}
      viewBox="0 0 560 430"
      fill="none"
      role="img"
      aria-label="Diagram: raw data from databases, spreadsheets and forms flows into a cleaning and modelling stage, then into an analytics dashboard that leads to an informed business decision."
    >
      <style>{css}</style>

      {/* Stage captions */}
      <text x="12" y="20" style={caption}>RAW DATA</text>
      <text x="196" y="20" style={caption}>PIPELINE</text>
      <text x="356" y="20" style={caption}>INSIGHT</text>

      {/* Connectors: sources -> pipeline */}
      <g className="hdf-wire" style={{ animationDelay: '0.45s' }} stroke="var(--navy-600)" strokeWidth="1.6" strokeLinecap="round">
        {SOURCE_WIRES.map((d) => (
          <path key={d} className="hdf-flow" d={d} />
        ))}
      </g>
      {/* pipeline -> dashboard, dashboard -> decision */}
      <g className="hdf-wire" style={{ animationDelay: '0.85s' }} stroke="var(--gold-600)" strokeWidth="1.8" strokeLinecap="round">
        {OUTPUT_WIRES.map((d) => (
          <path key={d} className="hdf-flow" d={d} />
        ))}
      </g>

      {/* Data packets: raw records travel into the pipeline, insights travel out to the decision. */}
      {!reducedMotion && (
        <g aria-hidden="true">
          {SOURCE_WIRES.map((d, i) => (
            <Packet key={d} path={d} color="var(--navy-600)" begin={1.6 + i * 0.7} />
          ))}
          <Packet path={OUTPUT_WIRES[0]} color="var(--gold-600)" begin={2.4} />
          <Packet path={OUTPUT_WIRES[1]} color="var(--gold-600)" begin={3.1} dur={1.6} />
        </g>
      )}

      {/* Sources */}
      <SourceCard y={38} title="Databases" delay="0.1s">
        <ellipse cx="12" cy="4" rx="12" ry="4" stroke="var(--navy-700)" strokeWidth="1.6" />
        <path d="M0 4v20c0 2.2 5.4 4 12 4s12-1.8 12-4V4M0 14c0 2.2 5.4 4 12 4s12-1.8 12-4" stroke="var(--navy-700)" strokeWidth="1.6" />
      </SourceCard>
      <SourceCard y={176} title="Spreadsheets" delay="0.2s">
        <rect x="0" y="0" width="24" height="28" rx="2" stroke="var(--teal-600)" strokeWidth="1.6" />
        <path d="M0 9h24M0 18h24M9 0v28" stroke="var(--teal-600)" strokeWidth="1.6" />
      </SourceCard>
      <SourceCard y={314} title="Field data" delay="0.3s">
        <rect x="2" y="0" width="20" height="28" rx="2" stroke="var(--gold-600)" strokeWidth="1.6" />
        <path d="M7 8h10M7 14h10M7 20h6" stroke="var(--gold-600)" strokeWidth="1.6" strokeLinecap="round" />
      </SourceCard>

      {/* Pipeline: clean & model */}
      <g className="hdf-in" style={{ animationDelay: '0.55s' }}>
        <rect x="200" y="160" width="118" height="108" rx="10" fill="var(--navy-800)" />
        <path d="M228 184h62l-22 26v20l-18 8v-28z" stroke="var(--gold-500)" strokeWidth="1.8" strokeLinejoin="round" />
        <text x="259" y="256" textAnchor="middle" style={{ ...label, fill: '#fff', fontSize: 12.5 }}>
          Clean &amp; model
        </text>
      </g>

      {/* Dashboard */}
      <g className="hdf-in" style={{ animationDelay: '0.75s' }}>
        <rect x="352" y="34" width="196" height="198" rx="10" fill="var(--surface)" stroke="var(--line-strong)" />
        <path d="M352 44a10 10 0 0110-10h176a10 10 0 0110 10v18H352z" fill="var(--navy-50)" />
        <circle cx="368" cy="48" r="3.5" fill="var(--line-strong)" />
        <circle cx="380" cy="48" r="3.5" fill="var(--line-strong)" />
        <text x="532" y="52" textAnchor="end" style={{ ...label, fontSize: 11.5, fill: 'var(--ink-muted)' }}>
          Dashboard
        </text>
        <path d="M372 196h160" stroke="var(--line)" />
        <path d="M372 152h160M372 112h160" stroke="var(--line)" strokeDasharray="3 4" />
        {bars.map((b, i) => (
          <rect
            key={b.x}
            className="hdf-bar"
            x={b.x}
            y={196 - b.h}
            width="14"
            height={b.h}
            rx="2"
            fill={i === bars.length - 1 ? 'var(--gold-500)' : 'var(--navy-700)'}
            opacity={i === bars.length - 1 ? 1 : 0.85}
            style={{ animationDelay: `${0.95 + i * 0.08}s` }}
          />
        ))}
        <path className="hdf-line" d="M382 146 L404 136 L426 140 L448 112 L470 116 L499 88" stroke="var(--teal-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="hdf-pop" style={{ animationDelay: '2.5s' }} cx="499" cy="88" r="3.5" fill="var(--teal-600)" />
        <text x="372" y="218" style={{ ...label, fontSize: 11.5, fill: 'var(--ink-muted)', fontWeight: 500 }}>
          Trends, KPIs &amp; forecasts
        </text>
      </g>

      {/* Decision */}
      <g>
        <g className="hdf-pop" style={{ animationDelay: '1.5s' }}>
          <circle className="hdf-pulse" cx="452" cy="338" r="38" fill="var(--gold-500)" />
          <circle cx="452" cy="338" r="38" fill="var(--gold-500)" />
          <path d="M436 338l11 11 21-23" stroke="var(--navy-900)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text className="hdf-in" x="452" y="404" textAnchor="middle" style={{ ...label, fontSize: 14, animationDelay: '1.7s' }}>
          Informed decision
        </text>
      </g>
    </svg>
  );
}
