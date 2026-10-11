# PK Khmer Type — Supabase Authentication & Cross-Device Cloud Sync Setup Guide

This guide explains how to configure, deploy, and verify the free-tier **Supabase Authentication**, **Postgres Database with Row Level Security (RLS)**, and **Private Cloud Storage (`user-files`)** system for **PK Khmer Type**.

---

## 1. Architecture Overview

PK Khmer Type uses a **local-first, cloud-synchronized** architecture designed to work both offline and across multiple devices on static GitHub Pages hosting (`https://phanaach4889.github.io/PK-Khmer-Type/`):

- **Frontend Runtime:** Static HTML5 / CSS3 / Vanilla ES6+ with Vite build/dev tooling (`vite.config.js`) and the official `@supabase/supabase-js` client (`js/vendor/supabase.js` + `js/supabase-config.js`).
- **Authentication (`js/storage.js`):** Real Supabase email-and-password authentication (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`, `resend`, persistent session management). Never falls back to fake or simulated authentication when credentials are missing.
- **Database (`supabase/migrations/20261010000001_pk_khmer_type_cloud_sync.sql`):**
  - `public.profiles`: User display name and timestamps (`id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`), provisioned automatically by a hardened `SECURITY DEFINER` trigger (`public.handle_new_user()`) with `SET search_path = public` and an `EXCEPTION WHEN OTHERS` safety block so trigger errors can never block account registration.
  - `public.user_settings`: Validated JSONB user preferences (`user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`) with a database `CHECK` constraint (`public.validate_user_settings_payload(settings)`) that caps payload size at 64 KB and rejects privileged or secret keys.
  - `public.lesson_progress`: Composite primary key `(user_id, lesson_id)` storing per-lesson progress JSONB (`completed`, `masteryState`, `starsEarned`, `bestWpm`, `bestAccuracy`, `totalAttempts`, `completionCount`, per-exercise records) protected by a server-side monotonic merge trigger (`public.merge_lesson_progress_on_update()`) so concurrent updates never regress completed lessons or lower personal bests.
  - `public.user_files`: Personal cloud file metadata (`id`, `user_id`, `storage_path`, `file_name`, `file_category`, `mime_type`, `size_bytes`, timestamps) enforcing `storage_path LIKE user_id::text || '/%'`.
- **Private Object Storage (`storage.buckets` / `storage.objects`):** Private bucket `user-files` (`public = false`, 2 MB file size limit, allowed MIME types: `application/json`, `text/plain`, `image/png`, `image/jpeg`, `image/webp`, `image/gif`) with folder-scoped RLS (`(storage.foldername(name))[1] = auth.uid()::text`).
- **Offline Queue & Conflict Resolution (`js/cloud-sync.js`):** Queues offline mutations in IndexedDB (`pk_cloud_sync_db` with `localStorage` fallback), flushes automatically with exponential backoff when connectivity resumes, and isolates local state across accounts via `pk_cloud_owner_user_id`.

---

## 2. Step-by-Step Supabase Project Setup (Free Tier)

### Step 1: Create a Free Supabase Project
1. Sign in to [https://supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Choose an organization, enter a project name (e.g., `pk-khmer-type`), generate a strong database password, select a region close to your users (e.g., Singapore `ap-southeast-1`), and select the **Free Plan**.
3. Wait for the project provisioning to complete.

### Step 2: Run the SQL Migration
You can apply the schema, triggers, storage bucket, and Row Level Security policies using either the **Supabase SQL Editor** or the **Supabase CLI**:

#### Option A — Supabase Dashboard SQL Editor (Fastest)
1. In your Supabase Dashboard, open **SQL Editor** from the left sidebar and click **New query**.
2. Copy the entire contents of [`supabase/migrations/20261010000001_pk_khmer_type_cloud_sync.sql`](../supabase/migrations/20261010000001_pk_khmer_type_cloud_sync.sql) and paste it into the editor.
3. Click **Run**. Confirm that the query succeeds with no errors.

#### Option B — Supabase CLI
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Step 3: Configure Email/Password Authentication & Redirect URLs
1. In the Supabase Dashboard, navigate to **Authentication -> Providers -> Email**:
   - Ensure **Enable Email provider** is turned **ON**.
   - **Confirm email:** Turn **ON** if you want users to verify their email address before signing in (PK Khmer Type automatically displays the confirmation-pending screen and resend button when enabled), or **OFF** for immediate sign-in after registration.
   - Set **Minimum password length** to `8`.
2. Navigate to **Authentication -> URL Configuration**:
   - Set **Site URL** to your production GitHub Pages URL:
     ```text
     https://phanaach4889.github.io/PK-Khmer-Type/
     ```
   - Under **Redirect URLs**, add both your production GitHub Pages URLs and your local development URLs:
     ```text
     https://phanaach4889.github.io/PK-Khmer-Type/
     https://phanaach4889.github.io/PK-Khmer-Type/index.html
     http://localhost:5173/
     http://localhost:5173/index.html
     http://127.0.0.1:5173/
     ```
   - Click **Save changes**.

### Step 4: Verify the `user-files` Private Storage Bucket
The SQL migration automatically creates and secures the private `user-files` bucket. To verify it in the dashboard:
1. Open **Storage** in the Supabase Dashboard.
2. Confirm that the `user-files` bucket is listed with a **Private** badge (not Public).
3. Under **Storage -> Policies**, confirm that the four `user_files_storage_*_own` policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) are active on `storage.objects`.

---

## 3. Environment Variables & Security Rules

> [!IMPORTANT]
> All environment variables prefixed with `VITE_` are bundled into the public frontend JavaScript. **Never** place a `service_role` key, `sb_secret_` key, database password, or private token in `.env.local` or GitHub Actions variables. `js/supabase-config.js` actively inspects keys at startup and refuses to initialize if a `service_role` or `sb_secret_` key is detected.

### Local Environment Setup (`.env.local`)
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. In your Supabase Dashboard, go to **Project Settings -> API** and copy your **Project URL** and **anon / publishable public key**:
   ```dotenv
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
   ```
3. Generate the runtime configuration file and start the local server:
   ```bash
   npm install
   npm run build:config
   npm run dev
   ```
   *( Note: `.env`, `.env.local`, `.env.*.local`, and `js/supabase-env.js` are excluded in `.gitignore` so credentials are never committed to Git. )*

### GitHub Pages Deployment Configuration
To enable Supabase Auth and Cloud Sync on the live GitHub Pages deployment (`https://phanaach4889.github.io/PK-Khmer-Type/`):
1. Open your GitHub repository **Settings -> Secrets and variables -> Actions**.
2. Under the **Variables** tab (or **Secrets** tab), add:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-anon-or-publishable-key>`
3. On every push to `main`, `.github/workflows/deploy.yml` runs `node scripts/generate_supabase_config.js` to inject `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `_site/js/supabase-env.js` before deploying to GitHub Pages.

---

## 4. Running Tests & Validation

Run the automated test suite and curriculum validator locally at any time:

```bash
# Run the 16-test Auth, RLS, Cloud Sync, File Sync & Regression suite
npm test

# Run curriculum integrity validation + automated cloud sync tests
npm run validate
```

---

## 5. Manual Cross-Device & RLS Verification Checklist

1. **Unconfigured Notice:** Temporarily clear `.env.local`, run `npm run build:config`, and open the Sign In modal. Verify that the amber **Cloud Sync Setup Required** banner explains which environment variables are missing and that submitting the form does not fake a login.
2. **Registration & Profile Provisioning:** Configure `.env.local`, register a new account (`userA@example.com`), and verify in **Supabase Table Editor -> `profiles`** that a row with `id = auth.uid()` and your `display_name` was created.
3. **Cross-Device Settings & Progress Sync:**
   - Complete a lesson (e.g., `standard-L00-01`) and switch the theme in Settings while signed in on Browser A.
   - Sign in with the same account in an incognito window (Browser B). Verify that the completed lesson, WPM, accuracy, and theme appear automatically.
4. **Offline Queue & Reconnection:**
   - In Browser DevTools (**Network -> Offline**), complete a lesson or toggle a setting. Verify the topbar badge switches to `Offline (Queued)`.
   - Switch Network back to **Online** and verify the badge transitions to `Syncing...` -> `Cloud Synced` and the row is updated in `public.lesson_progress`.
5. **Private Cloud Files (`user-files`):**
   - Open **Your Account -> Personal Cloud Files** and click **Save Snapshot**. Verify the `.json` snapshot appears in the list and inside `user-files/<your-uuid>/` in Supabase Storage.
   - Sign in as a second account (`userB@example.com`) and verify User B cannot see or download User A's files.
6. **Account Deletion:**
   - Click **Delete Account** in the Account modal and confirm. Verify that the user's `auth.users` account, `profiles`, `user_settings`, `lesson_progress`, `user_files`, and private storage objects in `user-files` are permanently deleted.

