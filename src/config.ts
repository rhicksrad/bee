// Supabase connection settings.
//
// For local dev, create a `.env.local` file next to package.json:
//   VITE_SUPABASE_URL=https://yourproject.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
//
// For the deployed site, add the same two values as GitHub Actions
// secrets (see SETUP.md). The anon key is safe to expose publicly —
// all real protection comes from the database's row-level security.
//
// Alternatively, you can paste the values directly into the
// fallback strings below and commit them.

export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'PASTE_YOUR_SUPABASE_URL_HERE';

export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;
