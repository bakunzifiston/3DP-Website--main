import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader, Section, CtaBand } from '../components/site/Blocks.jsx';
import Icon from '../components/ui/Icon.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback.jsx';
import { useApi, usePageMeta } from '../lib/hooks.js';
import { toQuery } from '../lib/api.js';
import { formatDate } from '../lib/format.js';

export function PostCard({ post, headingLevel = 'h2' }) {
  const Heading = headingLevel;
  return (
    <article data-reveal className="card card-hover group relative flex h-full flex-col overflow-hidden">
      {post.cover_image ? (
        <div className="overflow-hidden border-b border-line">
          <img src={post.cover_image} alt="" loading="lazy" className="zoom-img aspect-[16/9] w-full object-cover" />
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line bg-navy-50" aria-hidden="true">
          <div className="bg-grid absolute inset-0" />
          <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" fill="none">
            <rect x="52" y="48" width="12" height="22" className="fill-navy-800" />
            <rect x="70" y="36" width="12" height="34" className="fill-navy-800" />
            <rect x="88" y="22" width="12" height="48" className="fill-navy-800" />
            <path d="M40 62 L76 40 L108 26 L122 18" className="stroke-gold-500" strokeWidth="2" strokeLinecap="round" />
            <circle cx="122" cy="18" r="3.5" className="fill-gold-500" />
          </svg>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem]">
          {post.category && <span className="font-semibold tracking-wide text-gold-700 uppercase">{post.category}</span>}
          {post.published_at && (
            <time dateTime={post.published_at} className="text-ink-faint">
              {formatDate(post.published_at)}
            </time>
          )}
        </div>
        <Heading className="mt-3 text-[1.2rem] leading-snug">
          {/* Stretched link: the whole card is clickable while keeping one accessible link. */}
          <Link to={`/insights/${post.slug}`} className="no-underline after:absolute after:inset-0 group-hover:text-navy-600">
            {post.title}
          </Link>
        </Heading>
        <p className="mt-2.5 line-clamp-3 text-[0.94rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
        <span className="link-arrow mt-auto pt-5 text-[0.9rem]" aria-hidden="true">
          Read article
          <Icon name="arrowRight" className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

export default function Insights() {
  usePageMeta('Insights', 'Articles from 3DP on data strategy, data systems, analytics skills and data protection.');
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const category = params.get('category') || '';
  const { data, error, loading, reload } = useApi(`/public/posts${toQuery({ page: page > 1 ? page : '', category })}`, {
    keepPrevious: true,
  });
  const posts = data?.data || [];
  const categories = data?.categories || [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const update = (next) => {
    const merged = { category, page: page > 1 ? String(page) : '', ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)));
    window.scrollTo({ top: 0 });
  };

  const chip = (value, label) => {
    const active = category === value;
    return (
      <button
        key={value || 'all'}
        type="button"
        aria-pressed={active}
        onClick={() => update({ category: value, page: '' })}
        className={`cursor-pointer rounded-full border px-4 py-1.5 text-[0.88rem] font-medium transition-colors ${
          active ? 'border-navy-800 bg-navy-800 text-white' : 'border-line-strong bg-surface text-ink-muted hover:border-navy-600 hover:text-navy-800'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Ideas and practical guidance on becoming data driven"
        intro="Perspectives from our team on data strategy, systems, skills and responsible data use."
        breadcrumbs={[{ label: 'Insights' }]}
      />

      <Section>
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2.5" role="group" aria-label="Filter by category">
            {chip('', 'All')}
            {categories.map((c) => chip(c, c))}
          </div>
        )}

        {loading && !data && <LoadingState label="Loading articles…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!error && data && posts.length === 0 && (
          <EmptyState
            icon="file"
            title={category ? `No articles in ${category} yet` : 'No articles published yet'}
            action={category ? <button type="button" className="btn btn-secondary" onClick={() => update({ category: '', page: '' })}>Show all articles</button> : null}
          >
            New insights are on the way. Check back soon.
          </EmptyState>
        )}

        {!error && posts.length > 0 && (
          <div className={`grid gap-7 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {!error && totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 > 1 ? String(page - 1) : '' })}
              className="btn btn-secondary btn-sm"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
              Previous
            </button>
            <span className="px-3 text-[0.9rem] text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => update({ page: String(page + 1) })}
              className="btn btn-secondary btn-sm"
            >
              Next
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </nav>
        )}
      </Section>

      <CtaBand />
    </>
  );
}
