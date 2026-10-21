import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader, Section, SectionHeading, CtaBand, pillarMeta } from '../components/site/Blocks.jsx';
import { PillarIllustration } from '../components/illustrations/Pillars.jsx';
import Icon from '../components/ui/Icon.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback.jsx';
import { useApi, usePageMeta, useReveal } from '../lib/hooks.js';

const pillarIntro = {
  train: {
    title: 'Train: build data talent',
    text: 'Structured, practical programs that build data skills in individuals and teams, from first steps to job-ready.',
  },
  build: {
    title: 'Build: data products and systems',
    text: 'Dashboards, data products, pipelines and internal tools that turn raw information into daily decisions.',
  },
  advise: {
    title: 'Advise: strategy, research and compliance',
    text: 'Direction you can act on: data strategy, rigorous research, and practical data protection compliance.',
  },
};

function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.slug}`}
      data-reveal
      className="card card-hover group flex h-full flex-col p-6 no-underline sm:p-7"
    >
      <h3 className="text-[1.2rem] transition-colors group-hover:text-navy-700">{service.title}</h3>
      <p className="mt-2.5 text-[0.96rem] leading-relaxed text-ink-muted">{service.summary}</p>
      {service.features?.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
          {service.features.slice(0, 3).map((f) => (
            <li key={f} className="flex gap-2.5 text-[0.9rem] text-ink-muted">
              <Icon name="check" className="mt-[3px] h-4 w-4 text-gold-600" strokeWidth={2.2} />
              {f}
            </li>
          ))}
        </ul>
      )}
      <span className="link-arrow mt-auto pt-6 text-[0.92rem]">
        Learn more
        <Icon name="arrowRight" className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function Services() {
  usePageMeta(
    'Services',
    '3DP services across training, data products and systems, data strategy, research and data protection compliance.'
  );
  const { data, error, loading, reload } = useApi('/public/services');
  const services = data?.data || [];
  const revealRef = useReveal([services.length]);
  const { hash } = useLocation();

  // Pillar anchors (#train, #build, #advise) only exist once services have loaded.
  useEffect(() => {
    if (services.length && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [services.length, hash]);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Practical data services, from skills to systems to strategy"
        intro="We work across three connected areas. Most clients start in one and grow into the others as their data maturity develops."
        breadcrumbs={[{ label: 'Services' }]}
      >
        <nav aria-label="Service areas" className="mt-8 flex flex-wrap gap-2.5">
          {Object.entries(pillarMeta).map(([key, p]) => (
            <a
              key={key}
              href={`#${key}`}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-[0.9rem] font-medium text-navy-800 no-underline transition-colors hover:border-navy-600 hover:bg-navy-50"
            >
              <Icon name={p.icon} className="h-4 w-4 text-gold-600" />
              {p.label}
            </a>
          ))}
        </nav>
      </PageHeader>

      {loading && <LoadingState label="Loading services…" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && services.length === 0 && (
        <EmptyState icon="layers" title="Services are being updated">
          Please check back shortly, or contact us to discuss what you need.
        </EmptyState>
      )}

      <div ref={revealRef}>
        {!loading &&
          !error &&
          services.length > 0 &&
          Object.keys(pillarMeta).map((pillar, i) => {
            const items = services.filter((s) => s.pillar === pillar);
            if (!items.length) return null;
            return (
              <Section key={pillar} id={pillar} tone={['default', 'sand', 'mist'][i % 3]} className="scroll-mt-20">
                <div className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
                  <SectionHeading
                    eyebrow={pillarMeta[pillar].label}
                    title={pillarIntro[pillar].title}
                    intro={pillarIntro[pillar].text}
                    className="mb-0"
                  />
                  <div className="hidden lg:block" aria-hidden="true">
                    <PillarIllustration pillar={pillar} className="h-auto w-full max-w-[340px]" />
                  </div>
                </div>
                <div className={`mt-12 grid gap-6 md:grid-cols-2 ${items.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
                  {items.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </Section>
            );
          })}
      </div>

      <CtaBand
        title="Not sure where to start?"
        text="Tell us about your organisation and the decisions you want to improve. We'll recommend the right mix of training, systems and advice."
        secondary={{ to: '/who-we-serve', label: 'See who we serve' }}
      />
    </>
  );
}
