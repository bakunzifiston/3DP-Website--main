import { Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth.jsx';
import { ToastProvider } from './Toast.jsx';
import AdminLayout from './AdminLayout.jsx';
import { contentTypes } from './contentTypes.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentList from './pages/ContentList.jsx';
import ContentEditor, { NotFoundAdmin } from './pages/ContentEditor.jsx';
import { SubmissionDetail, SubmissionList } from './pages/Submissions.jsx';
import Media from './pages/Media.jsx';
import Settings from './pages/Settings.jsx';
import Users from './pages/Users.jsx';
import Account from './pages/Account.jsx';
import Activity from './pages/Activity.jsx';

// Remount the editor when moving between records (e.g. after "create" redirects to the new id).
function Editor({ typeKey }) {
  const { id } = useParams();
  return <ContentEditor key={`${typeKey}-${id}`} typeKey={typeKey} type={contentTypes[typeKey]} />;
}

// Routes are relative to /admin (mounted as "admin/*" in main.jsx).
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inquiries" element={<SubmissionList key="inquiries" typeKey="inquiries" />} />
            <Route path="inquiries/:id" element={<SubmissionDetail typeKey="inquiries" />} />
            <Route path="applications" element={<SubmissionList key="applications" typeKey="applications" />} />
            <Route path="applications/:id" element={<SubmissionDetail typeKey="applications" />} />
            {Object.entries(contentTypes).map(([key, type]) => [
              <Route key={key} path={key} element={<ContentList key={key} typeKey={key} type={type} />} />,
              <Route key={`${key}-edit`} path={`${key}/:id`} element={<Editor typeKey={key} />} />,
            ])}
            <Route path="media" element={<Media />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="users"
              element={
                <RequireAuth role="admin">
                  <Users />
                </RequireAuth>
              }
            />
            <Route path="account" element={<Account />} />
            <Route path="activity" element={<Activity />} />
            <Route path="*" element={<NotFoundAdmin />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
