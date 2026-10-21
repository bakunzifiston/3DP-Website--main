// Shared building blocks for public pages, so every page has the same rhythm and header treatment.
import { Link } from 'react-router-dom';
import Container from '../Container.jsx';
import Icon from '../ui/Icon.jsx';

// Page-level header used at the top of every inner page.
export function PageHeader({ eyebrow, title, intro, breadcrumbs = [], aside, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-mist">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
      <Container className={`relative py-14 lg:py-20 ${aside ? 'grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]' : ''}`}>
        <div>
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="enter mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem] text-ink-faint">
                <li>
                  <Link to="/" className="no-underline hover:text-navy-800">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((b, i) => (
                  <li key={b.label} className="flex items-center gap-1.5">
                    <Icon name="chevronRight" className="h-3.5 w-3.5" />
                    {b.to && i < breadcrumbs.length - 1 ? (
                      <Link to={b.to} className="no-underline hover:text-navy-800">
                        {b.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-ink-muted">
                        {b.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && <p className="eyebrow enter mb-4" style={{ '--d': '60ms' }}>{eyebrow}</p>}
          <h1 className="enter max-w-[22ch] text-[clamp(2rem,4.2vw,3.1rem)] leading-[1.08]" style={{ '--d': '120ms' }}>
            {title}
          </h1>
          {intro && (
            <p className="enter mt-5 max-w-[60ch] text-[1.1rem] leading-relaxed text-ink-muted" style={{ '--d': '200ms' }}>
              {intro}
            </p>
          )}
          {children && (
            <div className="enter" style={{ '--d': '280ms' }}>
              {children}
            </div>
          )}
        </div>
        {aside && (
          <div className="enter hidden lg:block" style={{ '--d': '200ms' }}>
            {aside}
          </div>
        )}
      </Container>
    </section>
  );
}

// Vertical rhythm for page sections. Pages alternate white with brand tints so sections read as distinct bands:
// "default" (white), "mist" (cool navy tint), "sand" (warm), "gold" (soft gold), "navy" (dark band; pair with
// <SectionHeading dark />). "surface" is kept as an alias of "sand" for older callers.
export const sectionTones = {
  default: 'bg-surface',
  mist: 'bg-mist',
  sand: 'bg-sand',
  surface: 'bg-sand',
  gold: 'bg-cream',
  navy: 'relative overflow-hidden bg-navy-800 text-white/80',
};

export function Section({ id, tone = 'default', className = '', containerClassName = '', children, ...props }) {
  const tones = sectionTones;
  return (
    <section id={id} className={`py-16 lg:py-24 ${tones[tone]} ${className}`} {...props}>
      {tone === 'navy' && <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />}
      <Container className={`relative ${containerClassName}`}>{children}</Container>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = 'left', action, dark = false, className = 'mb-12' }) {
  const centered = align === 'center';
  return (
    <div className={`${className} ${action ? 'flex flex-col gap-6 md:flex-row md:items-end md:justify-between' : ''}`}>
      <div data-reveal className={centered ? 'mx-auto max-w-[680px] text-center' : 'max-w-[680px]'}>
        {eyebrow && <p className={`eyebrow mb-3.5 ${dark ? '!text-gold-400' : ''} ${centered ? 'justify-center' : ''}`}>{eyebrow}</p>}
        <h2 className={`text-[clamp(1.65rem,3vw,2.35rem)] ${dark ? '!text-white' : ''}`}>{title}</h2>
        {intro && <p className={`mt-4 text-[1.05rem] leading-relaxed ${dark ? 'text-white/70' : 'text-ink-muted'}`}>{intro}</p>}
      </div>
      {action && (
        <div data-reveal="fade" className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export function ArrowLink({ to, children, className = '' }) {
  return (
    <Link to={to} className={`link-arrow ${className}`}>
      {children}
      <Icon name="arrowRight" className="h-4 w-4" />
    </Link>
  );
}

// Closing call-to-action band used at the bottom of most pages.
export function CtaBand({
  title = 'Ready to make better decisions with your data?',
  text = "Tell us where you are today. We'll suggest a practical next step, whether that's training, a data product, or a strategy conversation.",
  primary = { to: '/contact', label: 'Start a conversation' },
  secondary = { to: '/programs', label: 'Explore programs' },
}) {
  return (
    <section className="relative overflow-hidden bg-navy-800">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <svg className="pointer-events-none absolute -right-10 bottom-0 hidden h-full text-white/[0.06] md:block" viewBox="0 0 300 200" fill="currentColor" aria-hidden="true">
        <rect x="40" y="110" width="50" height="90" />
        <rect x="110" y="60" width="50" height="140" />
        <rect x="180" y="10" width="50" height="190" />
      </svg>
      <Container className="relative flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div data-reveal className="max-w-[620px]">
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] !text-white">{title}</h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-white/70">{text}</p>
        </div>
        <div data-reveal className="flex flex-wrap gap-3">
          <Link to={primary.to} className="btn btn-accent btn-lg">
            {primary.label}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
          {secondary && (
            <Link to={secondary.to} className="btn btn-on-dark btn-lg">
              {secondary.label}
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}

export const pillarMeta = {
  train: { label: 'Train', icon: 'train', blurb: 'Build data talent and skills', tone: 'gold' },
  build: { label: 'Build', icon: 'build', blurb: 'Data products and systems', tone: 'navy' },
  advise: { label: 'Advise', icon: 'advise', blurb: 'Strategy, research and compliance', tone: 'teal' },
};
