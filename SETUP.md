# Setup guide — The Vet From Persia

The site is a static frontend (GitHub Pages) backed by a free [Supabase](https://supabase.com)
project that stores the stories, questions, and uploaded photos, and handles the vet's login.
One-time setup takes about 10 minutes.

## 1. Create the Supabase project

1. Go to <https://supabase.com>, sign up (free), and click **New project**.
2. Pick any name (e.g. `vet-from-persia`), set a strong database password (you won't need it
   day-to-day), choose a region near you, and create the project.

## 2. Create the database

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo.
3. **Edit the last statement** — replace `CHANGE_ME@example.com` with the email your
   girlfriend will use to log in.
4. Paste the whole file into the SQL editor and click **Run**.

This creates the tables (stories, questions, photos), the image storage bucket, and the
security rules. Only the email(s) listed in the `admins` table can ever change content —
everyone else can only read published stories and submit questions.

## 3. Create her login

1. In the dashboard, go to **Authentication → Users → Add user → Create new user**.
2. Enter the same email you put in the `admins` table, choose a password, and check
   **Auto confirm user**.
3. Recommended: go to **Authentication → Sign In / Providers → Email** and turn **off**
   "Allow new users to sign up". (Even if you skip this, strangers who sign up get no
   access — the `admins` table is what grants power — but it keeps things tidy.)

## 4. Connect the site to Supabase

Get the two values from **Project Settings → API**:

- **Project URL** (looks like `https://abcdefgh.supabase.co`)
- **anon / public key** (a long `eyJ...` string — safe to expose publicly)

Then add them as GitHub Actions secrets so the deployed site can use them:

1. On GitHub, open the repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Create `VITE_SUPABASE_URL` with the Project URL.
3. Create `VITE_SUPABASE_ANON_KEY` with the anon key.
4. Push to `main` (or re-run the deploy workflow) so the site rebuilds with the connection.

For local development, create a `.env.local` file next to `package.json`:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`.env.local` is git-ignored. (Alternative: paste the values directly into
`src/config.ts` — the anon key is public by design.)

## 5. Use it

- **Public site:** `https://rhicksrad.github.io/bee/`
- **Her admin panel:** `https://rhicksrad.github.io/bee/admin.html` — also linked as
  "Vet's door" in the site footer.

In the Vet's Desk she can:

- **Questions** — see new reader questions, write an answer and publish it to the
  mailbag, hide anything spammy, or delete hidden ones.
- **Stories** — write blog posts (plain text, with optional `**bold**`, `# headings`,
  `- lists`, and links), add a cover photo, and publish/unpublish or save drafts.
- **Photos** — upload pet photos that join the 3D carousel, with labels and captions.

Visitors can read published stories, browse the gallery, play the mini game, read
answered questions, and submit their own — no account needed.

## Troubleshooting

- **"row-level security" errors in the admin panel** — the logged-in email is not in the
  `admins` table. Fix in SQL Editor:
  `insert into public.admins (email) values ('her@email.com');`
- **Site shows the three placeholder "Field Notes"** — no published stories were found:
  either the GitHub secrets aren't set (rebuild after adding them) or every story is
  still a draft.
- **Login says "Email not confirmed"** — recreate the user with **Auto confirm user**
  checked, or confirm the email from Authentication → Users.
