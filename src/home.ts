import { getSupabase, formatDate, type Post } from './supabase';
import { escapeHtml as esc } from './markdown';
import { excerpt } from './stories-shared';

// The static field-note cards in index.html are the fallback; if the vet
// has published stories, replace them with the three most recent.
async function loadLatestStories() {
  const supabase = getSupabase();
  const grid = document.querySelector<HTMLDivElement>('#latest-stories');
  if (!supabase || !grid) return;

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return;

  grid.innerHTML = (data as Post[])
    .map(
      (post) => `
        <a class="blog-card blog-card-live" href="./stories.html?story=${encodeURIComponent(post.slug)}">
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

void loadLatestStories();
