# 3DP Website & CMS

Website and content management system for **3DP: Data Driven Decisions Partners**, a Kigali-based firm helping
companies and individuals become data driven through training, data products, data-driven systems, and strategy.

- **Backend:** Laravel 12 (PHP 8.2+), Eloquent, Sanctum (session-based SPA authentication)
- **Database:** MySQL 8+ or MariaDB 10.4+ (content, submissions, users, sessions, cache)
- **Frontend:** React 19 + React Router 7 single-page app in `resources/js`, built with Vite 7 and Tailwind CSS v4
  through `laravel-vite-plugin`

## Quick start (local development)

Requires PHP 8.2+ (with `pdo_mysql`, `mbstring`, `fileinfo`, `gd`), Composer, Node.js 20.19+ and a running
MySQL/MariaDB server (XAMPP, MAMP, Homebrew or Docker all work).

```bash
# 1. Create a database and a user limited to it (adjust the password):
mysql -uroot -p -e "
  CREATE DATABASE threedp_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'threedp_app'@'localhost' IDENTIFIED BY 'a-strong-password';
  GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, DROP ON threedp_cms.* TO 'threedp_app'@'localhost';"

# 2. Install and configure
composer install
npm install
cp .env.example .env            # then fill in DB_* and ADMIN_* values
php artisan key:generate
php artisan storage:link        # serves uploaded images at /uploads

# 3. Create tables, load the initial content and the first admin account
php artisan migrate --seed

# 4. Run Laravel (http://localhost:8000) and the Vite dev server together
npm run dev                     # or: composer dev
```

Open **http://localhost:8000**. The admin dashboard is at **http://localhost:8000/admin**; sign in with
`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. If `ADMIN_PASSWORD` was empty, `db:seed` printed a generated
password once. Change it under **Account** after signing in.

> Use port 8000 (Laravel), not 5173. The Vite server only serves assets and hot reload.

| Command | What it does |
| --- | --- |
| `npm run dev` | `php artisan serve` + Vite with hot reload |
| `npm run build` | Production build of the frontend into `public/build` |
| `php artisan migrate` | Apply new migrations from `database/migrations` |
| `php artisan db:seed` | Insert initial content and the first admin (safe to re-run; never overwrites) |
| `php artisan test` | Feature tests (run on in-memory SQLite, never touch your MySQL data) |

## Website pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about` | About 3DP, approach, team |
| `/services`, `/services/{slug}` | Services grouped by Train / Build / Advise, and a page per service |
| `/programs`, `/programs/{slug}` | Training programs, each with an online application form |
| `/who-we-serve` | Startups, SMEs, enterprises, public sector, individuals |
| `/insights`, `/insights/{slug}` | Articles |
| `/contact` | Contact details and enquiry form |
| `/privacy` | Privacy notice |
| `/admin` | Admin dashboard (sign-in required) |

Laravel serves one Blade shell (`resources/views/app.blade.php`) for every non-API path and React Router renders
the page. All data comes from the JSON API under `/api`.

## Admin dashboard

- **Dashboard:** new enquiries/applications, weekly submission trend, recent submissions
- **Content:** services, programs, insights (draft/publish), team members, testimonials
- **Enquiries & applications:** inbox with statuses, internal notes, reply by email, CSV export
- **Media library:** image uploads used by services, programs, articles and team profiles
- **Settings:** homepage hero text, contact details, social links (admins only)
- **Users:** admin and editor accounts (admins only). **Activity log:** audit trail of changes

Roles: **admin** can do everything; **editor** can manage content and submissions but not settings or users.

Body text fields use a light format: blank line between paragraphs, `## Heading`, `- bullet`, `**bold**`,
`[link](https://...)`. It is rendered without raw HTML, so content cannot inject scripts.

## Project structure

```
app/
  Cms/ContentTypes.php            Content type definitions (validation, defaults, search, ordering)
  Http/Controllers/Api/           PublicController, SubmissionController (forms), AuthController
  Http/Controllers/Api/Admin/     Dashboard, Content (generic CRUD), Submissions, Media, Settings, Users, Activity
  Http/Middleware/                EnsureRole, EnsureUserIsActive, SecurityHeaders
  Models/                         Eloquent models
bootstrap/app.php                 Middleware (Sanctum stateful API, security headers) and JSON error format
config/cms.php                    First admin account settings for the seeder
database/migrations/              Schema
database/seeders/                 Initial content (data/initial-content.json) and first admin
routes/api.php                    JSON API
routes/web.php                    CSV downloads + SPA shell
resources/views/app.blade.php     HTML shell (meta, fonts, Vite assets)
resources/js/
  main.jsx                        Routes (public pages + lazy-loaded admin)
  index.css                       Design tokens and shared component classes
  lib/                            API client (CSRF-aware), hooks, formatters
  components/ui|site|illustrations
  pages/                          Public pages
  admin/                          Admin dashboard
public/                           Favicons (cropped from the official logo), built assets
storage/app/uploads/              Uploaded images (symlinked to public/uploads)
tests/Feature/                    API, auth and admin feature tests
```

## API conventions

- Lists: `{ data, total, page, pageSize }`. Single records: `{ data }`.
- Errors: `{ error: "message", fields?: { field: "message" } }` with the matching HTTP status
  (422 validation, 401 signed out, 403 forbidden, 404, 419 expired CSRF token, 423 locked account, 429 rate limited).

## Security notes

- Session authentication through Sanctum's SPA mode: `HttpOnly` encrypted session cookie stored in MySQL,
  CSRF token (`XSRF-TOKEN` cookie / `X-XSRF-TOKEN` header) required on every state-changing request.
- Passwords hashed with bcrypt; minimum 10 characters with letters and numbers. Changing a password signs out
  other devices; deactivating a user ends their sessions.
- Accounts lock for 15 minutes after 5 failed sign-ins; sign-in, form and API requests are rate limited.
- All input validated server-side; Eloquent/query builder parameter binding throughout.
- Uploads: JPG/PNG/WebP/GIF only (content-sniffed, SVG excluded), 5 MB, stored under random names.
- Security headers on every response; strict Content-Security-Policy and HSTS in production.
- Public forms have a honeypot field and an explicit consent checkbox; CSV exports neutralise formula injection.

## Deploying to production

1. PHP 8.2+ with php-fpm behind nginx or Apache (document root: `public/`), MySQL 8+/MariaDB 10.4+, HTTPS.
2. Create the database and a dedicated user as above, with a strong, unique password.
3. Set `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://your-domain`, `DB_*`,
   `SESSION_SECURE_COOKIE=true`, `SANCTUM_STATEFUL_DOMAINS=your-domain,www.your-domain`, and `TRUSTED_PROXIES`
   if behind a load balancer. Remove `PHP_CLI_SERVER_WORKERS` (development only).
4. Deploy:
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan key:generate        # first deploy only
   php artisan storage:link
   php artisan migrate --seed --force
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```
5. Back up the database and `storage/app/uploads/` regularly.
