import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/site/SiteLayout.jsx';
import { LoadingState } from './components/ui/Feedback.jsx';
import Home from './pages/Home.jsx';
import './index.css';

// Inner pages and the admin dashboard are code-split so the home page loads fast.
const About = lazy(() => import('./pages/About.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const Programs = lazy(() => import('./pages/Programs.jsx'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail.jsx'));
const WhoWeServe = lazy(() => import('./pages/WhoWeServe.jsx'));
const Insights = lazy(() => import('./pages/Insights.jsx'));
const Article = lazy(() => import('./pages/Article.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

const page = (Component) => (
  <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
    <Component />
  </Suspense>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={page(About)} />
          <Route path="services" element={page(Services)} />
          <Route path="services/:slug" element={page(ServiceDetail)} />
          <Route path="programs" element={page(Programs)} />
          <Route path="programs/:slug" element={page(ProgramDetail)} />
          <Route path="who-we-serve" element={page(WhoWeServe)} />
          <Route path="insights" element={page(Insights)} />
          <Route path="insights/:slug" element={page(Article)} />
          <Route path="contact" element={page(Contact)} />
          <Route path="privacy" element={page(Privacy)} />
          <Route path="*" element={page(NotFound)} />
        </Route>
        <Route path="admin/*" element={page(AdminApp)} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
