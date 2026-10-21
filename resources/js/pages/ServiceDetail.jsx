import { Link, useParams } from 'react-router-dom';
import { PageHeader, Section, CtaBand, ArrowLink, pillarMeta } from '../components/site/Blocks.jsx';
import { PillarIllustration } from '../components/illustrations/Pillars.jsx';
import Container from '../components/Container.jsx';
import Icon from '../components/ui/Icon.jsx';
import RichText from '../components/ui/RichText.jsx';
import { LoadingState, ErrorState, Badge } from '../components/ui/Feedback.jsx';
import { useApi, usePageMeta } from '../lib/hooks.js';

// Maps a service to the matching "What can we help with?" option on the contact form.
const interestBySlug = {
  'professional-data-training': 'training',
  'corporate-upskilling': 'training',
  'data-products': 'data-products',
  'data-driven-systems': 'systems',
  'business-digitization': 'systems',
  'data-strategy': 'strategy',
  'research-and-data-collection': 'strategy',
  'data-protection-compliance': 'compliance',
};
const interestByPillar = { train: 'training', build: 'data-products', advise: 'strategy' };

export default function ServiceDetail() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useApi(`/public/services/${encodeURIComponent(slug)}`);
  const { data: all } = useApi('/public/services');
  const service = data?.data;
  usePageMeta(service?.title || (error ? 'Service not found' : 'Service'), service?.summary);

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading service…" />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState error={error} onRetry={reload} />
        <div className="text-center">
          <Link to="/services" className="btn btn-secondary">
            <Icon name="arrowLeft" className="h-4 w-4" />
            All services
          </Link>
        </div>
      </Container>
    );
  }

  const pillar = pillarMeta[service.pillar];
  const related = (all?.data || []).filter((s) => s.pillar === service.pillar && s.id !== service.id);
  const interest = interestBySlug[service.slug] || interestByPillar[service.pillar] || 'other';

  return (
    <>
      <PageHeader
        eyebrow={pillar?.label}
        title={service.title}
        intro={service.summary}
        breadcrumbs={[{ to: '/services', label: 'Services' }, { label: service.title }]}
        aside={<PillarIllustration pillar={service.pillar} className="ml-auto h-auto w-full max-w-[380px]" />}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/contact?interest=${interest}`} className="btn btn-primary btn-lg">
            Discuss this service
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <div>
            {service.image && (
              <img src={service.image} alt="" className="mb-10 aspect-[16/9] w-full rounded-lg border border-line object-cover" />
            )}
            {service.body ? <RichText text={service.body} /> : <p className="prose-3dp">{service.summary}</p>}

            {service.features?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-[1.45rem]">What's included</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex gap-3 rounded-md border border-line bg-surface p-4 text-[0.95rem] text-ink">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                        <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.outcomes?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-[1.45rem]">Outcomes you can expect</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {service.outcomes.map((o, i) => (
                    <li key={o} className="border-t-2 border-gold-500 pt-4">
                      <span className="font-display text-[0.85rem] font-semibold text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                      <p className="mt-1.5 text-[0.98rem] font-medium text-navy-800">{o}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg bg-navy-800 p-7 text-white/75">
              <Icon name="mail" className="h-6 w-6 text-gold-400" />
              <h2 className="mt-4 text-[1.2rem] !text-white">Discuss this service</h2>
              <p className="mt-2 text-[0.94rem] leading-relaxed">
                Tell us about your organisation and what you want to achieve. We'll suggest a practical first step.
              </p>
              <Link to={`/contact?interest=${interest}`} className="btn btn-accent mt-6 w-full">
                Talk to us
              </Link>
            </div>

            {related.length > 0 && (
              <div data-reveal="fade" className="card p-6">
                <h2 className="font-sans text-[0.78rem] font-semibold tracking-[0.12em] text-ink-faint uppercase">
                  More in {pillar?.label}
                </h2>
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {related.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/services/${s.slug}`}
                        className="group flex items-center justify-between gap-3 py-3 text-[0.95rem] font-medium text-navy-800 no-underline"
                      >
                        <span className="group-hover:text-navy-600">{s.title}</span>
                        <Icon name="chevronRight" className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[0.9rem] text-ink-faint">
              <Badge tone={pillar?.tone}>{pillar?.label}</Badge>
              <span>{pillar?.blurb}</span>
            </div>
            <ArrowLink to="/services">All services</ArrowLink>
          </aside>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
