import { Link, useParams } from 'react-router-dom';
import { Section, SectionHeading, CtaBand } from '../components/site/Blocks.jsx';
import Container from '../components/Container.jsx';
import Icon from '../components/ui/Icon.jsx';
import RichText from '../components/ui/RichText.jsx';
import { LoadingState, ErrorState } from '../components/ui/Feedback.jsx';
import { useApi, usePageMeta } from '../lib/hooks.js';
import { formatDate, readingTime } from '../lib/format.js';
import { PostCard } from './Insights.jsx';

export default function Article() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useApi(`/public/posts/${encodeURIComponent(slug)}`);
  const post = data?.data;
  const related = data?.related || [];
  usePageMeta(post?.title || (error ? 'Article not found' : 'Insights'), post?.excerpt);

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading article…" />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState error={error} onRetry={reload} />
        <div className="text-center">
          <Link to="/insights" className="btn btn-secondary">
            <Icon name="arrowLeft" className="h-4 w-4" />
            All insights
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-line bg-surface">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
          <Container className="relative max-w-[820px] py-14 lg:py-20">
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link to="/insights" className="link-arrow text-[0.9rem]">
                <Icon name="arrowLeft" className="h-4 w-4" />
                All insights
              </Link>
            </nav>
            {post.category && <p className="eyebrow mb-4">{post.category}</p>}
            <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.12]">{post.title}</h1>
            <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[0.88rem] text-ink-faint">
              {post.author_name && (
                <span className="flex items-center gap-2">
                  <Icon name="user" className="h-4 w-4" />
                  {post.author_name}
                </span>
              )}
              {post.published_at && (
                <time dateTime={post.published_at} className="flex items-center gap-2">
                  <Icon name="calendar" className="h-4 w-4" />
                  {formatDate(post.published_at)}
                </time>
              )}
              <span className="flex items-center gap-2">
                <Icon name="clock" className="h-4 w-4" />
                {readingTime(post.body)}
              </span>
            </div>
          </Container>
        </header>

        <Container className="max-w-[820px] py-14 lg:py-16">
          {post.cover_image && (
            <img src={post.cover_image} alt="" className="mb-12 aspect-[16/9] w-full rounded-lg border border-line object-cover" />
          )}
          <RichText text={post.body} className="prose-3dp text-[1.08rem]" />
          <div className="mt-14 flex flex-col gap-4 rounded-lg border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.98rem] text-ink">
              <strong className="font-semibold">Want to talk this through?</strong>{' '}
              <span className="text-ink-muted">Our team is happy to discuss how it applies to your organisation.</span>
            </p>
            <Link to="/contact" className="btn btn-primary shrink-0">
              Contact us
            </Link>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <Section tone="sand">
          <SectionHeading eyebrow="Keep reading" title="Related insights" />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} headingLevel="h3" />
            ))}
          </div>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
