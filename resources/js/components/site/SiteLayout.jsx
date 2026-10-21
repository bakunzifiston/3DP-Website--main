import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { SiteSettingsProvider } from './SiteSettings.jsx';
import { RevealManager } from '../../lib/motion.jsx';

// Scrolls to the top on page change, or to the #hash target when one is present.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <SiteSettingsProvider>
      <ScrollManager />
      <RevealManager />
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-navy-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {/* Keyed by path so each page plays the enter animation. */}
          <div key={pathname} className="page-in">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
