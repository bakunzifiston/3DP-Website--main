import { useState } from 'react';
import { usePageMeta } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { Field, Switch } from '../../components/ui/Form.jsx';
import { Alert, Badge, ErrorState, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest, useAuth } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { ConfirmDialog, Modal, PageHeader, SkeletonRows, Table } from '../ui.jsx';

const empty = { name: '', email: '', role: 'editor', is_active: true, password: '' };

function UserForm({ user, onClose, onSaved }) {
  const isNew = !user;
  const { user: me } = useAuth();
  const request = useAdminRequest();
  const [values, setValues] = useState(user ? { ...user, password: '' } : empty);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const isSelf = user?.id === me.id;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      const body = { name: values.name, email: values.email, role: values.role, is_active: values.is_active, password: values.password };
      await request(isNew ? '/admin/users' : `/admin/users/${user.id}`, { method: isNew ? 'POST' : 'PUT', body });
      onSaved(isNew ? 'User created' : 'User updated');
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value });

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'Add user' : `Edit ${user.name}`}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="user-form" className="btn btn-primary" disabled={busy}>
            {busy && <Spinner className="h-4 w-4" />}
            {isNew ? 'Create user' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Field label="Full name" required error={errors.name}>
          {(p) => <input {...p} className="input" value={values.name} onChange={set('name')} maxLength={120} data-autofocus />}
        </Field>
        <Field label="Email" required error={errors.email}>
          {(p) => <input {...p} type="email" autoComplete="off" className="input" value={values.email} onChange={set('email')} />}
        </Field>
        <Field label="Role" error={errors.role} hint="Editors manage content and submissions. Admins can also change settings and manage users.">
          {(p) => (
            <select {...p} className="input cursor-pointer" value={values.role} onChange={set('role')} disabled={isSelf}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          )}
        </Field>
        <Field
          label={isNew ? 'Initial password' : 'New password'}
          required={isNew}
          optional={!isNew}
          error={errors.password}
          hint={isNew ? 'At least 10 characters with a letter and a number. Share it securely and ask them to change it.' : 'Leave empty to keep the current password. Setting one signs the user out everywhere.'}
        >
          {(p) => <input {...p} type="password" autoComplete="new-password" className="input" value={values.password} onChange={set('password')} />}
        </Field>
        <Switch
          checked={values.is_active}
          onChange={(v) => setValues({ ...values, is_active: v })}
          label="Active"
          description={isSelf ? 'You cannot deactivate your own account' : 'Inactive users cannot sign in'}
          disabled={isSelf}
        />
      </form>
    </Modal>
  );
}

export default function Users() {
  usePageMeta('Admin · Users');
  const { user: me } = useAuth();
  const { data, error, loading, reload } = useAdminApi('/admin/users');
  const request = useAdminRequest();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | user
  const [deleting, setDeleting] = useState(null);

  return (
    <>
      <PageHeader
        title="Users"
        description="Staff accounts that can sign in to this dashboard."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" className="h-4 w-4" />
            Add user
          </button>
        }
      />
      <div className="card">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={3} />
        ) : (
          <Table columns={[{ label: 'User' }, { label: 'Role' }, { label: 'Status' }, { label: 'Last sign-in', className: 'hidden md:table-cell' }, { label: 'Actions', srOnly: true, className: 'w-px' }]}>
            {data.data.map((u) => {
              const locked = u.locked_until && new Date(u.locked_until) > new Date();
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">
                      {u.name} {u.id === me.id && <span className="text-[0.8rem] font-normal text-ink-faint">(you)</span>}
                    </p>
                    <p className="text-[0.82rem] text-ink-faint">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === 'admin' ? 'navy' : 'neutral'}>{u.role === 'admin' ? 'Admin' : 'Editor'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {locked ? <Badge tone="warning">Locked</Badge> : <Badge tone={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>}
                  </td>
                  <td className="hidden px-4 py-3 text-[0.85rem] text-ink-muted md:table-cell">{u.last_login_at ? formatDateTime(u.last_login_at) : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}>
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      {u.id !== me.id && (
                        <button type="button" className="btn btn-ghost btn-sm !px-2 text-danger hover:!bg-danger-bg" onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`}>
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

      {editing && (
        <UserForm
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            toast(msg);
            setEditing(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete user?"
        message={`${deleting?.name} (${deleting?.email}) will lose access immediately. Consider deactivating instead to keep their history.`}
        onConfirm={async () => {
          try {
            await request(`/admin/users/${deleting.id}`, { method: 'DELETE' });
            toast('User deleted');
            reload();
          } catch (err) {
            toast(err.message, 'error');
          }
        }}
      />
    </>
  );
}
