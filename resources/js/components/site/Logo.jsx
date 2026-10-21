import { Link } from 'react-router-dom';
import logoFullColor from '../../assets/logo/logo-fullcolor.png';
import logoReversed from '../../assets/logo/logo-reversed.png';

// The official 3DP logo (460×215). Always rendered at its native aspect ratio, never recoloured.
// variant="reversed" is for navy backgrounds. object-contain + self-start keep the native aspect ratio even
// inside stretching flex/grid parents.
export default function Logo({ variant = 'color', className = 'h-12', to = '/', label = '3DP home' }) {
  const img = (
    <img
      src={variant === 'reversed' ? logoReversed : logoFullColor}
      alt="3DP | Data Driven Decisions Partners"
      width="460"
      height="215"
      className={`w-auto max-w-full shrink-0 self-start object-contain object-left ${className}`}
    />
  );
  if (!to) return img;
  return (
    <Link to={to} aria-label={label} className="inline-flex shrink-0 items-center rounded-sm">
      {img}
    </Link>
  );
}
