import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { PageHeader, Section, SectionHeading, CtaBand, pillarMeta } from '../components/site/Blocks.jsx';
import { AboutIllustration } from '../components/illustrations/Brand.jsx';
import { useApi, usePageMeta, useReveal } from '../lib/hooks.js';
import { steps } from './Home.jsx';

const values = [
  { icon: 'target', title: 'Decisions first', text: 'Every program, product and strategy starts from the decisions it needs to improve, not from the technology.' },
  { icon: 'users', title: 'Practical and hands-on', text: 'We learn and build with real data and real business questions, working alongside your team.' },
  { icon: 'shield', title: 'Responsible with data', text: 'Data protection, privacy and good governance are built into our work from the start.' },
  { icon: 'lightbulb', title: 'Built to last', text: 'We hand over the skills, documentation and structure you need to keep going without us.' },
];

function Team() {
  const { data, loading } = useApi('/public/team');
  const team = data?.data || [];
  if (loading) return null;
  if (!team.length) {
    return (
      <Section>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-[640px]">
            <p className="eyebrow mb-3.5">Our team</p>
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)]">Practitioners in data, technology and training</h2>
            <p className="mt-3 text-ink-muted">
              Our team combines hands-on experience in data analysis, engineering, research and compliance. We'd be glad to
              introduce the people who would work with you.
            </p>
          </div>
          <Link to="/contact" className="btn btn-secondary">
            Meet the team
          </Link>
        </div>
      </Section>
    );
  }
  return (
    <Section>
      <SectionHeading eyebrow="Our team" title="The people behind 3DP" />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <li key={m.id} data-reveal className="card overflow-hidden">
            {m.photo ? (
              <img src={m.photo} alt={`Portrait of ${m.name}`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-navy-50" aria-hidden="true">
                <span className="font-display text-4xl font-semibold text-navy-600">
                  {m.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </span>
              </div>
            )}
            <div className="p-5">
              <h3 className="text-[1.08rem]">{m.name}</h3>
              <p className="text-[0.9rem] font-medium text-gold-700">{m.role}</p>
              {m.bio && <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-muted">{m.bio}</p>}
              {m.linkedin_url && (
                <a
                  href={m.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-navy-700 no-underline hover:text-navy-900"
                >
                  <Icon name="linkedin" className="h-3.5 w-3.5" />
                  LinkedIn<span className="sr-only"> profile of {m.name}</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default function About() {
  usePageMeta(
    'About us',
    '3DP is a Kigali-based partner helping companies and individuals become data driven through training, data products, data-driven systems and strategy.'
  );
  const valuesRef = useReveal();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'About' }]}
        eyebrow="About 3DP"
        title="Your partner for data-driven decisions"
        intro="3DP, Data Driven Decisions Partners, is a Kigali-based firm helping companies and individuals become data driven through training, data products, data-driven systems, and strategy."
        aside={<AboutIllustration />}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-3.5">Our story</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">The answers are often already in your data</h2>
          </div>
          <div className="prose-3dp">
            <p>
              Most organisations already collect a great deal of information: in systems, in spreadsheets and on paper. Yet
              many important decisions are still made on instinct, because that information is scattered, hard to trust, or
              no one has the time and skills to turn it into answers.
            </p>
            <p>
              3DP exists to close that gap. We train people to work confidently with data, we build the products and systems
              that turn raw information into everyday insight, and we advise leaders on the strategy, research and compliance
              that keep data work sound.
            </p>
            <p>
              We work with startups, SMEs, large enterprises and individual professionals in Kigali and across East Africa.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-8 shadow-sm lg:p-10">
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-navy-800 text-gold-400">
              <Icon name="target" className="h-[22px] w-[22px]" />
            </span>
            <h2 className="text-[1.4rem]">Our mission</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              To help companies and individuals become data driven through practical training, reliable data products and
              systems, and sound strategy, so that decisions stop relying on guesswork.
            </p>
          </div>
          <div className="rounded-lg border border-navy-800 bg-navy-800 p-8 text-white/75 lg:p-10">
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-gold-500 text-navy-900">
              <Icon name="compass" className="h-[22px] w-[22px]" />
            </span>
            <h2 className="text-[1.4rem] !text-white">Our vision</h2>
            <p className="mt-3 leading-relaxed">
              Organisations and professionals across the region that use their data with confidence and responsibility to make
              better decisions every day.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="gold">
        <SectionHeading eyebrow="What we stand for" title="Our values" />
        <ul ref={valuesRef} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <li key={v.title} data-reveal className="border-t-2 border-gold-500 pt-6">
              <Icon name={v.icon} className="mb-4 h-7 w-7 text-navy-700" />
              <h3 className="text-[1.1rem]">{v.title}</h3>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Our approach"
          title="Three ways we help, one way of working"
          intro="We train, build and advise. Every engagement follows the same four steps."
        />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface shadow-sm">
            {Object.entries(pillarMeta).map(([key, p]) => (
              <li key={key}>
                <Link to={`/services#${key}`} className="group flex items-center gap-4 p-6 no-underline">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                    <Icon name={p.icon} className="h-[22px] w-[22px]" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-[1.1rem] font-semibold text-navy-800">{p.label}</span>
                    <span className="block text-[0.92rem] text-ink-muted">{p.blurb}</span>
                  </span>
                  <Icon name="arrowRight" className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
          <ol className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-500 font-display text-[0.95rem] font-semibold text-navy-800">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[1.08rem]">{step.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Team />

      <CtaBand title="Let's talk about your data" secondary={{ to: '/services', label: 'See our services' }} />
    </>
  );
}
