// CMS content types. Field names match server/lib/resources.js so server validation errors map back
// onto the right inputs. The generic ContentList and ContentEditor screens are driven entirely by this config.

const publishSwitch = {
  name: 'is_published',
  label: 'Published',
  type: 'switch',
  description: 'Visible on the public website',
  side: true,
};
const sortOrder = { name: 'sort_order', label: 'Display order', type: 'number', hint: 'Lower numbers appear first', side: true };

const pillarOptions = [
  { value: 'train', label: 'Train' },
  { value: 'build', label: 'Build' },
  { value: 'advise', label: 'Advise' },
];

export const contentTypes = {
  services: {
    singular: 'Service',
    plural: 'Services',
    icon: 'layers',
    description: 'The services listed under Train, Build and Advise.',
    titleField: 'title',
    subtitleField: 'summary',
    publicPath: (row) => `/services/${row.slug}`,
    filter: { name: 'pillar', label: 'Pillar', options: pillarOptions },
    meta: (row) => ({ label: { train: 'Train', build: 'Build', advise: 'Advise' }[row.pillar], tone: { train: 'gold', build: 'navy', advise: 'teal' }[row.pillar] }),
    defaults: { pillar: 'train', features: [], outcomes: [], is_published: true, sort_order: 0 },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'slug', label: 'URL slug', type: 'slug', source: 'title', required: true, prefix: '/services/' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 400, rows: 3, hint: 'Shown on cards and at the top of the service page.' },
      { name: 'body', label: 'Page content', type: 'rich', rows: 14 },
      { name: 'features', label: 'What is included', type: 'list', itemLabel: 'item', max: 20 },
      { name: 'outcomes', label: 'Outcomes for clients', type: 'list', itemLabel: 'outcome', max: 12 },
      { name: 'pillar', label: 'Pillar', type: 'select', options: pillarOptions, required: true, side: true },
      { name: 'image', label: 'Image', type: 'image', side: true },
      sortOrder,
      publishSwitch,
    ],
  },

  programs: {
    singular: 'Program',
    plural: 'Programs',
    icon: 'train',
    description: 'Training programs people can apply to from the website.',
    titleField: 'title',
    subtitleField: 'summary',
    publicPath: (row) => `/programs/${row.slug}`,
    meta: (row) => (row.accepting_applications ? { label: 'Applications open', tone: 'success' } : { label: 'Applications closed', tone: 'neutral' }),
    defaults: { tracks: [], accepting_applications: true, is_published: true, sort_order: 0 },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'slug', label: 'URL slug', type: 'slug', source: 'title', required: true, prefix: '/programs/' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 400, rows: 3 },
      { name: 'body', label: 'Program details', type: 'rich', rows: 14 },
      { name: 'tracks', label: 'Tracks / specializations', type: 'list', itemLabel: 'track', max: 12, hint: 'Applicants can choose one of these.' },
      { name: 'audience', label: 'Who it is for', type: 'text', max: 255 },
      { name: 'format', label: 'Format', type: 'text', max: 160, placeholder: 'e.g. Cohort-based · full curriculum', half: true },
      { name: 'duration', label: 'Duration', type: 'text', max: 120, placeholder: 'e.g. 12 weeks', half: true },
      { name: 'schedule', label: 'Schedule', type: 'text', max: 160, placeholder: 'e.g. Evenings and weekends', half: true },
      { name: 'level', label: 'Level', type: 'text', max: 80, placeholder: 'e.g. Beginner', half: true },
      { name: 'fee', label: 'Fee', type: 'text', max: 120, placeholder: 'Leave empty to hide', half: true },
      { name: 'next_intake', label: 'Next intake', type: 'date', half: true },
      { name: 'accepting_applications', label: 'Accepting applications', type: 'switch', description: 'Show the application form', side: true },
      { name: 'image', label: 'Image', type: 'image', side: true },
      sortOrder,
      publishSwitch,
    ],
  },

  posts: {
    singular: 'Article',
    plural: 'Insights',
    icon: 'file',
    description: 'Articles published in the Insights section.',
    titleField: 'title',
    subtitleField: 'excerpt',
    publicPath: (row) => (row.status === 'published' ? `/insights/${row.slug}` : null),
    filter: {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
    statusField: 'status',
    dateField: 'published_at',
    defaults: { status: 'draft', author_name: '3DP Team' },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 200 },
      { name: 'slug', label: 'URL slug', type: 'slug', source: 'title', required: true, prefix: '/insights/' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, max: 400, rows: 3, hint: 'One or two sentences shown in article lists.' },
      { name: 'body', label: 'Article', type: 'rich', required: true, rows: 22 },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        side: true,
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ],
      },
      { name: 'published_at', label: 'Publish date', type: 'datetime', side: true, hint: 'Leave empty to use the time you publish. Future dates are scheduled.' },
      { name: 'category', label: 'Category', type: 'text', max: 80, side: true, placeholder: 'e.g. Data strategy' },
      { name: 'author_name', label: 'Author', type: 'text', max: 120, side: true },
      { name: 'cover_image', label: 'Cover image', type: 'image', side: true },
    ],
  },

  team: {
    singular: 'Team member',
    plural: 'Team',
    icon: 'users',
    description: 'People shown on the About page.',
    titleField: 'name',
    subtitleField: 'role',
    imageField: 'photo',
    defaults: { is_published: true, sort_order: 0 },
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, max: 120 },
      { name: 'role', label: 'Role / title', type: 'text', required: true, max: 140 },
      { name: 'bio', label: 'Short bio', type: 'textarea', max: 2000, rows: 5 },
      { name: 'linkedin_url', label: 'LinkedIn profile', type: 'url', placeholder: 'https://www.linkedin.com/in/…' },
      { name: 'photo', label: 'Photo', type: 'image', side: true },
      sortOrder,
      publishSwitch,
    ],
  },

  testimonials: {
    singular: 'Testimonial',
    plural: 'Testimonials',
    icon: 'quote',
    description: 'Client and participant quotes. Only publish quotes you have permission to use.',
    titleField: 'author_name',
    subtitleField: 'quote',
    defaults: { is_published: false, sort_order: 0 },
    fields: [
      { name: 'quote', label: 'Quote', type: 'textarea', required: true, max: 1200, rows: 5 },
      { name: 'author_name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'author_title', label: 'Title', type: 'text', max: 140, half: true },
      { name: 'organization', label: 'Organization', type: 'text', max: 140, half: true },
      sortOrder,
      { ...publishSwitch, description: 'Only publish with the person’s permission' },
    ],
  },
};

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}
