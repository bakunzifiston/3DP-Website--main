import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PageHeader, Section, SectionHeading, ArrowLink } from '../components/site/Blocks.jsx';
import Container from '../components/Container.jsx';
import Icon from '../components/ui/Icon.jsx';
import RichText from '../components/ui/RichText.jsx';
import { LoadingState, ErrorState, Badge, Alert } from '../components/ui/Feedback.jsx';
import ApplicationForm from '../components/site/forms/ApplicationForm.jsx';
import { useApi, usePageMeta } from '../lib/hooks.js';
import { programFacts } from './Programs.jsx';

export default function ProgramDetail() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useApi(`/public/programs/${encodeURIComponent(slug)}`);
  const program = data?.data;
  usePageMeta(program?.title || (error ? 'Program not found' : 'Program'), program?.summary);
  const { hash } = useLocation();

  // The layout scrolls to #apply before the program has loaded; scroll again once it renders.
  useEffect(() => {
    if (program && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [program, hash]);

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading program…" />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState error={error} onRetry={reload} />
        <div className="text-center">
          <Link to="/programs" className="btn btn-secondary">
            <Icon name="arrowLeft" className="h-4 w-4" />
            All programs
          </Link>
        </div>
      </Container>
    );
  }

  const facts = programFacts(program);
  const open = program.accepting_applications;

  return (
    <>
      <PageHeader
        eyebrow="Program"
        title={program.title}
        intro={program.summary}
        breadcrumbs={[{ to: '/programs', label: 'Programs' }, { label: program.title }]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {open ? (
            <a href="#apply" className="btn btn-accent btn-lg">
              Apply now
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
          ) : (
            <Badge>Applications currently closed</Badge>
          )}
          <Link to="/contact?interest=training" className="btn btn-secondary btn-lg">
            Ask a question
          </Link>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <div>
            {program.image && (
              <img src={program.image} alt="" className="mb-10 aspect-[16/9] w-full rounded-lg border border-line object-cover" />
            )}
            {program.body ? <RichText text={program.body} /> : <p className="prose-3dp">{program.summary}</p>}

            {program.tracks?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-[1.45rem]">Tracks</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {program.tracks.map((t) => (
                    <li key={t} className="rounded-md border border-line bg-surface px-4 py-2 text-[0.95rem] font-medium text-navy-800">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div data-reveal="fade" className="card overflow-hidden">
              <h2 className="border-b border-line bg-navy-50/60 px-6 py-4 font-sans text-[0.78rem] font-semibold tracking-[0.12em] text-ink-faint uppercase">
                Key facts
              </h2>
              <dl className="flex flex-col divide-y divide-line px-6">
                {facts.map((f) => (
                  <div key={f.label} className="flex gap-3 py-4">
                    <Icon name={f.icon} className="mt-0.5 h-[18px] w-[18px] text-gold-600" />
                    <div>
                      <dt className="text-[0.78rem] font-semibold tracking-wide text-ink-faint uppercase">{f.label}</dt>
                      <dd className="text-[0.95rem] text-ink">{f.value}</dd>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 py-4">
                  <Icon name={open ? 'checkCircle' : 'info'} className={`mt-0.5 h-[18px] w-[18px] ${open ? 'text-success' : 'text-ink-faint'}`} />
                  <div>
                    <dt className="text-[0.78rem] font-semibold tracking-wide text-ink-faint uppercase">Applications</dt>
                    <dd className="text-[0.95rem] text-ink">{open ? 'Open' : 'Closed for now'}</dd>
                  </div>
                </div>
              </dl>
              {open && (
                <div className="px-6 pb-6">
                  <a href="#apply" className="btn btn-primary w-full">
                    Apply for this program
                  </a>
                </div>
              )}
            </div>
            <ArrowLink to="/programs" className="mt-6">
              All programs
            </ArrowLink>
          </aside>
        </div>
      </Section>

      <Section id="apply" tone="gold" className="scroll-mt-20">
        <div className="mx-auto max-w-[760px]">
          <SectionHeading
            eyebrow="Apply"
            title={open ? `Apply for the ${program.title}` : 'Applications are closed'}
            intro={
              open
                ? 'It takes about five minutes. We review every application and will contact you by email with next steps.'
                : undefined
            }
            className="mb-8"
          />
          {open ? (
            <ApplicationForm program={program} />
          ) : (
            <Alert tone="info" title="This program is not accepting applications right now">
              <p>
                Register your interest and we will let you know when the next cohort opens.{' '}
                <Link to="/contact?interest=training" className="font-semibold underline">
                  Contact us
                </Link>
                .
              </p>
            </Alert>
          )}
        </div>
      </Section>
    </>
  );
}
