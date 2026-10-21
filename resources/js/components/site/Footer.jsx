import { Link } from 'react-router-dom';
import Container from '../Container.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import { useSiteSettings, socialLinks } from './SiteSettings.jsx';

const columns = [
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About 3DP' },
      { to: '/who-we-serve', label: 'Who we serve' },
      { to: '/insights', label: 'Insights' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'What we do',
    links: [
      { to: '/services#train', label: 'Training' },
      { to: '/services#build', label: 'Data products & systems' },
      { to: '/services#advise', label: 'Strategy & compliance' },
      { to: '/programs', label: 'Programs' },
    ],
  },
];

export default function Footer() {
  const s = useSiteSettings();
  const socials = socialLinks(s);

  return (
    <footer className="bg-navy-900 text-white/75">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:py-20">
        <div>
          <Logo variant="reversed" className="h-16" />
          <p className="mt-5 max-w-[34ch] text-[0.94rem] leading-relaxed">
            Helping companies and individuals become data driven through training, data products, data-driven systems,
            and strategy.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2.5">
              {socials.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold-500 hover:text-gold-400"
                  >
                    <Icon name={l.icon} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 font-sans text-[0.78rem] font-semibold tracking-[0.12em] text-gold-400 uppercase">{col.title}</h2>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[0.94rem] text-white/75 no-underline transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="mb-4 font-sans text-[0.78rem] font-semibold tracking-[0.12em] text-gold-400 uppercase">Get in touch</h2>
          <ul className="flex flex-col gap-3.5 text-[0.94rem]">
            {s.contact_email && (
              <li className="flex gap-3">
                <Icon name="mail" className="mt-0.5 h-[18px] w-[18px] text-white/50" />
                <a href={`mailto:${s.contact_email}`} className="break-all text-white/80 no-underline hover:text-white">
                  {s.contact_email}
                </a>
              </li>
            )}
            {s.contact_phone && (
              <li className="flex gap-3">
                <Icon name="phone" className="mt-0.5 h-[18px] w-[18px] text-white/50" />
                <a href={`tel:${s.contact_phone.replace(/\s+/g, '')}`} className="text-white/80 no-underline hover:text-white">
                  {s.contact_phone}
                </a>
              </li>
            )}
            {s.address && (
              <li className="flex gap-3">
                <Icon name="mapPin" className="mt-0.5 h-[18px] w-[18px] text-white/50" />
                <span>{s.address}</span>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-[0.85rem] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} 3DP, Data Driven Decisions Partners. All rights reserved.</span>
          <Link to="/privacy" className="text-white/55 no-underline hover:text-white">
            Privacy policy
          </Link>
        </Container>
      </div>
    </footer>
  );
}
