const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : '');
export const formatDateTime = (value) => (value ? dateTimeFmt.format(new Date(value)) : '');

export function timeAgo(value) {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round(seconds / size), unit);
    }
  }
  return 'just now';
}

export function readingTime(text = '') {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const pillarLabels = { train: 'Train', build: 'Build', advise: 'Advise' };

export const interestOptions = [
  { value: 'training', label: 'Training & programs' },
  { value: 'data-products', label: 'Data products & dashboards' },
  { value: 'systems', label: 'Data-driven systems & digitization' },
  { value: 'strategy', label: 'Data strategy & research' },
  { value: 'compliance', label: 'Data protection compliance' },
  { value: 'other', label: 'Something else' },
];

export const interestLabel = (value) => interestOptions.find((o) => o.value === value)?.label || value;

export const experienceOptions = [
  { value: 'none', label: 'No experience yet' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
