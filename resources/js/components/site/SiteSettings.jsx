import { createContext, useContext } from 'react';
import { useApi } from '../../lib/hooks.js';

// Fallbacks keep the site usable if the settings request fails; the CMS values override them.
const defaults = {
  hero_eyebrow: 'Data Driven Decisions Partners · Kigali, Rwanda',
  hero_title: 'Turn the data you already have into decisions you can trust.',
  hero_subtitle:
    'We help companies and individuals become data driven through training, data products, data-driven systems, and strategy.',
  contact_email: '3dp.rwanda@gmail.com',
  contact_phone: null,
  address: 'Kigali, Rwanda',
  office_hours: null,
  response_time: 'We usually reply within two working days.',
  linkedin_url: null,
  x_url: null,
  instagram_url: null,
  facebook_url: null,
  youtube_url: null,
};

const SettingsContext = createContext(defaults);

export function SiteSettingsProvider({ children }) {
  const { data } = useApi('/public/settings');
  const merged = { ...defaults };
  for (const [k, v] of Object.entries(data?.data || {})) if (v) merged[k] = v;
  return <SettingsContext.Provider value={merged}>{children}</SettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SettingsContext);

export const socialLinks = (s) =>
  [
    { key: 'linkedin_url', label: 'LinkedIn', icon: 'linkedin' },
    { key: 'x_url', label: 'X (Twitter)', icon: 'x_social' },
    { key: 'instagram_url', label: 'Instagram', icon: 'instagram' },
    { key: 'facebook_url', label: 'Facebook', icon: 'facebook' },
    { key: 'youtube_url', label: 'YouTube', icon: 'youtube' },
  ]
    .filter((l) => s[l.key])
    .map((l) => ({ ...l, href: s[l.key] }));
