import { useSearchParams } from 'react-router-dom';
import { PageHeader, Section } from '../components/site/Blocks.jsx';
import Icon from '../components/ui/Icon.jsx';
import ContactForm from '../components/site/forms/ContactForm.jsx';
import { useSiteSettings, socialLinks } from '../components/site/SiteSettings.jsx';
import { usePageMeta } from '../lib/hooks.js';

const nextSteps = [
  { title: 'We read your message', text: 'A member of our team reviews every enquiry personally.' },
  { title: 'We get in touch', text: 'We reply by email to ask any questions or suggest a short call.' },
  { title: 'We propose a next step', text: 'A practical recommendation: a program, a scoped project, or an advisory session.' },
];

export default function Contact() {
  usePageMeta('Contact', 'Contact 3DP about data training, data products, data-driven systems, strategy and compliance.');
  const s = useSiteSettings();
  const [params] = useSearchParams();
  const socials = socialLinks(s);

  const details = [
    s.contact_email && { icon: 'mail', label: 'Email', value: s.contact_email, href: `mailto:${s.contact_email}` },
    s.contact_phone && { icon: 'phone', label: 'Phone', value: s.contact_phone, href: `tel:${s.contact_phone.replace(/\s+/g, '')}` },
    s.address && { icon: 'mapPin', label: 'Location', value: s.address },
    s.office_hours && { icon: 'clock', label: 'Office hours', value: s.office_hours },
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your data"
        intro="Tell us what you're working on. Maybe your team needs training, a system needs building, or your strategy needs direction."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-[1.35rem]">Contact details</h2>
              <dl className="mt-6 flex flex-col gap-5">
                {details.map((d) => (
                  <div key={d.label} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                      <Icon name={d.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[0.8rem] font-semibold tracking-wide text-ink-faint uppercase">{d.label}</dt>
                      <dd className="text-[0.98rem] break-words text-ink">
                        {d.href ? (
                          <a href={d.href} className="link font-medium">
                            {d.value}
                          </a>
                        ) : (
                          d.value
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
              {socials.length > 0 && (
                <ul className="mt-7 flex gap-2.5">
                  {socials.map((l) => (
                    <li key={l.key}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={l.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-navy-700 transition-colors hover:border-navy-600 hover:bg-navy-50"
                      >
                        <Icon name={l.icon} className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
              <h2 className="text-[1.15rem]">What happens next</h2>
              <ol className="mt-5 flex flex-col gap-5">
                {nextSteps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-100 font-display text-[0.9rem] font-semibold text-gold-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-navy-800">{step.title}</p>
                      <p className="mt-0.5 text-[0.92rem] text-ink-muted">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {s.response_time && (
                <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-[0.9rem] text-ink-muted">
                  <Icon name="clock" className="mt-0.5 h-[18px] w-[18px] text-teal-600" />
                  {s.response_time}
                </p>
              )}
            </div>
          </div>

          <ContactForm initialInterest={params.get('interest') || 'other'} responseTime={s.response_time} />
        </div>
      </Section>
    </>
  );
}
