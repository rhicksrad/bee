// Served as the GitHub Pages 404 page. If the missing URL is a story
// page that hasn't been statically generated yet (stories publish
// instantly; pages regenerate on the next nightly build), render the
// story live from the database. Anything else gets a friendly 404.

import { getSupabase, formatDate, type Post } from './supabase';
import { renderMarkdown, escapeHtml as esc } from './markdown';

const root = document.querySelector<HTMLDivElement>('#story-root');
if (!root) throw new Error('Story root not found');

function notFound() {
  document.title = 'Page not found | The Vet From Persia';
  root!.innerHTML = `
    <header class="page-head">
      <p class="kicker">Lost in the parlor</p>
      <h1>This page wandered off</h1>
      <p>Maybe it's napping in a sunny window. Try the <a href="/bee/">home page</a>
      or the <a href="/bee/stories.html">stories</a>.</p>
    </header>
  `;
}

function renderStory(post: Post) {
  document.title = `${post.title} | The Vet From Persia`;
  root!.innerHTML = `
    <article class="story-article">
      <header class="page-head">
        <p class="kicker">${esc(formatDate(post.created_at))}</p>
        <h1>${esc(post.title)}</h1>
      </header>
      ${post.cover_image_url ? `<img class="post-cover" src="${esc(post.cover_image_url)}" alt="" />` : ''}
      <div class="post-body">${renderMarkdown(post.body)}</div>
      <p class="story-back"><a href="/bee/stories.html">← All stories</a></p>
    </article>
  `;
}

async function main() {
  const params = new URLSearchParams(location.search);
  const pathMatch = location.pathname.match(/\/story\/([a-z0-9-]+)\.html$/);
  const slug = params.get('slug') ?? pathMatch?.[1];

  const supabase = getSupabase();
  if (!slug || !supabase) {
    notFound();
    return;
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .limit(1);

  if (error || !data || data.length === 0) {
    notFound();
    return;
  }
  renderStory(data[0] as Post);
}

void main();
