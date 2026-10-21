import { useState } from 'react';
import { usePageMeta } from '../../lib/hooks.js';
import { formatDateTime, timeAgo } from '../../lib/format.js';
import { EmptyState, ErrorState } from '../../components/ui/Feedback.jsx';
import { useAdminApi } from '../auth.jsx';
import { PageHeader, Pagination, SkeletonRows, Table } from '../ui.jsx';

const entityLabels = {
  services: 'service',
  programs: 'program',
  posts: 'article',
  team: 'team member',
  testimonials: 'testimonial',
  inquiries: 'inquiry',
  applications: 'application',
  media: 'image',
  users: 'user',
  settings: 'site settings',
  auth: '',
};

export default function Activity() {
  usePageMeta('Admin · Activity log');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAdminApi(`/admin/activity?page=${page}`, { keepPrevious: true });

  return (
    <>
      <PageHeader title="Activity log" description="A record of changes made in this dashboard, for accountability and troubleshooting." />
      <div className="card">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data ? (
          <SkeletonRows />
        ) : data.data.length === 0 ? (
          <EmptyState icon="activity" title="No activity yet" />
        ) : (
          <Table columns={[{ label: 'Who' }, { label: 'What' }, { label: 'When', className: 'text-right' }]}>
            {data.data.map((a) => (
              <tr key={a.id} className={loading ? 'opacity-60' : ''}>
                <td className="px-4 py-2.5 whitespace-nowrap text-ink">{a.user_name || <span className="text-ink-faint">Deleted user</span>}</td>
                <td className="px-4 py-2.5 text-ink-muted">
                  {a.action} {entityLabels[a.entity] ?? a.entity}
                  {a.summary && <span className="text-ink"> “{a.summary}”</span>}
                </td>
                <td className="px-4 py-2.5 text-right text-[0.82rem] whitespace-nowrap text-ink-faint" title={formatDateTime(a.created_at)}>
                  {timeAgo(a.created_at)}
                </td>
              </tr>
            ))}
          </Table>
        )}
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
      </div>
    </>
  );
}
