import { Link } from 'react-router-dom';
import Container from '../components/Container.jsx';
import Icon from '../components/ui/Icon.jsx';
import { usePageMeta } from '../lib/hooks.js';

const links = [
  { to: '/services', label: 'Our services', text: 'Training, data products, systems and strategy' },
  { to: '/programs', label: 'Programs', text: 'Cohort-based data training' },
  { to: '/contact', label: 'Contact us', text: 'Tell us what you are looking for' },
];

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden="true" />
      <Container className="relative flex min-h-[64vh] flex-col items-center justify-center py-20 text-center">
        <svg viewBox="0 0 120 64" className="h-16 w-auto" fill="none" aria-hidden="true">
          <rect x="18" y="34" width="16" height="26" className="fill-navy-800" />
          <rect x="42" y="20" width="16" height="40" className="fill-navy-800" />
          <rect x="66" y="40" width="16" height="20" className="fill-line-strong" strokeDasharray="3 3" />
          <path d="M14 40 L50 16 L74 30 L104 8" className="stroke-gold-500" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
        </svg>
        <p className="eyebrow mt-8">Error 404</p>
        <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.8rem)]">This page isn't in our data</h1>
        <p className="mt-4 max-w-[46ch] text-[1.05rem] text-ink-muted">
          The page you are looking for may have moved or no longer exists. Here are some places to continue.
        </p>
        <Link to="/" className="btn btn-primary btn-lg mt-8">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Back to home
        </Link>
        <ul className="mt-14 grid w-full max-w-[860px] gap-4 text-left sm:grid-cols-3">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} data-reveal className="card card-hover group flex h-full flex-col p-5 no-underline">
                <span className="flex items-center justify-between font-display font-semibold text-navy-800">
                  {l.label}
                  <Icon name="arrowRight" className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 text-[0.88rem] text-ink-muted">{l.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
