import { getSupabase, formatDate, type Post } from './supabase';
import { escapeHtml as esc } from './markdown';
import { excerpt } from './stories-shared';

// Old deep links (stories.html?story=slug) redirect to the story's own page.
const requested = new URLSearchParams(location.search).get('story');
if (requested && /^[a-z0-9-]+$/.test(requested)) {
  location.replace(`./story/${requested}.html`);
}

async function loadPosts() {
  const supabase = getSupabase();
  const grid = document.querySelector<HTMLDivElement>('#blog-grid');
  if (!supabase || !grid) return; // the static empty-state note stays

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return;

  grid.innerHTML = (data as Post[])
    .map(
      (post) => `
        <a class="blog-card blog-card-live" href="./story/${encodeURIComponent(post.slug)}.html">
          ${post.cover_image_url ? `<img class="blog-card-cover" src="${esc(post.cover_image_url)}" alt="" loading="lazy" />` : ''}
          <span>${esc(formatDate(post.created_at))}</span>
          <h3>${esc(post.title)}</h3>
          <p>${esc(excerpt(post.body))}</p>
          <span class="read-more">Read the full story →</span>
        </a>
      `
    )
    .join('');
}

void loadPosts();
