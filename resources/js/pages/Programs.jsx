import { Link } from 'react-router-dom';
import { PageHeader, Section, SectionHeading, CtaBand, ArrowLink } from '../components/site/Blocks.jsx';
import Icon from '../components/ui/Icon.jsx';
import { LoadingState, ErrorState, EmptyState, Badge } from '../components/ui/Feedback.jsx';
import { useApi, usePageMeta, useReveal } from '../lib/hooks.js';
import { formatDate } from '../lib/format.js';

// Key facts that are shown only when the CMS has a value for them.
export function programFacts(p) {
  return [
    { icon: 'layers', label: 'Format', value: p.format },
    { icon: 'trendUp', label: 'Level', value: p.level },
    { icon: 'clock', label: 'Duration', value: p.duration },
    { icon: 'calendar', label: 'Schedule', value: p.schedule },
    { icon: 'calendar', label: 'Next intake', value: p.next_intake ? formatDate(p.next_intake) : null },
    { icon: 'users', label: 'Who it is for', value: p.audience },
    { icon: 'book', label: 'Fee', value: p.fee },
  ].filter((f) => f.value);
}

function ProgramCard({ program }) {
  const facts = programFacts(program).filter((f) => f.label !== 'Who it is for');
  return (
    <article data-reveal className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-line bg-navy-50/60 px-7 pt-7 pb-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {program.accepting_applications ? <Badge tone="success">Applications open</Badge> : <Badge>Applications closed</Badge>}
          {program.tracks?.slice(0, 3).map((t) => (
            <Badge key={t} tone="navy">
              {t}
            </Badge>
          ))}
        </div>
        <h2 className="mt-4 text-[1.5rem]">
          <Link to={`/programs/${program.slug}`} className="no-underline hover:text-navy-600">
            {program.title}
          </Link>
        </h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">{program.summary}</p>
      </div>
      <div className="flex flex-1 flex-col px-7 pt-6 pb-7 sm:px-8">
        {facts.length > 0 && (
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-3">
                <Icon name={f.icon} className="mt-0.5 h-[18px] w-[18px] text-gold-600" />
                <div>
                  <dt className="text-[0.78rem] font-semibold tracking-wide text-ink-faint uppercase">{f.label}</dt>
                  <dd className="text-[0.94rem] text-ink">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
          <Link to={`/programs/${program.slug}`} className="btn btn-secondary">
            View program
          </Link>
          {program.accepting_applications && (
            <Link to={`/programs/${program.slug}#apply`} className="btn btn-accent">
              Apply now
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Programs() {
  usePageMeta(
    'Programs',
    'Cohort-based data training from 3DP: the Data Talents Program and Afterwork Data Analysis for Professionals.'
  );
  const { data, error, loading, reload } = useApi('/public/programs');
  const programs = data?.data || [];
  const revealRef = useReveal([programs.length]);

  return (
    <>
      <PageHeader
        eyebrow="Programs"
        title="Data training that leads to real, practical skills"
        intro="Cohort-based, project-driven programs for aspiring data professionals and for people who want to use data better in the job they already have."
        breadcrumbs={[{ label: 'Programs' }]}
      />

      <Section>
        <div ref={revealRef}>
          {loading && <LoadingState label="Loading programs…" />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {!loading && !error && programs.length === 0 && (
            <EmptyState icon="book" title="No programs are listed right now" action={<Link to="/contact?interest=training" className="btn btn-primary">Ask about upcoming cohorts</Link>}>
              New cohorts are announced regularly. Get in touch and we will let you know when the next one opens.
            </EmptyState>
          )}
          {programs.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-2">
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading
            eyebrow="For organisations"
            title="Training for your team?"
            intro="We also design tailored programs for companies and institutions, built around your own tools, data and the decisions your teams make every day."
            className="mb-0"
          />
          <div data-reveal className="card flex flex-col gap-4 p-7">
            {['Skills assessment before training', 'Curriculum built on your own data', 'Workshops, multi-week programs or leadership sessions'].map((t) => (
              <p key={t} className="flex gap-3 text-[0.96rem] text-ink">
                <Icon name="checkCircle" className="mt-0.5 h-5 w-5 text-teal-600" />
                {t}
              </p>
            ))}
            <ArrowLink to="/services/corporate-upskilling" className="mt-2">
              Corporate team upskilling
            </ArrowLink>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Questions about a program?"
        text="Ask us about schedules, tracks, or whether a program is right for you. We are happy to help you choose."
        primary={{ to: '/contact?interest=training', label: 'Ask a question' }}
        secondary={{ to: '/services', label: 'Explore our services' }}
      />
    </>
  );
}
