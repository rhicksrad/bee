import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

export type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  author_name: string;
  question_text: string;
  answer_text: string | null;
  status: 'pending' | 'answered' | 'hidden';
  created_at: string;
  answered_at: string | null;
};

export type Photo = {
  id: string;
  image_url: string;
  storage_path: string | null;
  label: string;
  caption: string;
  sort_order: number;
  created_at: string;
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
