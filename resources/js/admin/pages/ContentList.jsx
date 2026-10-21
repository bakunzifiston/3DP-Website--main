import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toQuery } from '../../lib/api.js';
import { usePageMeta } from '../../lib/hooks.js';
import { formatDate } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { Badge, EmptyState, ErrorState } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { ConfirmDialog, PageHeader, Pagination, SearchInput, SkeletonRows, StatusBadge, Table } from '../ui.jsx';

export default function ContentList({ typeKey, type }) {
  usePageMeta(`Admin · ${type.plural}`);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const filterValue = type.filter ? params.get(type.filter.name) || '' : '';
  const page = Number(params.get('page')) || 1;
  const { data, error, loading, reload } = useAdminApi(
    `/admin/${typeKey}${toQuery({ q, page, pageSize: 25, ...(type.filter ? { [type.filter.name]: filterValue } : {}) })}`,
    { keepPrevious: true }
  );
  const request = useAdminRequest();
  const toast = useToast();
  const [deleting, setDeleting] = useState(null);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const rows = data?.data || [];
  const filtered = Boolean(q || filterValue);

  return (
    <>
      <PageHeader
        title={type.plural}
        description={type.description}
        actions={
          <Link to={`/admin/${typeKey}/new`} className="btn btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            New {type.singular.toLowerCase()}
          </Link>
        }
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={(v) => setParam('q', v)} placeholder={`Search ${type.plural.toLowerCase()}…`} className="sm:max-w-[320px] sm:flex-1" />
          {type.filter && (
            <select className="input cursor-pointer !py-2 sm:w-auto" aria-label={`Filter by ${type.filter.label}`} value={filterValue} onChange={(e) => setParam(type.filter.name, e.target.value)}>
              <option value="">All {type.filter.label.toLowerCase()}s</option>
              {type.filter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {data && <p className="text-[0.85rem] text-ink-faint sm:ml-auto">{data.total} total</p>}
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data && loading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={type.icon}
            title={filtered ? 'No matches' : `No ${type.plural.toLowerCase()} yet`}
            action={
              !filtered && (
                <Link to={`/admin/${typeKey}/new`} className="btn btn-primary btn-sm">
                  Create the first one
                </Link>
              )
            }
          >
            {filtered ? 'Try a different search or filter.' : `Create a ${type.singular.toLowerCase()} to show it on the website.`}
          </EmptyState>
        ) : (
          <Table
            columns={[
              { label: type.singular },
              { label: 'Details', className: 'hidden md:table-cell' },
              { label: 'Status' },
              { label: 'Actions', srOnly: true, className: 'w-px' },
            ]}
          >
            {rows.map((row) => {
              const meta = type.meta?.(row);
              const publicPath = type.publicPath?.(row);
              const visible = type.statusField ? row[type.statusField] === 'published' : row.is_published;
              const image = row[type.imageField];
              return (
                <tr key={row.id} className={`align-top hover:bg-surface-2/40 ${loading ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {type.imageField && (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-50 text-navy-600">
                          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Icon name="user" className="h-5 w-5" />}
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link to={`/admin/${typeKey}/${row.id}`} className="font-semibold text-ink no-underline hover:text-navy-700 hover:underline">
                          {row[type.titleField]}
                        </Link>
                        <p className="mt-0.5 line-clamp-2 max-w-[60ch] text-[0.82rem] text-ink-faint">{row[type.subtitleField]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-col items-start gap-1">
                      {meta && <Badge tone={meta.tone}>{meta.label}</Badge>}
                      {type.dateField && <span className="text-[0.8rem] text-ink-faint">{row[type.dateField] ? formatDate(row[type.dateField]) : 'Not published'}</span>}
                      {row.category && <span className="text-[0.8rem] text-ink-faint">{row.category}</span>}
                      {'sort_order' in row && <span className="text-[0.75rem] text-ink-faint">Order {row.sort_order}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {type.statusField ? <StatusBadge status={row[type.statusField]} /> : <Badge tone={visible ? 'success' : 'neutral'}>{visible ? 'Published' : 'Hidden'}</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {publicPath && visible && (
                        <a href={publicPath} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm !px-2" aria-label={`View ${row[type.titleField]} on the website`}>
                          <Icon name="external" className="h-4 w-4" />
                        </a>
                      )}
                      <Link to={`/admin/${typeKey}/${row.id}`} className="btn btn-ghost btn-sm !px-2" aria-label={`Edit ${row[type.titleField]}`}>
                        <Icon name="edit" className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => setDeleting(row)} className="btn btn-ghost btn-sm !px-2 text-danger hover:!bg-danger-bg" aria-label={`Delete ${row[type.titleField]}`}>
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={(p) => setParam('page', String(p))} />}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${type.singular.toLowerCase()}?`}
        message={`"${deleting?.[type.titleField]}" will be permanently deleted and removed from the website. This cannot be undone.`}
        onConfirm={async () => {
          try {
            await request(`/admin/${typeKey}/${deleting.id}`, { method: 'DELETE' });
            toast(`${type.singular} deleted`);
            reload();
          } catch (err) {
            toast(err.message, 'error');
          }
        }}
      />
    </>
  );
}
