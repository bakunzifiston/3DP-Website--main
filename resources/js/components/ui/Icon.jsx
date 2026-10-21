// Single-stroke 24px icon set shared by the public site and the admin dashboard.
const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowUpRight: <path d="M7 17L17 7M8 7h9v9" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5v.01" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  mapPin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14.2a6.5 6.5 0 013.5 5.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </>
  ),
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  // Pillars
  train: (
    <>
      <path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z" />
      <path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v5" />
    </>
  ),
  build: (
    <>
      <rect x="3" y="3.5" width="7.5" height="7.5" rx="1" />
      <rect x="13.5" y="3.5" width="7.5" height="7.5" rx="1" />
      <rect x="3" y="13" width="7.5" height="7.5" rx="1" />
      <path d="M17.25 13.5v6.5M14 16.75h6.5" />
    </>
  ),
  advise: (
    <>
      <path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  trendUp: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" />
      <path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />
    </>
  ),
  shield: <path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-3z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  rocket: <path d="M5 19l3.5-1 8-8a4.5 4.5 0 00-6.4-6.4l-8 8L1 15M14 6l4 4M8 12l4 4M15.5 13.5V20l-3-2M10.5 8.5H4l2-3" />,
  building: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
  enterprise: <path d="M3 21h18M4 21V5h8v16M12 21V9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2" />,
  landmark: <path d="M3 21h18M4 10h16M12 3l9 5H3l9-5zM6 10v8M10 10v8M14 10v8M18 10v8" />,
  heart: <path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0112 7a4.5 4.5 0 017.5 3c0 5.5-7.5 10-7.5 10z" />,
  book: <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15zM4 20.5A2.5 2.5 0 016.5 23H20v-5" />,
  lightbulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" />,
  quote: <path d="M9.5 7H5.5v5h4v1.5C9.5 15 8.5 16 7 16.5M18.5 7h-4v5h4v1.5c0 1.5-1 2.5-2.5 3" />,
  linkedin: (
    <path
      fill="currentColor"
      stroke="none"
      d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.66 4.77 6.12V23h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.23 0-2.57 1.74-2.57 3.54V23h-4V8.5z"
    />
  ),
  x_social: <path fill="currentColor" stroke="none" d="M3 3l7.5 9.5L3.4 21h2.3l6-6.9L16.7 21H21l-7.9-10L20.5 3h-2.3l-5.5 6.3L8 3H3z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  facebook: <path fill="currentColor" stroke="none" d="M14 8V6.5c0-.8.2-1.5 1.5-1.5H17V2h-2.5C11.6 2 11 4 11 6v2H9v3h2v11h3V11h2.5l.5-3h-3z" />,
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path fill="currentColor" stroke="none" d="M10 9v6l5-3-5-3z" />
    </>
  ),
  // Admin
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="9" rx="1" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="1" />
      <rect x="13.5" y="11" width="7.5" height="10" rx="1" />
      <rect x="3" y="15" width="7.5" height="6" rx="1" />
    </>
  ),
  inbox: <path d="M3 13l2.5-8h13L21 13v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM3 13h5l1.5 2.5h5L16 13h5" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  file: <path d="M14 3H6.5A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V8l-5-5zM14 3v5h5M9 13h6M9 17h6" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="M21 15.5l-5-5-9 9.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </>
  ),
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  logout: <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: <path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />,
  upload: <path d="M12 16V5M7 10l5-5 5 5M4 20h16" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 018 0v3.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
    </>
  ),
};

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.7, title }) {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-icon={name}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {content}
    </svg>
  );
}

export const iconNames = Object.keys(paths);
