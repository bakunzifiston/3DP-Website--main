import { Link } from 'react-router-dom';
import Container from '../components/Container.jsx';
import Icon from '../components/ui/Icon.jsx';
import { ErrorState, Badge } from '../components/ui/Feedback.jsx';
import { Section, SectionHeading, ArrowLink, CtaBand, pillarMeta } from '../components/site/Blocks.jsx';
import { useSiteSettings } from '../components/site/SiteSettings.jsx';
import HeroDataFlow from '../components/illustrations/HeroDataFlow.jsx';
import { AudienceMark } from '../components/illustrations/Brand.jsx';
import { useApi, usePageMeta, useReveal } from '../lib/hooks.js';
import { formatDate } from '../lib/format.js';

export const steps = [
  { title: 'Understand', text: "We start with your business, your data, and the decisions you're actually trying to improve." },
  { title: 'Design', text: 'We design a program, product, or system around your specific gap, not a generic template.' },
  { title: 'Build or train', text: 'We build the system, or run the program, working directly alongside your team.' },
  { title: 'Sustain', text: 'We hand over the skills and structure your team needs to keep it running without us.' },
];

const audiences = [
  { kind: 'startups', title: 'Startups', text: 'Set up the right data foundations early, so growth doesn’t leave you with messy data later.' },
  { kind: 'smes', title: 'SMEs', text: 'Bring together spreadsheets, systems and paper records, and use them in everyday decisions.' },
  { kind: 'enterprises', title: 'Large enterprises', text: 'Get more value from the data you already have, and keep it compliant.' },
  { kind: 'individuals', title: 'Individuals', text: 'Build practical, job-ready data skills through structured, cohort-based programs.' },
];

function CardSkeleton({ count = 3, className = 'h-56' }) {
  return Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton ${className}`} aria-hidden="true" />);
}

function Hero() {
  const s = useSiteSettings();
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]" aria-hidden="true" />
      <Container className="relative grid items-center gap-12 pt-14 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pt-20 lg:pb-24">
        <div>
          <p className="eyebrow enter mb-5">{s.hero_eyebrow}</p>
          <h1 className="enter max-w-[17ch] text-[clamp(2.25rem,4.8vw,3.6rem)] leading-[1.05]" style={{ '--d': '90ms' }}>
            {s.hero_title}
          </h1>
          <p className="enter mt-6 max-w-[50ch] text-[1.12rem] leading-relaxed text-ink-muted" style={{ '--d': '180ms' }}>
            {s.hero_subtitle}
          </p>
          <div className="enter mt-9 flex flex-wrap gap-3" style={{ '--d': '270ms' }}>
            <Link to="/services" className="btn btn-primary btn-lg">
              Explore our services
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <Link to="/programs" className="btn btn-secondary btn-lg">
              Join a program
            </Link>
          </div>
        </div>
        <div className="enter" style={{ '--d': '150ms' }}>
          <HeroDataFlow className="mx-auto max-w-[580px]" />
        </div>
      </Container>

      {/* Pillar strip */}
      <div className="relative border-t border-line bg-mist">
        <Container as="ul" className="grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {Object.entries(pillarMeta).map(([key, p], i) => (
            <li key={key} className="enter" style={{ '--d': `${380 + i * 90}ms` }}>
              <Link
                to={`/services#${key}`}
                className="group flex items-center gap-4 py-6 no-underline md:px-6 md:first:pl-0 md:last:pr-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-navy-800 text-gold-400 transition-[transform,background-color] duration-300 group-hover:-translate-y-0.5 group-hover:bg-navy-700">
                  <Icon name={p.icon} className="h-[22px] w-[22px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.1rem] font-semibold text-navy-800">{p.label}</span>
                  <span className="block text-[0.9rem] text-ink-muted">{p.blurb}</span>
                </span>
                <Icon name="arrowRight" className="h-4 w-4 text-ink-faint transition-colors group-hover:text-navy-800" />
              </Link>
            </li>
          ))}
        </Container>
      </div>
    </section>
  );
}

function ServicesPreview() {
  const { data, error, loading, reload } = useApi('/public/services');
  const services = (data?.data || []).slice(0, 6);
  const ref = useReveal([services.length]);
  return (
    <Section tone="sand">
      <SectionHeading
        eyebrow="What we do"
        title="Training, data products, systems and strategy under one roof"
        intro="We meet you wherever you're starting from: a team that needs data skills, a business that needs a data product, or a strategy that needs to hold up under regulation."
        action={<ArrowLink to="/services">View all services</ArrowLink>}
      />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <CardSkeleton count={6} />}
          {services.map((service) => {
            const p = pillarMeta[service.pillar];
            return (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                data-reveal
                className="card card-hover group flex flex-col p-7 no-underline"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                    <Icon name={p?.icon || 'chart'} className="h-5 w-5" />
                  </span>
                  <Badge tone={p?.tone || 'neutral'}>{p?.label}</Badge>
                </div>
                <h3 className="text-[1.15rem]">{service.title}</h3>
                <p className="mt-2.5 flex-1 text-[0.95rem] leading-relaxed text-ink-muted">{service.summary}</p>
                <span className="link-arrow mt-5 text-[0.92rem]">
                  Learn more
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function HowWeWork() {
  const ref = useReveal();
  return (
    <Section tone="navy">
      <SectionHeading
        eyebrow="How we work"
        title="How an engagement runs"
        intro="Whether we're running a program or building a system, the shape of the work stays the same."
        dark
      />
      <ol ref={ref} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, i) => (
          <li key={step.title} data-reveal className="relative">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-500 font-display text-[0.95rem] font-semibold text-gold-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-white/15 lg:block" aria-hidden="true" />}
            </div>
            <h3 className="text-[1.12rem] !text-white">{step.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-white/70">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ProgramsPreview() {
  const { data, error, loading, reload } = useApi('/public/programs');
  const programs = (data?.data || []).slice(0, 3);
  if (!loading && !error && programs.length === 0) return null;
  return (
    <Section>
      <SectionHeading
        eyebrow="Capacity building"
        title="Programs that build real data skills"
        intro="Cohort-based and project-driven, for people starting a data career and professionals who can't step away from a full-time job."
        action={<ArrowLink to="/programs">All programs</ArrowLink>}
      />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading && <CardSkeleton count={2} className="h-72" />}
          {programs.map((program) => (
            <article key={program.id} data-reveal className="card flex flex-col overflow-hidden">
              <div className="h-1.5 bg-gold-500" aria-hidden="true" />
              <div className="flex flex-1 flex-col p-7 lg:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  {program.level && <Badge tone="navy">{program.level}</Badge>}
                  {program.accepting_applications ? <Badge tone="success">Applications open</Badge> : <Badge>Applications closed</Badge>}
                </div>
                <h3 className="text-[1.4rem]">
                  <Link to={`/programs/${program.slug}`} className="no-underline hover:text-navy-600">
                    {program.title}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-[0.98rem] leading-relaxed text-ink-muted">{program.summary}</p>
                {program.tracks?.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tracks">
                    {program.tracks.map((t) => (
                      <li key={t} className="rounded border border-line bg-sand px-2.5 py-1 text-[0.84rem] text-ink">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                  <span className="flex items-center gap-2 text-[0.88rem] text-ink-faint">
                    <Icon name="calendar" className="h-4 w-4" />
                    {program.next_intake ? `Next intake ${formatDate(program.next_intake)}` : program.format || 'Cohort-based'}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/programs/${program.slug}`} className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                    {program.accepting_applications && (
                      <Link to={`/programs/${program.slug}#apply`} className="btn btn-accent btn-sm">
                        Apply now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}

function AudiencesPreview() {
  const ref = useReveal();
  return (
    <Section tone="mist">
      <SectionHeading
        eyebrow="Who we serve"
        title="Whatever your size, the goal is the same"
        intro="Better decisions from the data you already have."
        action={<ArrowLink to="/who-we-serve">How we help each</ArrowLink>}
      />
      <div ref={ref} className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <div key={a.kind} data-reveal className="bg-surface p-7">
            <AudienceMark kind={a.kind} className="mb-5 h-11 w-11" />
            <h3 className="text-[1.1rem]">{a.title}</h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-muted">{a.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  const { data } = useApi('/public/testimonials');
  const items = data?.data || [];
  if (!items.length) return null;
  return (
    <Section tone="gold">
      <SectionHeading eyebrow="In their words" title="What our clients and learners say" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((t) => (
          <figure key={t.id} data-reveal className="card flex flex-col p-7">
            <Icon name="quote" className="mb-4 h-7 w-7 text-gold-600" />
            <blockquote className="flex-1 text-[1rem] leading-relaxed text-ink">{t.quote}</blockquote>
            <figcaption className="mt-6 border-t border-line pt-4 text-[0.9rem]">
              <span className="block font-semibold text-navy-800">{t.author_name}</span>
              <span className="text-ink-faint">{[t.author_title, t.organization].filter(Boolean).join(', ')}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function LatestInsights() {
  const { data, loading } = useApi('/public/posts?pageSize=3');
  const posts = data?.data || [];
  if (!loading && posts.length === 0) return null;
  return (
    <Section>
      <SectionHeading
        eyebrow="Insights"
        title="Practical thinking on data and decisions"
        action={<ArrowLink to="/insights">All insights</ArrowLink>}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading && <CardSkeleton count={3} />}
        {posts.map((post) => (
          <article key={post.id} data-reveal className="card card-hover group relative flex flex-col overflow-hidden">
            {post.cover_image ? (
              <div className="overflow-hidden">
                <img src={post.cover_image} alt="" className="zoom-img aspect-[16/9] w-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="bg-grid flex aspect-[16/9] items-end bg-navy-50 p-5" aria-hidden="true">
                <span className="flex items-end gap-1.5">
                  <span className="h-5 w-3 rounded-sm bg-navy-800" />
                  <span className="h-8 w-3 rounded-sm bg-navy-800" />
                  <span className="h-11 w-3 rounded-sm bg-gold-500" />
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[0.8rem] font-semibold tracking-wide text-gold-700 uppercase">{post.category || 'Insight'}</p>
              <h3 className="mt-2 text-[1.12rem] leading-snug">
                <Link to={`/insights/${post.slug}`} className="no-underline after:absolute after:inset-0 group-hover:text-navy-600">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2.5 line-clamp-3 flex-1 text-[0.93rem] text-ink-muted">{post.excerpt}</p>
              <p className="mt-4 text-[0.83rem] text-ink-faint">{formatDate(post.published_at)}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export default function Home() {
  usePageMeta(
    null,
    '3DP (Data Driven Decisions Partners) helps companies and individuals in Kigali and across East Africa become data driven through training, data products, data-driven systems, and strategy.'
  );
  return (
    <>
      <Hero />
      <ServicesPreview />
      <HowWeWork />
      <ProgramsPreview />
      <AudiencesPreview />
      <Testimonials />
      <LatestInsights />
      <CtaBand />
    </>
  );
}
