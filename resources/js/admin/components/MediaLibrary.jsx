import { useRef, useState } from 'react';
import { formatBytes, formatDate } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { Alert, EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { ConfirmDialog, Modal, Pagination } from '../ui.jsx';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export function UploadDropzone({ onUploaded, compact = false }) {
  const request = useAdminRequest();
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [alt, setAlt] = useState('');

  const upload = async (file) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setError('Only JPG, PNG, WebP or GIF images can be uploaded.');
    if (file.size > MAX_BYTES) return setError(`That image is ${formatBytes(file.size)}. Images must be 5 MB or smaller.`);
    const body = new FormData();
    body.append('file', file);
    if (alt.trim()) body.append('alt_text', alt.trim());
    setBusy(true);
    try {
      const res = await request('/admin/media', { method: 'POST', body });
      setAlt('');
      onUploaded?.(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
          compact ? 'px-4 py-5' : 'px-6 py-9'
        } ${drag ? 'border-navy-600 bg-navy-50' : 'border-line-strong bg-surface'}`}
      >
        {busy ? (
          <Spinner className="h-6 w-6 text-navy-600" label="Uploading" />
        ) : (
          <Icon name="upload" className="h-6 w-6 text-ink-faint" />
        )}
        <p className="mt-2 text-[0.9rem] text-ink">
          {busy ? 'Uploading…' : 'Drag an image here, or '}
          {!busy && (
            <button type="button" onClick={() => inputRef.current?.click()} className="cursor-pointer font-semibold text-navy-700 underline underline-offset-2">
              browse
            </button>
          )}
        </p>
        <p className="mt-1 text-[0.78rem] text-ink-faint">JPG, PNG, WebP or GIF, up to 5 MB</p>
        <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
        <div className="mt-3 w-full max-w-[340px]">
          <label className="sr-only" htmlFor="media-alt">
            Alt text
          </label>
          <input
            id="media-alt"
            className="input !py-1.5 text-[0.85rem]"
            placeholder="Alt text: describe the image (recommended)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>
      {error && (
        <Alert tone="error" className="mt-3" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
}

// Grid of uploaded images. In "pick" mode clicking selects; otherwise each tile offers copy/delete.
export function MediaGrid({ onPick, selected, refreshKey = 0 }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAdminApi(`/admin/media?page=${page}&pageSize=24&_=${refreshKey}`, { keepPrevious: true });
  const request = useAdminRequest();
  const toast = useToast();
  const [deleting, setDeleting] = useState(null);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data && loading)
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton aspect-[4/3]" />
        ))}
      </div>
    );
  const items = data?.data || [];
  if (!items.length) return <EmptyState icon="image" title="No images yet">Upload an image to use it on services, programs, articles and team profiles.</EmptyState>;

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Image path copied');
    } catch {
      toast('Could not copy. Select the path and copy it manually.', 'error');
    }
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => {
          const isSelected = selected === m.url;
          return (
            <li key={m.id} className={`card overflow-hidden ${isSelected ? 'ring-2 ring-navy-700' : ''}`}>
              {onPick ? (
                <button type="button" onClick={() => onPick(m)} className="block w-full cursor-pointer text-left" aria-pressed={isSelected} aria-label={`Choose ${m.alt_text || m.original_name}`}>
                  <img src={m.url} alt={m.alt_text || ''} loading="lazy" className="aspect-[4/3] w-full bg-surface-2 object-cover" />
                </button>
              ) : (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={m.url} alt={m.alt_text || ''} loading="lazy" className="aspect-[4/3] w-full bg-surface-2 object-cover" />
                </a>
              )}
              <div className="px-3 py-2">
                <p className="truncate text-[0.8rem] font-medium text-ink" title={m.original_name}>
                  {m.original_name}
                </p>
                <p className="truncate text-[0.72rem] text-ink-faint">
                  {formatBytes(m.size_bytes)} · {formatDate(m.created_at)}
                  {m.uploaded_by ? ` · ${m.uploaded_by}` : ''}
                </p>
                {!onPick && (
                  <div className="mt-1.5 flex gap-1">
                    <button type="button" onClick={() => copy(m.url)} className="btn btn-ghost btn-sm !px-2" aria-label={`Copy path of ${m.original_name}`}>
                      <Icon name="copy" className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleting(m)} className="btn btn-ghost btn-sm !px-2 text-danger hover:!bg-danger-bg" aria-label={`Delete ${m.original_name}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      </div>
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete image?"
        message={`"${deleting?.original_name}" will be removed permanently. Any page still using it will show no image.`}
        onConfirm={async () => {
          try {
            await request(`/admin/media/${deleting.id}`, { method: 'DELETE' });
            toast('Image deleted');
            reload();
          } catch (err) {
            toast(err.message, 'error');
          }
        }}
      />
    </>
  );
}

export function MediaPickerModal({ open, onClose, onPick, selected }) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <Modal open={open} onClose={onClose} title="Choose an image" size="lg">
      <UploadDropzone
        compact
        onUploaded={(m) => {
          setRefreshKey((k) => k + 1);
          onPick(m);
        }}
      />
      <div className="mt-5">
        <MediaGrid onPick={onPick} selected={selected} refreshKey={refreshKey} />
      </div>
    </Modal>
  );
}
