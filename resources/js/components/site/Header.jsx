import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Container from '../Container.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';

export const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/programs', label: 'Programs' },
  { to: '/who-we-serve', label: 'Who we serve' },
  { to: '/insights', label: 'Insights' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `nav-link relative py-2 text-[0.94rem] font-medium no-underline transition-colors ${
      isActive ? 'text-navy-800' : 'text-ink-muted hover:text-navy-800'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-surface/95 backdrop-blur-sm transition-[border-color,box-shadow] ${
        scrolled ? 'border-line shadow-sm' : 'border-transparent'
      }`}
    >
      <Container as="nav" aria-label="Main" className="flex h-[72px] items-center justify-between gap-6 lg:h-[80px]">
        <Logo className="h-11 lg:h-[52px]" />

        <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link to="/contact" className="btn btn-primary">
            Talk to us
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-line text-navy-800 hover:bg-navy-50 lg:hidden"
        >
          <Icon name={open ? 'x' : 'menu'} className="h-5 w-5" />
        </button>
      </Container>

      {open && (
        <div id="mobile-menu" className="menu-in fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-line bg-surface lg:hidden">
          <Container as="div" className="py-4">
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.to} className="border-b border-line">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-4 font-display text-[1.15rem] font-medium no-underline ${
                        isActive ? 'text-navy-800' : 'text-ink-muted'
                      }`
                    }
                  >
                    {item.label}
                    <Icon name="chevronRight" className="h-4 w-4 text-ink-faint" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-primary btn-lg mt-6 w-full">
              Talk to us
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
