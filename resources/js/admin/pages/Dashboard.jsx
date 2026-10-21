import { Link } from 'react-router-dom';
import { usePageMeta } from '../../lib/hooks.js';
import { timeAgo, interestLabel } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { EmptyState, ErrorState } from '../../components/ui/Feedback.jsx';
import { useAuth } from '../auth.jsx';
import { useStats } from '../AdminLayout.jsx';
import { PageHeader, StatusBadge } from '../ui.jsx';
import { CountUp } from '../../lib/motion.jsx';
import WeeklyChart from '../components/WeeklyChart.jsx';

function StatTile({ label, value, sub, to, icon, highlight }) {
  return (
    <Link to={to} className="card card-hover block p-5 no-underline">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.85rem] font-medium text-ink-muted">{label}</p>
        <Icon name={icon} className="h-5 w-5 text-ink-faint" />
      </div>
      <p className="mt-2 font-display text-[2rem] leading-none font-semibold text-navy-800 tabular-nums">{typeof value === 'number' ? <CountUp value={value} /> : '–'}</p>
      {sub && <p className={`mt-2 text-[0.8rem] ${highlight ? 'font-semibold text-gold-700' : 'text-ink-faint'}`}>{sub}</p>}
    </Link>
  );
}

function RecentList({ title, to, items, empty, render }) {
  return (
    <section className="card flex flex-col">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-[1rem]">{title}</h2>
        <Link to={to} className="text-[0.82rem] font-medium text-navy-700 no-underline hover:underline">
          View all
        </Link>
      </div>
      {items.length ? <ul className="divide-y divide-line">{items.map(render)}</ul> : <EmptyState icon="inbox" title={empty} className="py-10" />}
    </section>
  );
}

export default function Dashboard() {
  usePageMeta('Admin · Dashboard');
  const { user } = useAuth();
  const { stats, error, refresh, loading } = useStats();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (error && !stats) return <ErrorState error={error} onRetry={refresh} />;
  const c = stats?.counts || {};

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(' ')[0]}`}
        description="Here is what is happening on the 3DP website."
        actions={
          <>
            <Link to="/admin/posts/new" className="btn btn-secondary btn-sm">
              <Icon name="plus" className="h-4 w-4" />
              New article
            </Link>
            <Link to="/admin/programs/new" className="btn btn-primary btn-sm">
              <Icon name="plus" className="h-4 w-4" />
              New program
            </Link>
          </>
        }
      />

      <div className={`grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-4 ${loading && !stats ? 'opacity-60' : ''}`}>
        <StatTile label="New inquiries" value={c.new_inquiries} sub={`${c.total_inquiries ?? 0} received in total`} to="/admin/inquiries?status=new" icon="inbox" highlight={c.new_inquiries > 0} />
        <StatTile label="New applications" value={c.new_applications} sub={`${c.total_applications ?? 0} received in total`} to="/admin/applications?status=new" icon="clipboard" highlight={c.new_applications > 0} />
        <StatTile label="Published programs" value={c.published_programs} sub={`${c.published_services ?? 0} services published`} to="/admin/programs" icon="train" />
        <StatTile label="Published articles" value={c.published_posts} sub={`${c.draft_posts ?? 0} drafts`} to="/admin/posts" icon="file" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-5">
          <h2 className="text-[1rem]">Submissions per week</h2>
          <p className="mb-4 text-[0.82rem] text-ink-faint">Contact inquiries and program applications, last 8 weeks</p>
          <WeeklyChart weekly={stats?.weekly} />
        </section>

        <section className="card p-5">
          <h2 className="text-[1rem]">Applications by program</h2>
          <p className="mb-4 text-[0.82rem] text-ink-faint">All time</p>
          {stats?.applicationsByProgram?.length ? (
            <ul className="space-y-4">
              {stats.applicationsByProgram.map((p) => {
                const max = Math.max(...stats.applicationsByProgram.map((x) => x.total));
                return (
                  <li key={p.program}>
                    <div className="mb-1.5 flex justify-between gap-3 text-[0.85rem]">
                      <span className="truncate text-ink">{p.program}</span>
                      <span className="font-semibold text-ink tabular-nums">{p.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2">
                      <div className="h-2 rounded-full bg-[#c47f12]" style={{ width: `${(p.total / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon="clipboard" title="No applications yet" className="py-8">
              Applications submitted from program pages will appear here.
            </EmptyState>
          )}
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentList
          title="Latest inquiries"
          to="/admin/inquiries"
          items={stats?.recentInquiries || []}
          empty="No inquiries yet"
          render={(q) => (
            <li key={q.id}>
              <Link to={`/admin/inquiries/${q.id}`} className="flex items-center gap-3 px-5 py-3 no-underline hover:bg-surface-2/50">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[0.9rem] ${q.status === 'new' ? 'font-semibold text-ink' : 'text-ink'}`}>{q.name}</p>
                  <p className="truncate text-[0.8rem] text-ink-faint">
                    {[q.organization, interestLabel(q.interest)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={q.status} />
                <span className="hidden w-20 text-right text-[0.78rem] text-ink-faint sm:block">{timeAgo(q.created_at)}</span>
              </Link>
            </li>
          )}
        />
        <RecentList
          title="Latest applications"
          to="/admin/applications"
          items={stats?.recentApplications || []}
          empty="No applications yet"
          render={(a) => (
            <li key={a.id}>
              <Link to={`/admin/applications/${a.id}`} className="flex items-center gap-3 px-5 py-3 no-underline hover:bg-surface-2/50">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[0.9rem] ${a.status === 'new' ? 'font-semibold text-ink' : 'text-ink'}`}>{a.full_name}</p>
                  <p className="truncate text-[0.8rem] text-ink-faint">{a.program_title}</p>
                </div>
                <StatusBadge status={a.status} />
                <span className="hidden w-20 text-right text-[0.78rem] text-ink-faint sm:block">{timeAgo(a.created_at)}</span>
              </Link>
            </li>
          )}
        />
      </div>
    </>
  );
}
