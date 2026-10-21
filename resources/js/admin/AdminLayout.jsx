import { createContext, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/site/Logo.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth, useAdminApi } from './auth.jsx';
import { contentTypes } from './contentTypes.js';

// Lets pages refresh the sidebar badge counts after changing an inquiry or application status.
const StatsContext = createContext({ counts: null, refresh: () => {} });
export const useStats = () => useContext(StatsContext);

function navSections(isAdmin) {
  return [
    {
      title: null,
      items: [{ to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true }],
    },
    {
      title: 'Submissions',
      items: [
        { to: '/admin/inquiries', label: 'Inquiries', icon: 'inbox', badge: 'new_inquiries' },
        { to: '/admin/applications', label: 'Applications', icon: 'clipboard', badge: 'new_applications' },
      ],
    },
    {
      title: 'Content',
      items: [
        ...Object.entries(contentTypes).map(([key, t]) => ({ to: `/admin/${key}`, label: t.plural, icon: t.icon })),
        { to: '/admin/media', label: 'Media library', icon: 'image' },
      ],
    },
    {
      title: 'System',
      items: [
        { to: '/admin/settings', label: 'Site settings', icon: 'settings' },
        ...(isAdmin ? [{ to: '/admin/users', label: 'Users', icon: 'users' }] : []),
        { to: '/admin/activity', label: 'Activity log', icon: 'activity' },
      ],
    },
  ];
}

function Sidebar({ counts, onNavigate }) {
  const { isAdmin } = useAuth();
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {navSections(isAdmin).map((section, i) => (
        <div key={i} className={i ? 'mt-6' : ''}>
          {section.title && <p className="mb-2 px-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white/40 uppercase">{section.title}</p>}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const badge = item.badge && counts?.[item.badge];
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-[0.9rem] no-underline transition-colors ${
                        isActive ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon name={item.icon} className={`h-[18px] w-[18px] ${isActive ? 'text-gold-400' : ''}`} />
                        <span className="flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span className="rounded-full bg-gold-500 px-1.5 text-[0.72rem] font-semibold text-navy-900" aria-label={`${badge} new`}>
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 font-display text-[0.9rem] font-semibold text-navy-900" aria-hidden="true">
          {user.name
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.88rem] font-medium text-white">{user.name}</p>
          <p className="truncate text-[0.75rem] text-white/50 capitalize">{user.role}</p>
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1">
        <Link to="/admin/account" className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[0.8rem] text-white/70 no-underline hover:bg-white/5 hover:text-white">
          <Icon name="user" className="h-4 w-4" />
          Account
        </Link>
        <button type="button" onClick={logout} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[0.8rem] text-white/70 hover:bg-white/5 hover:text-white">
          <Icon name="logout" className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const stats = useAdminApi('/admin/stats', { keepPrevious: true });
  const counts = stats.data?.data?.counts;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const panel = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" className="flex items-center gap-2.5 no-underline" aria-label="Admin dashboard">
          <Logo variant="reversed" className="h-9" to={null} />
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-[0.12em] text-gold-400 uppercase">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white/70 hover:bg-white/10 lg:hidden">
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>
      <Sidebar counts={counts} onNavigate={() => setOpen(false)} />
      <UserMenu />
    </>
  );

  return (
    <StatsContext.Provider value={{ counts, stats: stats.data?.data, loading: stats.loading, error: stats.error, refresh: stats.reload }}>
      <a href="#admin-main" className="sr-only z-[70] rounded-md bg-navy-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <div className="min-h-screen bg-bg">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] flex-col bg-navy-900 lg:flex">{panel}</aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] animate-fade-up flex-col bg-navy-900 shadow-lg">{panel}</aside>
          </div>
        )}

        <div className="lg:pl-[256px]">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-line text-navy-800 hover:bg-navy-50 lg:hidden"
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>
              <span className="font-display text-[0.95rem] font-semibold text-navy-800 lg:hidden">3DP Admin</span>
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              View website
              <Icon name="external" className="h-4 w-4" />
            </a>
          </header>
          <main id="admin-main" tabIndex={-1} className="mx-auto max-w-[1280px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            <div key={pathname} className="page-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </StatsContext.Provider>
  );
}
