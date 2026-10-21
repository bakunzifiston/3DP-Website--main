// Inquiries inbox and program applications: list with status tabs, search, CSV export, and a detail view
// with status changes and internal notes.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toQuery } from '../../lib/api.js';
import { usePageMeta } from '../../lib/hooks.js';
import { formatDateTime, timeAgo, interestLabel, experienceOptions } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { EmptyState, ErrorState, LoadingState, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { useStats } from '../AdminLayout.jsx';
import { ConfirmDialog, PageHeader, Pagination, SearchInput, SkeletonRows, StatusBadge, Table, Tabs } from '../ui.jsx';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const submissionTypes = {
  inquiries: {
    title: 'Inquiries',
    singular: 'Inquiry',
    description: 'Messages sent through the website contact form.',
    icon: 'inbox',
    statuses: ['new', 'read', 'replied', 'archived'],
    nameField: 'name',
    columns: ['From', 'Interest', 'Status', 'Received'],
    row: (r) => [
      <>
        <span className={r.status === 'new' ? 'font-semibold text-ink' : 'text-ink'}>{r.name}</span>
        <span className="block truncate text-[0.8rem] text-ink-faint">{[r.organization, r.email].filter(Boolean).join(' · ')}</span>
        {r.preview && <span className="mt-0.5 line-clamp-1 block max-w-[50ch] text-[0.8rem] text-ink-muted">{r.preview}</span>}
      </>,
      <span className="text-[0.85rem] text-ink-muted">{interestLabel(r.interest)}</span>,
    ],
    details: (r) => [
      ['Email', <a href={`mailto:${r.email}`} className="link">{r.email}</a>],
      ['Phone', r.phone && <a href={`tel:${r.phone}`} className="link">{r.phone}</a>],
      ['Organization', r.organization],
      ['Interested in', interestLabel(r.interest)],
      ['Received', formatDateTime(r.created_at)],
    ],
    bodyLabel: 'Message',
    bodyField: 'message',
    replySubject: () => 'Re: Your enquiry to 3DP',
  },
  applications: {
    title: 'Applications',
    singular: 'Application',
    description: 'Applications submitted from program pages.',
    icon: 'clipboard',
    statuses: ['new', 'reviewing', 'accepted', 'waitlisted', 'rejected'],
    nameField: 'full_name',
    programFilter: true,
    columns: ['Applicant', 'Program', 'Status', 'Received'],
    row: (r) => [
      <>
        <span className={r.status === 'new' ? 'font-semibold text-ink' : 'text-ink'}>{r.full_name}</span>
        <span className="block truncate text-[0.8rem] text-ink-faint">{[r.email, r.phone].filter(Boolean).join(' · ')}</span>
      </>,
      <>
        <span className="text-[0.85rem] text-ink">{r.program_title}</span>
        {r.track && <span className="block text-[0.8rem] text-ink-faint">{r.track}</span>}
      </>,
    ],
    details: (r) => [
      ['Program', r.program_title],
      ['Track', r.track],
      ['Email', <a href={`mailto:${r.email}`} className="link">{r.email}</a>],
      ['Phone', r.phone && <a href={`tel:${r.phone}`} className="link">{r.phone}</a>],
      ['Occupation', r.occupation],
      ['Experience', experienceOptions.find((o) => o.value === r.experience_level)?.label],
      ['Received', formatDateTime(r.created_at)],
    ],
    bodyLabel: 'Motivation',
    bodyField: 'motivation',
    replySubject: (r) => `Your application: ${r.program_title}`,
  },
};

export function SubmissionList({ typeKey }) {
  const type = submissionTypes[typeKey];
  usePageMeta(`Admin · ${type.title}`);
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const q = params.get('q') || '';
  const programId = params.get('program_id') || '';
  const page = Number(params.get('page')) || 1;
  const filters = { status, q, ...(type.programFilter ? { program_id: programId } : {}) };
  const { data, error, loading, reload } = useAdminApi(`/admin/${typeKey}${toQuery({ ...filters, page, pageSize: 25 })}`, { keepPrevious: true });
  const programs = useAdminApi(type.programFilter ? '/admin/programs?pageSize=100' : null);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const counts = data?.statusCounts || {};
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const rows = data?.data || [];

  return (
    <>
      <PageHeader
        title={type.title}
        description={type.description}
        actions={
          <a href={`/api/admin/${typeKey}/export.csv${toQuery({ status, q, program_id: type.programFilter ? programId : '' })}`} className="btn btn-secondary" download>
            <Icon name="download" className="h-4 w-4" />
            Export CSV
          </a>
        }
      />

      <div className="card">
        <div className="px-4 pt-2">
          <Tabs
            label="Filter by status"
            value={status}
            onChange={(v) => setParam('status', v)}
            tabs={[{ value: '', label: 'All', count: all }, ...type.statuses.map((s) => ({ value: s, label: cap(s), count: counts[s] || 0 }))]}
          />
        </div>
        <div className="flex flex-col gap-3 border-y border-line p-4 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={(v) => setParam('q', v)} placeholder="Search by name, email…" className="sm:max-w-[320px] sm:flex-1" />
          {type.programFilter && (
            <select className="input cursor-pointer !py-2 sm:w-auto" aria-label="Filter by program" value={programId} onChange={(e) => setParam('program_id', e.target.value)}>
              <option value="">All programs</option>
              {(programs.data?.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data && loading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <EmptyState icon={type.icon} title={status || q || programId ? 'Nothing matches these filters' : `No ${type.title.toLowerCase()} yet`}>
            {status || q || programId ? 'Try another status or search.' : 'New submissions from the website will appear here.'}
          </EmptyState>
        ) : (
          <Table columns={type.columns.map((label, i) => ({ label, className: i === 1 ? 'hidden md:table-cell' : i === 3 ? 'text-right' : '' }))}>
            {rows.map((r) => {
              const [first, second] = type.row(r);
              return (
                <tr key={r.id} className={`relative cursor-pointer hover:bg-surface-2/40 ${r.status === 'new' ? 'bg-gold-50/60' : ''} ${loading ? 'opacity-60' : ''}`}>
                  <td className="max-w-[360px] px-4 py-3">
                    <Link to={`/admin/${typeKey}/${r.id}`} className="no-underline after:absolute after:inset-0" aria-label={`Open ${type.singular.toLowerCase()} from ${r[type.nameField]}`}>
                      {first}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{second}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-[0.82rem] whitespace-nowrap text-ink-faint" title={formatDateTime(r.created_at)}>
                    {timeAgo(r.created_at)}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={(p) => setParam('page', String(p))} />}
      </div>
    </>
  );
}

export function SubmissionDetail({ typeKey }) {
  const type = submissionTypes[typeKey];
  const { id } = useParams();
  const navigate = useNavigate();
  const request = useAdminRequest();
  const toast = useToast();
  const { refresh: refreshStats } = useStats();
  const { data, error, loading, reload, setData } = useAdminApi(`/admin/${typeKey}/${id}`);
  const row = data?.data;
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(null);
  const [deleting, setDeleting] = useState(false);

  usePageMeta(`Admin · ${row ? row[type.nameField] : type.singular}`);

  useEffect(() => {
    if (row) setNotes(row.notes || '');
  }, [row]);
  // Opening a new inquiry marks it read on the server, so refresh the sidebar badge.
  useEffect(() => {
    if (row) refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !row) return <LoadingState />;

  const update = async (body, label) => {
    setBusy(label);
    try {
      const res = await request(`/admin/${typeKey}/${id}`, { method: 'PATCH', body });
      setData({ data: res.data });
      toast(body.status ? `Marked as ${body.status}` : 'Notes saved');
      if (body.status) refreshStats();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const body = row[type.bodyField];
  const mailto = `mailto:${row.email}?subject=${encodeURIComponent(type.replySubject(row))}`;

  return (
    <>
      <PageHeader
        back={{ to: `/admin/${typeKey}`, label: type.title }}
        title={row[type.nameField]}
        description={`${type.singular} received ${timeAgo(row.created_at)}`}
        actions={
          <>
            <a
              href={mailto}
              className="btn btn-primary"
              onClick={() => typeKey === 'inquiries' && row.status !== 'replied' && update({ status: 'replied' }, 'replied')}
            >
              <Icon name="mail" className="h-4 w-4" />
              Reply by email
            </a>
            <button type="button" className="btn btn-secondary text-danger" onClick={() => setDeleting(true)} aria-label={`Delete ${type.singular.toLowerCase()}`}>
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 text-[0.8rem] font-semibold tracking-wide text-ink-faint uppercase">{type.bodyLabel}</h2>
            {body ? (
              <p className="text-[0.98rem] leading-relaxed whitespace-pre-wrap text-ink">{body}</p>
            ) : (
              <p className="text-[0.9rem] text-ink-faint">No {type.bodyLabel.toLowerCase()} provided.</p>
            )}
          </section>
          <section className="card p-5 sm:p-6">
            <label htmlFor="notes" className="label">
              Internal notes
            </label>
            <p className="hint !mt-0 mb-2">Only visible to the 3DP team.</p>
            <textarea id="notes" rows={5} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} />
            <div className="mt-3 flex justify-end">
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy === 'notes' || notes === (row.notes || '')} onClick={() => update({ notes }, 'notes')}>
                {busy === 'notes' && <Spinner className="h-4 w-4" />}
                Save notes
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-[0.95rem]">Status</h2>
            <div className="mb-4">
              <StatusBadge status={row.status} />
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Change status">
              {type.statuses
                .filter((s) => s !== 'new' || typeKey === 'applications')
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={row.status === s}
                    disabled={Boolean(busy) || row.status === s}
                    onClick={() => update({ status: s }, s)}
                    className={`btn btn-sm ${row.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {busy === s && <Spinner className="h-3.5 w-3.5" />}
                    {cap(s)}
                  </button>
                ))}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-[0.95rem]">Details</h2>
            <dl className="space-y-3 text-[0.88rem]">
              {type
                .details(row)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[0.78rem] text-ink-faint">{k}</dt>
                    <dd className="break-words text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${type.singular.toLowerCase()}?`}
        message={`This permanently deletes the ${type.singular.toLowerCase()} from ${row[type.nameField]}, including your notes. Export it first if you need a record.`}
        onConfirm={async () => {
          try {
            await request(`/admin/${typeKey}/${id}`, { method: 'DELETE' });
            toast(`${type.singular} deleted`);
            refreshStats();
            navigate(`/admin/${typeKey}`, { replace: true });
          } catch (err) {
            toast(err.message, 'error');
          }
        }}
      />
    </>
  );
}
