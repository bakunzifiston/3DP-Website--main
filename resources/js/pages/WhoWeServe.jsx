import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { PageHeader, Section, SectionHeading, CtaBand } from '../components/site/Blocks.jsx';
import { AudienceMark } from '../components/illustrations/Brand.jsx';
import { useApi, usePageMeta } from '../lib/hooks.js';

const audiences = [
  {
    kind: 'startups',
    title: 'Startups',
    text: "You're moving fast and your data is still small. We help you set up the right foundations early, so growth doesn't leave you with messy data later.",
    items: ['Data foundations and first dashboards', 'Product and customer analytics', 'Data protection from day one'],
    services: ['data-products', 'data-strategy', 'data-protection-compliance'],
  },
  {
    kind: 'smes',
    title: 'SMEs',
    text: 'Your data lives in spreadsheets, systems and paper records. We help you bring it together and use it in everyday decisions.',
    items: ['Digitizing manual processes', 'Reporting and data products', 'Data analysis training for staff'],
    services: ['business-digitization', 'data-products', 'corporate-upskilling'],
  },
  {
    kind: 'enterprises',
    title: 'Large enterprises',
    text: 'You have plenty of data and the teams to match. We help you get more value from it and keep it compliant.',
    items: ['Data strategy and governance', 'Data-driven systems and integrations', 'Upskilling teams at scale'],
    services: ['data-strategy', 'data-driven-systems', 'corporate-upskilling', 'data-protection-compliance'],
  },
  {
    kind: 'public',
    title: 'Public sector, NGOs & development partners',
    text: 'Programs and policies depend on reliable evidence. We can support research design, field data collection, monitoring and evaluation, and responsible handling of personal data.',
    items: ['Research and survey design', 'Digital data collection and analysis', 'Data protection and governance'],
    services: ['research-and-data-collection', 'data-protection-compliance', 'data-strategy'],
  },
];

function ServiceLinks({ slugs, services }) {
  const list = slugs.map((slug) => services.find((s) => s.slug === slug)).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="mb-3 text-[0.8rem] font-semibold tracking-wide text-ink-faint uppercase">Relevant services</p>
      <ul className="flex flex-wrap gap-2">
        {list.map((s) => (
          <li key={s.slug}>
            <Link
              to={`/services/${s.slug}`}
              className="inline-flex items-center gap-1.5 rounded border border-line bg-mist px-3 py-1.5 text-[0.86rem] font-medium text-navy-700 no-underline transition-colors hover:border-navy-600 hover:bg-navy-50"
            >
              {s.title}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WhoWeServe() {
  usePageMeta(
    'Who we serve',
    'How 3DP helps startups, SMEs, large enterprises, public sector organisations and individual professionals become data driven.'
  );
  const { data } = useApi('/public/services');
  const services = data?.data || [];
  const programs = useApi('/public/programs').data?.data || [];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Who we serve' }]}
        eyebrow="Who we serve"
        title="Better decisions, whatever the size of your organisation"
        intro="Whatever the size of your business, the goal is the same: better decisions from the data you already have. Here's how we typically help."
      />

      <Section>
        <div className="flex flex-col gap-6">
          {audiences.map((a) => (
            <article key={a.kind} id={a.kind} data-reveal className="card grid gap-8 p-7 md:grid-cols-[0.9fr_1.1fr] lg:p-10">
              <div>
                <AudienceMark kind={a.kind} className="mb-5 h-12 w-12" />
                <h2 className="text-[1.5rem]">{a.title}</h2>
                <p className="mt-3 leading-relaxed text-ink-muted">{a.text}</p>
              </div>
              <div>
                <p className="mb-3 text-[0.8rem] font-semibold tracking-wide text-ink-faint uppercase">How we help</p>
                <ul className="flex flex-col gap-3">
                  {a.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.98rem] text-ink">
                      <Icon name="check" className="mt-1 h-4 w-4 text-teal-600" strokeWidth={2.2} />
                      {item}
                    </li>
                  ))}
                </ul>
                <ServiceLinks slugs={a.services} services={services} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sand" id="individuals">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              className="mb-0"
              eyebrow="Individuals & professionals"
              title="Building your own data career?"
              intro="Our programs take beginners and working professionals from foundational skills to job-ready, through cohort-based, project-driven learning."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/programs" className="btn btn-primary">
                Explore programs
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {programs.length > 0 && (
            <ul className="flex flex-col gap-3">
              {programs.map((p) => (
                <li key={p.id}>
                  <Link to={`/programs/${p.slug}`} data-reveal className="card card-hover group flex items-center gap-4 p-5 no-underline">
                    <AudienceMark kind="individuals" className="h-10 w-10 shrink-0" />
                    <span className="flex-1">
                      <span className="block font-display font-semibold text-navy-800">{p.title}</span>
                      {p.format && <span className="block text-[0.86rem] text-ink-faint">{p.format}</span>}
                    </span>
                    <Icon name="arrowRight" className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <CtaBand title="Not sure where to start?" text="Tell us about your organisation and your data. We'll suggest a practical first step." secondary={{ to: '/services', label: 'Browse services' }} />
    </>
  );
}
